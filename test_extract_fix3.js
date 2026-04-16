function formatRaceName(name) {
    let raceTypes = [];
    let cleanName = name;

    // Ordered by priority/length
    const typePatterns = [
        "Backyard Ultra", "Backyard", "Ultra Trail", "Trail", "Ultrarun", "Ultra", "Marathon", "Run", "Loop"
    ];

    for (const t of typePatterns) {
        // Use regex with word boundaries.
        // We want to handle compound words like "trailmarathon" or "backyard-variant"
        // Let's first replace compound types into separated, or just use \b but be careful
        // Actually, JavaScript \b considers hyphens as word boundaries, but NOT letters adjacent to letters.
        // So \btrail\b matches "trail:", "trail-marathon", but NOT "trailmarathon".

        // Let's modify the name slightly before regexing to separate known combined words?
        // Like "trailmarathon" -> "trail marathon"

        const regex = new RegExp(`\\b${t}\\b`, "i");
        if (regex.test(cleanName)) {
            if (!raceTypes.includes(t)) {
                 raceTypes.push(t);
            }
            cleanName = cleanName.replace(new RegExp(`\\b${t}\\b`, "ig"), "");
        }
    }

    // Hardcoded replace for specific compound cases we see
    const compoundPatterns = ["trailmarathon", "ultramarathon", "ultratrail"];
    for (const c of compoundPatterns) {
        const regex = new RegExp(`\\b${c}\\b`, "i");
        if (regex.test(cleanName)) {
            if (c === "trailmarathon") {
                if(!raceTypes.includes("Trail")) raceTypes.push("Trail");
                if(!raceTypes.includes("Marathon")) raceTypes.push("Marathon");
            } else if (c === "ultramarathon") {
                if(!raceTypes.includes("Ultra")) raceTypes.push("Ultra");
                if(!raceTypes.includes("Marathon")) raceTypes.push("Marathon");
            } else if (c === "ultratrail") {
                if(!raceTypes.includes("Ultra")) raceTypes.push("Ultra");
                if(!raceTypes.includes("Trail")) raceTypes.push("Trail");
            }
            cleanName = cleanName.replace(new RegExp(`\\b${c}\\b`, "ig"), "");
        }
    }

    // Clean up leftover punctuation and spaces
    cleanName = cleanName.replace(/\(\s*\)/g, ''); // empty parens
    cleanName = cleanName.replace(/:\s*$/, ''); // trailing colons
    cleanName = cleanName.replace(/^:\s*/, ''); // leading colons
    cleanName = cleanName.replace(/\s+-\s*$/g, ''); // trailing dash
    cleanName = cleanName.replace(/^\s*-\s+/g, ''); // leading dash
    cleanName = cleanName.replace(/^-/, ''); // leading dash without spaces
    cleanName = cleanName.replace(/-\s*variant:\s*/i, ''); // clean up "backyard-variant:" -> "-variant:"
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
