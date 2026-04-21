/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  async rewrites() {
    return [
      // Pretty alias so the URL we hand to Notion ends in `.png`. Notion's
      // gallery view "Card preview" picker often refuses to render external
      // images whose URL has no recognizable extension before the query
      // string — even though Content-Type is set correctly.
      { source: '/cover.png', destination: '/api/cover' },
    ];
  },
};

export default nextConfig;
