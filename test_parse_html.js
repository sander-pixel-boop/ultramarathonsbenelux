const fs = require('fs');

const data = JSON.parse(fs.readFileSync('races.json'));
let hasElev = false;
for (const race of data) {
    if (race.elevation_points) {
        console.log("Found elevation points for:", race.name);
        console.log(race.elevation_points);
        hasElev = true;
        break;
    }
}
if (!hasElev) console.log("No elevation points found");
