import Head from 'next/head';
import "leaflet/dist/leaflet.css";
import '../styles/global.css';
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <>

      <Head>
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
      </Head>
      <Component {...pageProps} />
      <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || 'ca-pub-8237448051425451'}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
    </>
  );
}
