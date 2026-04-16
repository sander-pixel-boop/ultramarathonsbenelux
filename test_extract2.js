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

races.forEach(name => {
    let raceTypes = [];
    let cleanName = name;
    // Order matters, longest first
    const types = ["Backyard Ultra", "Backyard", "Ultra Trail", "Trail", "Ultra", "Marathon", "Run", "Loop"];

    for (const t of types) {
        const regex = new RegExp(`\\b${t}\\b`, "ig"); // ig to replace all occurrences
        if (regex.test(cleanName)) {
            // Find actual matched string to keep case or just use t? t is fine.
            raceTypes.push(t);
            cleanName = cleanName.replace(regex, "");
        }
    }

    // cleanup
    cleanName = cleanName.replace(/\(\s*\)/g, ''); // empty parens
    cleanName = cleanName.replace(/\s{2,}/g, ' '); // multiple spaces
    cleanName = cleanName.replace(/^[-–—]\s*/, ''); // leading dash
    cleanName = cleanName.replace(/\s*[-–—]$/, ''); // trailing dash
    cleanName = cleanName.replace(/\s*[-–—]\s*$/, ''); // trailing dash with spaces
    cleanName = cleanName.trim();

    if (cleanName === "") cleanName = name; // fallback

    let displayType = raceTypes.length > 0 ? raceTypes.join(" ") : "Race";
    console.log(`Original: "${name}" -> Name: "${cleanName}" | Type: "${displayType}"`);
});
