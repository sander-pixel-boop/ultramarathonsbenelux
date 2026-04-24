import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <Head>
                <title>Privacy Policy | Benelux Ultra Race Directory</title>
            </Head>

            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <i className="fas fa-arrow-left"></i> Back to Home
            </Link>

            <h1 style={{ marginBottom: '20px', fontSize: '2.5em', color: '#0f172a' }}>Privacy Policy</h1>

            <div style={{ lineHeight: '1.6', color: '#334155' }}>
                <p>Last updated: April 24, 2024</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>1. Information We Collect</h2>
                <p>We do not collect any personal data when you visit our website. We do not use cookies or any tracking technologies. The site is a static directory of information.</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>2. External Links</h2>
                <p>Our website contains links to external websites (race organizers, registration platforms, and affiliate links). We are not responsible for the privacy practices or the content of these external sites.</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>3. Affiliate Links</h2>
                <p>Some links on this site may be affiliate links. When you click on these links and make a purchase, we may earn a small commission at no extra cost to you. This does not involve tracking your personal data on our site.</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>4. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page.</p>
            </div>
        </div>
    );
}
