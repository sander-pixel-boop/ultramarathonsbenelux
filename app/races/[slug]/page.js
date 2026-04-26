import fs from 'fs';
import path from 'path';
import AffiliateGearBlock from '../../../components/AffiliateGearBlock';
import BookingWidget from '../../../components/BookingWidget';

const DATA_FILE = path.join(process.cwd(), 'data', 'races.json');

function getRaces() {
    if(!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

export async function generateStaticParams() {
    const races = getRaces();
    return races.map((race) => ({
        slug: race.slug,
    }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const races = getRaces();
    const race = races.find(r => r.slug === slug);

    if (!race) {
        return { title: 'Race Not Found' };
    }

    const year = new Date(race.date_iso).getFullYear();
    return {
        title: `${race.name} ${year} | Course, Elevation & Tips | Ultra Marathons Benelux`,
        description: `Guide for ${race.name} in ${race.city}. Distance: ${race.dist_km}KM, Elevation: ${race.elev_m}M. View registration details and mandatory gear.`,
        alternates: {
            canonical: `https://ultramarathonsbenelux.com/races/${slug}`
        }
    };
}

export default async function RacePage({ params }) {
    const { slug } = await params;
    const races = getRaces();
    const race = races.find(r => r.slug === slug);

    if (!race) {
        return <div>Race not found</div>;
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": race.name,
        "startDate": race.date_iso,
        "location": {
            "@type": "Place",
            "name": `${race.city}, ${race.country}`
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <h1>{race.name}</h1>
            <p><strong>Date:</strong> {race.date_iso}</p>
            <p><strong>Location:</strong> {race.city}, {race.country}</p>
            <p><strong>Distance:</strong> {race.dist_km} KM</p>
            <p><strong>Elevation:</strong> {race.elev_m} M</p>
            <p><strong>Difficulty Score:</strong> {race.difficulty_score}</p>
            <p><strong>Effort KM:</strong> {race.effort_km} KM</p>

            <a href={race.registration_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                View Registration Details
            </a>

            <hr style={{ margin: '30px 0' }} />

            <AffiliateGearBlock elev_m={race.elev_m} surface_trail_pct={race.surface_trail_pct} date_iso={race.date_iso} />
            <BookingWidget city={race.city} country={race.country} />

        </div>
    );
}
