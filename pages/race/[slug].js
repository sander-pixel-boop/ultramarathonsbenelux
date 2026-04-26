import Head from 'next/head';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export default function RacePage({ race }) {
  if (!race) return <div>Race not found</div>;

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Head>
        <title>{race.name} | Ultramarathons Benelux</title>
        <meta name="description" content={`Details for ${race.name} in ${race.city || race.country}.`} />
        {/* Canonical Link Added */}
        <link rel="canonical" href={`https://www.ultramarathonsbenelux.com/race/${race.slug}`} />

        {/* JSON-LD Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": race.name,
              "startDate": race.startDate || race.date,
              "location": {
                "@type": "Place",
                "name": race.city || race.country,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": race.city,
                  "addressCountry": race.country
                }
              },
              "description": `Join the ${race.name} on ${race.date} in ${race.city || race.country}. Distance: ${race.distance}.`,
              "url": `https://www.ultramarathonsbenelux.com/race/${race.slug}`
            })
          }}
        />
      </Head>

      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>&larr; Back to all races</Link>
      </div>

      <h1>{race.name}</h1>
      <div style={{ color: '#666', marginBottom: '20px' }}>
        <p><strong>Date:</strong> {race.date}</p>
        <p><strong>Distance:</strong> {race.distance}</p>
        <p><strong>Location:</strong> {race.city ? `${race.city}, ${race.country}` : race.country}</p>
        <p><strong>More info:</strong> <a href={race.url} target="_blank" rel="noopener noreferrer">{race.url}</a></p>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const dataPath = path.join(process.cwd(), 'races.json');
  const racesJson = fs.readFileSync(dataPath, 'utf8');
  const races = JSON.parse(racesJson);

  // Generate paths based on slugs.
  // Need to ensure all races have slugs!
  const paths = races
    .filter(r => r.slug)
    .map((race) => ({
      params: { slug: race.slug },
    }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const dataPath = path.join(process.cwd(), 'races.json');
  const racesJson = fs.readFileSync(dataPath, 'utf8');
  const races = JSON.parse(racesJson);

  const race = races.find((r) => r.slug === params.slug);

  if (!race) {
    return { notFound: true };
  }

  // Ensure startDate exists for schema, parse it roughly
  // The memory mentions: Date parsing logic is centralized in utils/date.js
  const parsedDate = require('../../utils/date.js').parseStandardDate(race.date);
  if (parsedDate) {
     race.startDate = `${parsedDate.year}-${String(parsedDate.month).padStart(2, '0')}-${String(parsedDate.day).padStart(2, '0')}`;
  } else {
     race.startDate = race.date; // Fallback
  }

  return { props: { race } };
}
