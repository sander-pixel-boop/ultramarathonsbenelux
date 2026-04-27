const fs = require('fs');

const file = 'app/races/[slug]/page.js';
let content = fs.readFileSync(file, 'utf8');

// Title in metadata
content = content.replace(
    /title: `\$\{race\.name\} \$\{year\} \| Course, Elevation & Tips \| Ultra Marathons Benelux`,/,
    "title: `${race.organizer_name ? race.organizer_name + ' - ' : ''}${race.name} ${year} | Course, Elevation & Tips | Ultra Marathons Benelux`,"
);

// H1 tag
content = content.replace(
    /<h1>\{race\.name\}<\/h1>/,
    "<h1>{race.organizer_name ? `${race.organizer_name} - ` : ''}{race.name} {new Date(race.date_iso).getFullYear()}</h1>"
);

// Buttons
content = content.replace(
    /<a href=\{sanitizeUrl\(race\.registration_url\)\} target="_blank" rel="noopener noreferrer" style=\{\{ display: 'inline-block', marginTop: '10px', padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', textDecoration: 'none', borderRadius: '5px' \}\}>\n\s+View Registration Details\n\s+<\/a>/,
    `<div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <a href={sanitizeUrl(race.registration_page || race.registration_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                    Register for this Race
                </a>
                <a href={sanitizeUrl(race.event_homepage || race.official_site_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#e0e0e0', color: '#333', textDecoration: 'none', borderRadius: '5px' }}>
                    Official Website
                </a>
            </div>`
);

fs.writeFileSync(file, content);
