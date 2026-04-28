const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, 'audit_log.csv');
const PERMANENT_FIXES_FILE = path.join(__dirname, '../data/permanent_fixes.json');
const RACES_FILE = path.join(__dirname, '../data/races.json');

function runLearning() {
    if (!fs.existsSync(AUDIT_FILE)) {
        console.log("No audit_log.csv found. Exiting.");
        return;
    }

    const csvData = fs.readFileSync(AUDIT_FILE, 'utf8');
    const lines = csvData.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return;

    let races = [];
    if (fs.existsSync(RACES_FILE)) {
        races = JSON.parse(fs.readFileSync(RACES_FILE, 'utf8'));
    }

    let permanentFixes = {};
    if (fs.existsSync(PERMANENT_FIXES_FILE)) {
        permanentFixes = JSON.parse(fs.readFileSync(PERMANENT_FIXES_FILE, 'utf8'));
    }

    // Header: Status,Organizer,Race Name,Nominal KM,Actual KM,Date,Reg URL,Site URL,Correction?
    // We parse simply by splitting on comma, but respecting quotes.
    // Since this is a simple script, we use a basic regex parser for CSV.
    function parseCSVLine(line) {
        const result = [];
        let cur = '';
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                inQuote = !inQuote;
            } else if (line[i] === ',' && !inQuote) {
                result.push(cur);
                cur = '';
            } else {
                cur += line[i];
            }
        }
        result.push(cur);
        return result.map(s => s.trim());
    }

    let changesMade = false;

    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length < 9) continue;

        const correction = row[8].toUpperCase();
        if (correction === 'FIX') {
            const organizer = row[1];
            const raceName = row[2];
            const actualKm = parseFloat(row[4]);
            const dateIso = row[5];
            const regUrl = row[6];
            const siteUrl = row[7];

            // Find matching race by Date and Race Name (or close enough)
            const matchIndex = races.findIndex(r => r.date_iso === dateIso && r.name === raceName);

            if (matchIndex !== -1) {
                const r = races[matchIndex];

                // Track what we changed to save it permanently
                const fixObj = {};
                let updated = false;

                if (organizer !== r.organizer_name) { fixObj.organizer_name = organizer; updated = true; }
                if (!isNaN(actualKm) && actualKm !== r.dist_km) { fixObj.dist_km = actualKm; updated = true; }
                if (regUrl !== r.registration_url) { fixObj.registration_url = regUrl; updated = true; }
                if (siteUrl !== r.official_site_url) { fixObj.official_site_url = siteUrl; updated = true; }

                if (updated) {
                    Object.assign(r, fixObj);
                    permanentFixes[r.race_id] = { ...(permanentFixes[r.race_id] || {}), ...fixObj };
                    changesMade = true;
                    console.log(`Applied manual FIX for ${r.name} (${r.race_id})`);
                }
            } else {
                console.warn(`FIX requested for ${raceName} on ${dateIso} but no matching race found in JSON.`);
            }
        }
    }

    if (changesMade) {
        fs.writeFileSync(RACES_FILE, JSON.stringify(races, null, 2));
        fs.writeFileSync(PERMANENT_FIXES_FILE, JSON.stringify(permanentFixes, null, 2));
        console.log("Updated races.json and permanent_fixes.json with manual corrections.");
    } else {
        console.log("No fixes to apply.");
    }
}

runLearning();
