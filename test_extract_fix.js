function formatRaceName(name) {
    let raceTypes = [];
    let cleanName = name;

    // Ordered by priority/length
    const typePatterns = [
        "Backyard Ultra", "Backyard", "Ultra Trail", "Trail", "Ultrarun", "Ultra", "Marathon", "Run", "Loop"
    ];

    for (const t of typePatterns) {
        // Use regex with word boundaries, but allow words to be adjacent to colons or hyphens without word boundary issues?
        // Wait, "trail:" or "backyard-variant:" are not strictly separated by spaces but we want to remove them.
        const regex = new RegExp(`(^|\\b|\\W)(${t})($|\\b|\\W)`, "ig");
        if (regex.test(cleanName)) {
            // Need to safely add unique race type without modifying `t` array reference issues
            if (!raceTypes.includes(t)) {
                 // only push once in case of multiple matches
                 raceTypes.push(t);
            }

            // replace preserving the surrounding non-word chars if any, or just stripping the word
            // Actually, replacing with just word boundaries is safer, but "trail:" will match `\btrail\b`
            // Let's replace the matched group
            cleanName = cleanName.replace(regex, "$1$3");
        }
    }

    // Clean up leftover punctuation and spaces
    cleanName = cleanName.replace(/\(\s*\)/g, ''); // empty parens
    cleanName = cleanName.replace(/:\s*$/, ''); // trailing colons
    cleanName = cleanName.replace(/^:\s*/, ''); // leading colons
    cleanName = cleanName.replace(/\s+-\s*$/g, ''); // trailing dash
    cleanName = cleanName.replace(/^\s*-\s+/g, ''); // leading dash
    cleanName = cleanName.replace(/^-/, ''); // leading dash without spaces
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
  "backyard-variant: LOOP trail 12 uur en max. 84 km",
  "trailmarathon: Verlaines Runners Trail",
  "trail: RFR Hart van Drenthe 52 en 43 km",
  "The Bello Gallico Trail 50mi"
];

races.forEach(r => {
    const res = formatRaceName(r);
    console.log(`Original: "${r}" -> Name: "${res.name}" | Type: "${res.type}"`);
});
