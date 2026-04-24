const fs = require('fs/promises');
const races = require('./races.json');

const GEO_CACHE = {};
for (const race of races) {
    if (race.city && race.lat && race.lng) {
        const query = `${race.city}, ${race.country || ''}`;
        GEO_CACHE[query] = { lat: race.lat, lon: race.lng };
    }
}

console.log(Object.keys(GEO_CACHE).length);
