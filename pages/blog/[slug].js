import Head from 'next/head';
import Link from 'next/link';
import blogs from '../../data/blog.json';

export default function BlogPost({ blog }) {
  if (!blog) return <div>Post not found</div>;

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Head>
        <title>{blog.title} | Trail Running Blog</title>
        <meta name="description" content={blog.excerpt} />
      </Head>

      <div style={{ marginBottom: '20px' }}>
        <Link href="/blog" style={{ color: '#0070f3', textDecoration: 'none' }}>&larr; Back to all posts</Link>
      </div>

      <h1>{blog.title}</h1>
      <div style={{ color: '#666', marginBottom: '20px' }}>Published on {blog.date}</div>

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
        style={{ lineHeight: '1.6' }}
      />
    </div>
  );
}

export async function getStaticPaths() {
  const paths = blogs.map((blog) => ({
    params: { slug: blog.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const blog = blogs.find((b) => b.slug === params.slug);
  return { props: { blog } };
}
