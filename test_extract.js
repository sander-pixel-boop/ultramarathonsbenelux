const races = [
  "The Bello Gallico Trail 50mi",
  "Grand Trail des Lacs et Châteaux Winter",
  "4. Antwerp Backyard Ultra",
  "La Chouffe Trail 51km",
  "3 De Wase (Halve en Ultra) Marathon"
];

function getRaceType(name) {
    let type = "Other";
    let cleanName = name;

    const types = ["Backyard Ultra", "Backyard", "Trail", "Marathon", "Ultra", "Run", "Loop"];

    for (const t of types) {
        const regex = new RegExp(`\\b${t}\\b`, "i");
        if (regex.test(cleanName)) {
            type = t;
            // capitalize first letter of type, though types array is already nicely capitalized
            // Wait, "Backyard Ultra" -> "Backyard Ultra"
            if (t.toLowerCase() === "backyard ultra") type = "Backyard"; // maybe just Backyard? Let's keep t
            cleanName = cleanName.replace(regex, "").trim();
            break; // only extract the first matching type? Or multiple?
            // Usually just one main type is enough
        }
    }

    // cleanup spaces
    cleanName = cleanName.replace(/\s{2,}/g, ' ');
    // cleanup dangling punctuation like " - " or " ( ) "
    cleanName = cleanName.replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();

    return { type, cleanName };
}

races.forEach(r => console.log(getRaceType(r)));
