import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'races.json');

export default function sitemap() {
    let races = [];
    if (fs.existsSync(DATA_FILE)) {
        races = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }

    const baseUrl = 'https://ultramarathonsbenelux.com';

    const raceUrls = races.map((race) => ({
        url: `${baseUrl}/races/${race.slug}`,
        lastModified: race.verified_at ? new Date(race.verified_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...raceUrls,
    ];
}
