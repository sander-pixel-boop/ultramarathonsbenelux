const fs = require('fs/promises');
const path = require('path');

const AUDIT_LOG_PATH = path.join(__dirname, '../data/audit_log.csv');
const RACES_JSON_PATH = path.join(__dirname, '../data/races.json');
const PERMANENT_FIXES_PATH = path.join(__dirname, '../data/permanent_fixes.json');

async function main() {
    try {
        let auditCsv;
        try {
            auditCsv = await fs.readFile(AUDIT_LOG_PATH, 'utf-8');
        } catch (e) {
            console.error(`Audit log not found at ${AUDIT_LOG_PATH}. Run the scraper first.`);
            return;
        }

        const racesJson = await fs.readFile(RACES_JSON_PATH, 'utf-8');
        let races = JSON.parse(racesJson);

        let permanentFixes = {};
        try {
            const fixesJson = await fs.readFile(PERMANENT_FIXES_PATH, 'utf-8');
            permanentFixes = JSON.parse(fixesJson);
        } catch (e) {
            // File might not exist yet, which is fine
        }

        const lines = auditCsv.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) {
             console.log('No data rows found in audit_log.csv');
             return;
        }

        const headers = lines[0].split(',').map(h => h.trim());

        const correctedRaces = [];

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i];

            // Regex to parse CSV keeping quoted strings intact
            // Split by comma, handling quotes
            let inQuotes = false;
            let currentVal = '';
            const values = [];
            for (let j = 0; j < row.length; j++) {
                const char = row[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentVal.trim());
                    currentVal = '';
                } else {
                    currentVal += char;
                }
            }
            values.push(currentVal.trim());

            const entry = {};
            headers.forEach((h, index) => {
                entry[h] = values[index] !== undefined ? values[index] : '';
            });

            // Apply any corrected fields
            const fieldsToCorrect = [
                { key: 'corrected_distance', target: 'distance' },
                { key: 'corrected_name', target: 'name' },
                { key: 'corrected_date', target: 'date' },
                { key: 'corrected_elevation', target: 'elevation' },
                { key: 'corrected_city', target: 'city' },
                { key: 'corrected_country', target: 'country' },
                { key: 'remove', target: 'remove' }
            ];

            let hasCorrections = false;
            const slug = entry.slug;
            if (!slug) continue;

            fieldsToCorrect.forEach(field => {
                if (entry[field.key] && entry[field.key] !== '') {
                    hasCorrections = true;

                    // 1. Record the permanent fix
                    if (!permanentFixes[slug]) {
                        permanentFixes[slug] = {};
                    }
                    if (field.key === 'remove') {
                        permanentFixes[slug][field.target] = true;
                    } else {
                        permanentFixes[slug][field.target] = entry[field.key];
                    }

                    // 2. Apply to races.json (if not remove)
                    if (field.key !== 'remove') {
                        const raceIndex = races.findIndex(r => r.slug === slug);
                        if (raceIndex !== -1) {
                            races[raceIndex][field.target] = entry[field.key];
                        }
                    }
                }
            });

            if (hasCorrections) {
                correctedRaces.push(slug);
            }
        }

        if (correctedRaces.length > 0) {
            // Remove races flagged for removal
            races = races.filter(r => !permanentFixes[r.slug] || !permanentFixes[r.slug].remove);

            await fs.writeFile(PERMANENT_FIXES_PATH, JSON.stringify(permanentFixes, null, 4));
            await fs.writeFile(RACES_JSON_PATH, JSON.stringify(races, null, 4));
            console.log(`Successfully applied ${correctedRaces.length} corrections and saved to permanent_fixes.json`);
        } else {
            console.log('No corrections found in audit_log.csv');
        }

    } catch (error) {
        console.error('Error in learning script:', error.message);
    }
}

main();
