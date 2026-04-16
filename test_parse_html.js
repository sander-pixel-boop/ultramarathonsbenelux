const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// We just want to check if the logic is correct inside formatRaceName
function formatRaceName(name) {
    let raceTypes = [];
    let cleanName = name;

    // Ordered by priority/length
    const typePatterns = [
        "Backyard Ultra", "Backyard", "Ultra Trail", "Trail", "Ultrarun", "Ultra", "Marathon", "Run", "Loop"
    ];

    for (const t of typePatterns) {
        // Use regex with word boundaries. Case insensitive.
        const regex = new RegExp(`\\b${t}\\b`, "i");
        if (regex.test(cleanName)) {
            raceTypes.push(t);
            // Replace all occurrences of this type
            cleanName = cleanName.replace(new RegExp(`\\b${t}\\b`, "ig"), "");
        }
    }

    // Clean up leftover punctuation and spaces
    cleanName = cleanName.replace(/\(\s*\)/g, ''); // empty parens
    cleanName = cleanName.replace(/\s+-\s*$/g, ''); // trailing dash
    cleanName = cleanName.replace(/^\s*-\s+/g, ''); // leading dash
    cleanName = cleanName.replace(/\s+-\s+/g, ' - '); // fix dashes in middle
    cleanName = cleanName.replace(/\s{2,}/g, ' '); // multiple spaces
    cleanName = cleanName.trim();

    // If we stripped everything, revert to original name and no type extracted
    if (cleanName === "") {
        cleanName = name;
        raceTypes = [];
    }

    let displayType = raceTypes.length > 0 ? raceTypes.join(", ") : "Race";
    return { name: cleanName, type: displayType };
}

const races = [
    {name: "The Bello Gallico Trail 50mi"},
    {name: "3 De Wase (Halve en Ultra) Marathon"}
];

races.forEach(r => {
    const formatted = formatRaceName(r.name);
    console.log(`Original: ${r.name}`);
    console.log(`Title: ${formatted.name}`);
    console.log(`Type Box: ${formatted.type}\n`);
});
