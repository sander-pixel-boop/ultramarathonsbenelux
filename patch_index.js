const fs = require('fs');

const file = 'pages/index.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /<h2>\{formattedRace\.name\}<\/h2>/,
    "<h2>{race.organizer_name ? `${race.organizer_name} - ` : ''}{formattedRace.name} {new Date(race.date_iso || race.date).getFullYear()}</h2>"
);

content = content.replace(
    /<h2>\{selectedRace\.formattedRace\.name\}<\/h2>/,
    "<h2>{selectedRace.organizer_name ? `${selectedRace.organizer_name} - ` : ''}{selectedRace.formattedRace.name} {new Date(selectedRace.date_iso || selectedRace.date).getFullYear()}</h2>"
);

fs.writeFileSync(file, content);
