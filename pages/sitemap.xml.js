import fs from 'fs';
import path from 'path';

export default function Sitemap() {
  return null;
}

export const getServerSideProps = async ({ res }) => {
  const BASE_URL = 'https://ultramarathonsbenelux.com';

  // Static routes
  const staticPaths = [
    '/',
    '/about',
    '/disclaimer',
    '/privacy',
    '/terms',
    '/blog'
  ];

  // Dynamic routes (blog posts)
  const blogDataPath = path.join(process.cwd(), 'data', 'blog.json');
  let blogPaths = [];
  try {
    const blogJson = fs.readFileSync(blogDataPath, 'utf8');
    const blogs = JSON.parse(blogJson);
    blogPaths = blogs.map((post) => `/blog/${post.slug}`);
  } catch (error) {
    console.error('Error reading blog.json for sitemap:', error);
  }

  const allPaths = [...staticPaths, ...blogPaths];

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allPaths
        .map((route) => {
          return `
            <url>
              <loc>${BASE_URL}${route}</loc>
              <changefreq>daily</changefreq>
              <priority>${route === '/' ? '1.0' : '0.8'}</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};
