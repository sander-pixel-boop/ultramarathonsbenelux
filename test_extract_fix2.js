function formatRaceName(name) {
    let raceTypes = [];
    let cleanName = name;

    // Ordered by priority/length
    const typePatterns = [
        "Backyard Ultra", "Backyard", "Ultra Trail", "Trail", "Ultrarun", "Ultra", "Marathon", "Run", "Loop"
    ];

    for (const t of typePatterns) {
        // We can just find the string t (case insensitive) inside the cleanName, even inside compound words like "trailmarathon"
        // Wait, if it's inside a word, replacing it might create weird names like "marathon" -> "".
        // Example "trailmarathon" -> "trail" removed -> "marathon". "marathon" removed -> ""
        // Let's use word boundaries or just replace globally.
        const regex = new RegExp(t, "ig"); // no word boundaries!
        if (regex.test(cleanName)) {
            if (!raceTypes.includes(t)) {
                 raceTypes.push(t);
            }
            cleanName = cleanName.replace(regex, "");
        }
    }

    // Clean up leftover punctuation and spaces
    cleanName = cleanName.replace(/\(\s*\)/g, ''); // empty parens
    cleanName = cleanName.replace(/:\s*$/, ''); // trailing colons
    cleanName = cleanName.replace(/^:\s*/, ''); // leading colons
    cleanName = cleanName.replace(/\s+-\s*$/g, ''); // trailing dash
    cleanName = cleanName.replace(/^\s*-\s+/g, ''); // leading dash
    cleanName = cleanName.replace(/^-/, ''); // leading dash without spaces
    cleanName = cleanName.replace(/-\s*variant:\s*/g, ''); // clean up "backyard-variant:" -> "-variant:"
    cleanName = cleanName.replace(/^variant:\s*/i, ''); // clean up "variant:"
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
