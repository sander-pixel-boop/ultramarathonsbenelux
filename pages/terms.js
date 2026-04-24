import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <Head>
                <title>Terms of Service | Benelux Ultra Race Directory</title>
            </Head>

            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <i className="fas fa-arrow-left"></i> Back to Home
            </Link>

            <h1 style={{ marginBottom: '20px', fontSize: '2.5em', color: '#0f172a' }}>Terms of Service</h1>

            <div style={{ lineHeight: '1.6', color: '#334155' }}>
                <p>Last updated: April 24, 2024</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>1. Acceptance of Terms</h2>
                <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>2. Use of Information</h2>
                <p>The information provided on this website is for general informational purposes only. We aggregate data about ultra races in the Benelux region. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information.</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>3. User Responsibility</h2>
                <p>It is your responsibility to verify any information (such as race dates, distances, locations, and requirements) directly with the official race organizers before making any travel arrangements or paying registration fees.</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>4. Modifications</h2>
                <p>We reserve the right to modify these terms at any time. Your continued use of the site after any such changes constitutes your acceptance of the new Terms of Service.</p>
            </div>
        </div>
    );
}
