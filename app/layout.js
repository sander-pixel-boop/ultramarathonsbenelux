import Script from 'next/script';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID && (
                    <Script
                        async
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}`}
                        crossOrigin="anonymous"
                        strategy="afterInteractive"
                    />
                )}
            </head>
            <body>
                <header style={{ padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
                    <nav>
                        <a href="/" style={{ marginRight: '15px' }}>Home</a>
                        <a href="/privacy" style={{ marginRight: '15px' }}>Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
                    </nav>
                </header>

                <main style={{ minHeight: '80vh' }}>
                    {children}
                </main>

                <footer style={{ padding: '20px', backgroundColor: '#343a40', color: '#fff', textAlign: 'center' }}>
                    <p>We earn a commission from links on this site at no extra cost to you.</p>
                </footer>
            </body>
        </html>
    );
}
