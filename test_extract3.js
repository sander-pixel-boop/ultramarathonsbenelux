const races = [
  "The Bello Gallico Trail 50mi",
  "Grand Trail des Lacs et Châteaux Winter",
  "4. Antwerp Backyard Ultra",
  "La Chouffe Trail 51km",
  "3 De Wase (Halve en Ultra) Marathon",
  "De Warmste Loop - The Warmest Run",
  "L.A.T Legends Ardennes Trail 100km",
  "17e Ohm Trail - XL",
  "Until the End - Backyard Ultra"
];

function formatRaceName(name) {
    let raceTypes = [];
    let cleanName = name;

    // Ordered by priority/length
    const typePatterns = [
        "Backyard Ultra", "Backyard", "Ultra Trail", "Trail", "Ultrarun", "Ultra", "Marathon", "Run", "Loop"
    ];

    // We only want to extract the PRIMARY type, or maybe multiple types?
    // The user said: "do not show the race type in the title but show it in the box"

    for (const t of typePatterns) {
        // Use regex with word boundaries. Case insensitive.
        const regex = new RegExp(`\\b${t}\\b`, "i");
        if (regex.test(cleanName)) {
            // we found a type! Let's extract it.
            raceTypes.push(t);
            // Replace all occurrences of this type
            cleanName = cleanName.replace(new RegExp(`\\b${t}\\b`, "ig"), "");
            // If we found 'Backyard Ultra', we shouldn't also find 'Ultra' or 'Backyard'
            // because we removed it.
        }
    }

    // Special case for 'Halve en Ultra Marathon' etc.

    // Clean up leftover punctuation and spaces
    cleanName = cleanName.replace(/\(\s*\)/g, ''); // empty parens
    cleanName = cleanName.replace(/\s+-\s*$/g, ''); // trailing dash
    cleanName = cleanName.replace(/^\s*-\s+/g, ''); // leading dash
    cleanName = cleanName.replace(/\s+-\s+/g, ' - '); // fix dashes in middle
    cleanName = cleanName.replace(/\s{2,}/g, ' '); // multiple spaces
    cleanName = cleanName.trim();

    // If we stripped everything, revert to original name and no type extracted?
    // e.g. if the race is literally just "Trail"
    if (cleanName === "") {
        cleanName = name;
        raceTypes = [];
    }

    let displayType = raceTypes.length > 0 ? raceTypes.join(" ") : "Race";
    return { name: cleanName, type: displayType };
}

races.forEach(r => {
    const res = formatRaceName(r);
    console.log(`Original: "${r}" -> Name: "${res.name}" | Type: "${res.type}"`);
});
