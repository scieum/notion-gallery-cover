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
