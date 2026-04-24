import Head from 'next/head';
import Link from 'next/link';

export default function Disclaimer() {
    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <Head>
                <title>Disclaimer | Benelux Ultra Race Directory</title>
            </Head>

            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <i className="fas fa-arrow-left"></i> Back to Home
            </Link>

            <h1 style={{ marginBottom: '20px', fontSize: '2.5em', color: '#0f172a' }}>Disclaimer</h1>

            <div style={{ lineHeight: '1.6', color: '#334155' }}>
                <p>Last updated: April 24, 2024</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>1. General Information</h2>
                <p>The information contained on this website is for general information purposes only. The information is provided by Benelux Ultra Race Directory and while we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>2. Risk Acknowledgment</h2>
                <p>Ultra running and participation in the events listed on this site involves significant risk of injury or death. You acknowledge that you participate in these events entirely at your own risk. We are not responsible for any injury, loss, or damage that may occur while participating in any event listed on this website.</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>3. External Links Disclaimer</h2>
                <p>Through this website, you are able to link to other websites which are not under the control of Benelux Ultra Race Directory. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.</p>

                <h2 style={{ marginTop: '30px', color: '#1e293b' }}>4. Affiliate Disclaimer</h2>
                <p>This website may contain links to affiliate websites, and we receive an affiliate commission for any purchases made by you on the affiliate website using such links. This helps support the maintenance of this directory at no additional cost to you.</p>
            </div>
        </div>
    );
}
