import Head from 'next/head';
import "leaflet/dist/leaflet.css";
import '../styles/global.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
      </Head>
      <Component {...pageProps} />
    </>
  );
}
