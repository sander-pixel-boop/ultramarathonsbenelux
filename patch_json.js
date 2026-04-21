const fs = require('fs');

const races = JSON.parse(fs.readFileSync('races.json', 'utf8'));

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function injectHardcodedTargets(races) {
    const targets = {
        "leopard-ultratrail-mullerthal": {
            name: "Leopard Ultratrail Mullerthal",
            distance: "111km",
            elevation: "3500",
            terrain: "80% Forest/Trail, 20% Pavement",
            gear_recommendation: "Salomon hydration vest and trekking poles",
            utmb_index: true,
            language_profile: "EN/FR/DE"
        },
        "bello-gallico": {
            name: "Bello Gallico",
            distance: "160km",
            elevation: "2100",
            terrain: "Muddy forest trails",
            gear_recommendation: "Gaiters and high-lumen Petzl headlamp",
            utmb_index: true,
            language_profile: "NL/EN"
        },
        "legends-trails": {
            name: "Legends Trails",
            distance: "250km",
            elevation: "8000",
            terrain: "Technical Ardennes Forest",
            gear_recommendation: "Full winter survival kit, GPS tracker",
            utmb_index: true,
            language_profile: "NL/FR/EN"
        },
        "indian-summer-ultra": {
            name: "Indian Summer Ultra",
            distance: "100km",
            elevation: "500",
            terrain: "Heathland and sand",
            gear_recommendation: "Gaiters and sunglasses",
            utmb_index: false,
            language_profile: "NL/EN"
        },
        "aischdall-trail": {
            name: "Äischdall Trail",
            distance: "42km",
            elevation: "1200",
            terrain: "Rolling trails and country roads",
            gear_recommendation: "Lightweight trail shoes",
            utmb_index: false,
            language_profile: "FR/DE"
        }
    };

    races.forEach(r => r.slug = generateSlug(r.name));

    const uniqueRaces = [];
    const seenSlugs = new Set();
    races.forEach(r => {
        if (!seenSlugs.has(r.slug)) {
            seenSlugs.add(r.slug);
            uniqueRaces.push(r);
        }
    });

    for (const [targetSlug, targetData] of Object.entries(targets)) {
        const existingRace = uniqueRaces.find(r => r.slug.includes(targetSlug) || targetSlug.includes(r.slug));
        if (existingRace) {
            Object.assign(existingRace, targetData);
            existingRace.slug = targetSlug;
        } else {
            uniqueRaces.push({
                ...targetData,
                slug: targetSlug,
                country: targetData.name.includes("Mullerthal") || targetData.name.includes("Äischdall") ? "Luxembourg" : (targetData.name.includes("Bello") || targetData.name.includes("Legends") ? "Belgium" : "Netherlands"),
                date: "2026-10-15",
                url: "#",
                city: ""
            });
        }
    }

    return uniqueRaces;
}

const finalRaces = injectHardcodedTargets(races);
fs.writeFileSync('races.json', JSON.stringify(finalRaces, null, 4));
