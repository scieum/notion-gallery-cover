import { Client } from '@notionhq/client';
import type { NotionPageLite } from './types';

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
