import { Client } from '@notionhq/client';
import type { NotionPageLite, PropertyMeta } from './types';

export function getNotionClient(token: string) {
  if (!token) throw new Error('Missing Notion token');
  return new Client({ auth: token });
}

/** Extract plain text from a title-type property on a page. */
function extractTitle(page: any): string {
  const props = page?.properties ?? {};
  for (const key of Object.keys(props)) {
    const p = props[key];
    if (p?.type === 'title') {
      const text = (p.title ?? [])
        .map((t: any) => t?.plain_text ?? '')
        .join('')
        .trim();
      if (text) return text;
    }
  }
  return 'Untitled';
}

/**
 * Best-effort string coercion for any Notion property value. Returns an
 * empty string for empty/unsupported types — the caller should treat empty
 * as "skip this slot" rather than rendering literal "".
 */
function propertyToString(p: any): string {
  if (!p || !p.type) return '';
  switch (p.type) {
    case 'title':
    case 'rich_text': {
      const arr = p[p.type] ?? [];
      return arr.map((t: any) => t?.plain_text ?? '').join('').trim();
    }
    case 'number':
      return p.number != null ? String(p.number) : '';
    case 'select':
      return p.select?.name ?? '';
    case 'multi_select':
      return (p.multi_select ?? []).map((s: any) => s?.name ?? '').filter(Boolean).join(', ');
    case 'status':
      return p.status?.name ?? '';
    case 'date': {
      const d = p.date;
      if (!d) return '';
      return d.end ? `${d.start} ~ ${d.end}` : d.start ?? '';
    }
    case 'checkbox':
      return p.checkbox ? '✓' : '';
    case 'url':
      return p.url ?? '';
    case 'email':
      return p.email ?? '';
    case 'phone_number':
      return p.phone_number ?? '';
    case 'people':
      return (p.people ?? []).map((u: any) => u?.name ?? '').filter(Boolean).join(', ');
    case 'files':
      return (p.files ?? []).map((f: any) => f?.name ?? '').filter(Boolean).join(', ');
    case 'relation':
      return (p.relation ?? []).map((r: any) => r?.id ?? '').filter(Boolean).join(', ');
    case 'formula': {
      const f = p.formula;
      if (!f) return '';
      switch (f.type) {
        case 'string': return f.string ?? '';
        case 'number': return f.number != null ? String(f.number) : '';
        case 'boolean': return f.boolean ? '✓' : '';
        case 'date': return f.date?.start ?? '';
      }
      return '';
    }
    case 'rollup': {
      // Rollups are messy; just stringify the array of items shallowly.
      const r = p.rollup;
      if (!r) return '';
      if (r.type === 'number') return r.number != null ? String(r.number) : '';
      if (r.type === 'date') return r.date?.start ?? '';
      if (r.type === 'array') return (r.array ?? []).map(propertyToString).filter(Boolean).join(', ');
      return '';
    }
    case 'created_time':
      return p.created_time ?? '';
    case 'last_edited_time':
      return p.last_edited_time ?? '';
    case 'created_by':
      return p.created_by?.name ?? '';
    case 'last_edited_by':
      return p.last_edited_by?.name ?? '';
  }
  return '';
}

/** Map all properties on a page → { propertyName: stringValue }. */
function extractAllProperties(page: any): Record<string, string> {
  const out: Record<string, string> = {};
  const props = page?.properties ?? {};
  for (const key of Object.keys(props)) {
    out[key] = propertyToString(props[key]);
  }
  return out;
}

function extractCoverUrl(page: any): string | null {
  const c = page?.cover;
  if (!c) return null;
  if (c.type === 'external') return c.external?.url ?? null;
  if (c.type === 'file') return c.file?.url ?? null;
  return null;
}

export async function listDatabasePages(
  token: string,
  databaseId: string,
): Promise<NotionPageLite[]> {
  const notion = getNotionClient(token);
  const out: NotionPageLite[] = [];
  let cursor: string | undefined = undefined;
  do {
    const resp: any = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const page of resp.results) {
      out.push({
        id: page.id,
        title: extractTitle(page),
        currentCoverUrl: extractCoverUrl(page),
        url: page.url,
        properties: extractAllProperties(page),
      });
    }
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);
  return out;
}

export async function setPageCover(token: string, pageId: string, coverUrl: string) {
  const notion = getNotionClient(token);
  await notion.pages.update({
    page_id: pageId,
    cover: { type: 'external', external: { url: coverUrl } },
  });
}

export const GALLERY_COVER_PROPERTY = '갤러리 커버';

/**
 * Make sure the database has a Files & Media property with the given name.
 * Returns true if the property already existed, false if we just created it.
 *
 * Notion's `databases.update` is additive for `properties`: passing
 * `{ "<name>": { files: {} } }` adds the property if missing and is a no-op
 * (other than touching `last_edited_time`) if the same name already maps to
 * a `files` property. If a same-named property exists with a *different*
 * type we surface that as an error so we don't silently nuke the user's data.
 */
export async function ensureGalleryCoverProperty(
  token: string,
  databaseId: string,
  propertyName: string = GALLERY_COVER_PROPERTY,
): Promise<{ existed: boolean; propertyName: string }> {
  const notion = getNotionClient(token);
  const db: any = await notion.databases.retrieve({ database_id: databaseId });
  const existing = db?.properties?.[propertyName];
  if (existing) {
    if (existing.type !== 'files') {
      throw new Error(
        `데이터베이스에 "${propertyName}" 속성이 이미 있지만 타입이 "${existing.type}" 입니다. ` +
          `Files & Media 타입이어야 합니다.`,
      );
    }
    return { existed: true, propertyName };
  }
  await notion.databases.update({
    database_id: databaseId,
    properties: { [propertyName]: { files: {} } } as any,
  });
  return { existed: false, propertyName };
}

/**
 * List the schema of a database — name + type for every property. Used by
 * the UI so the user can map "대제목/중제목/소제목" slots to actual DB
 * properties.
 */
export async function listDatabaseProperties(
  token: string,
  databaseId: string,
): Promise<PropertyMeta[]> {
  const notion = getNotionClient(token);
  const db: any = await notion.databases.retrieve({ database_id: databaseId });
  const props = db?.properties ?? {};
  return Object.keys(props).map((key) => ({
    name: key,
    type: props[key]?.type ?? 'unknown',
  }));
}

/** Set the gallery-cover Files & Media property on a single page. */
export async function setPageGalleryCover(
  token: string,
  pageId: string,
  coverUrl: string,
  propertyName: string = GALLERY_COVER_PROPERTY,
  fileName: string = 'gallery-cover.png',
) {
  const notion = getNotionClient(token);
  await notion.pages.update({
    page_id: pageId,
    properties: {
      [propertyName]: {
        files: [
          {
            type: 'external',
            name: fileName,
            external: { url: coverUrl },
          },
        ],
      },
    } as any,
  });
}
