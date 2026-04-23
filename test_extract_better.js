const fs = require('fs');

const races = JSON.parse(fs.readFileSync('races.json'));
races.forEach(r => {
    // let's add some mock elevation points to one of the races for testing
    if (r.name === 'The Bello Gallico Trail 50mi') {
        r.elevation_points = [
            { d: 0, e: 100 },
            { d: 10, e: 200 },
            { d: 20, e: 150 },
            { d: 30, e: 300 },
            { d: 40, e: 250 },
            { d: 50, e: 400 },
            { d: 60, e: 100 },
            { d: 70, e: 50 },
            { d: 80, e: 100 }
        ];
        // aid stations every 15km
        r.aid_stations = [15, 30, 45, 60, 75];
    }
});

fs.writeFileSync('races.json', JSON.stringify(races, null, 4));
