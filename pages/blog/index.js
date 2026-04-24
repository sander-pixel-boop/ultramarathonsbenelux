import Head from 'next/head';
import Link from 'next/link';
import blogs from '../../data/blog.json';

export default function BlogList() {
  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Head>
        <title>Trail Running Blog & Gear Guides</title>
        <meta name="description" content="Editorial blog posts, gear guides, and race comparisons for trail runners." />
      </Head>

      <h1>Trail Running Blog</h1>
      <p>Latest articles, gear reviews, and tips for your next ultramarathon.</p>

      <div className="blog-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {blogs.map((blog) => (
          <div key={blog.slug} className="blog-card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h2><Link href={`/blog/${blog.slug}`}>{blog.title}</Link></h2>
            <div style={{ color: '#666', fontSize: '0.9em', marginBottom: '10px' }}>{blog.date}</div>
            <p>{blog.excerpt}</p>
            <Link href={`/blog/${blog.slug}`} style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>Read more &rarr;</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
