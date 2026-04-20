// Fetch a Korean-capable font at request time (edge-runtime friendly).
// We use Pretendard from jsDelivr. For production you may want to self-host
// (drop a .ttf in /public/fonts and fetch from the same origin).

const FONT_URLS = {
  regular:
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Regular.otf',
  bold:
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf',
  extrabold:
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-ExtraBold.otf',
};

let cache: { regular: ArrayBuffer; bold: ArrayBuffer; extrabold: ArrayBuffer } | null = null;

export async function loadFonts() {
  if (cache) return cache;
  const [regular, bold, extrabold] = await Promise.all([
    fetch(FONT_URLS.regular).then((r) => r.arrayBuffer()),
    fetch(FONT_URLS.bold).then((r) => r.arrayBuffer()),
    fetch(FONT_URLS.extrabold).then((r) => r.arrayBuffer()),
  ]);
  cache = { regular, bold, extrabold };
  return cache;
}
