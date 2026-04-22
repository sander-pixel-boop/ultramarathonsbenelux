import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const i18n = {
    en: {
        title: "Benelux Ultra Race Directory",
        subtitle: "Discover the toughest footraces and gravel events across Belgium, Netherlands, and Luxembourg.",
        searchPlaceholder: "Search by distance or race name...",
        allCountries: "All Countries",
        belgium: "Belgium",
        netherlands: "Netherlands",
        luxembourg: "Luxembourg",
        allYears: "All Years",
        allMonths: "All Months",
        jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June",
        jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December",
        allDistances: "All Distances",
        timedEvents: "Timed Events",
        showPastRaces: "Show past races",
        type: "Type:",
        location: "Location:",
        distance: "Distance:",
        date: "Date:",
        subscribe: "Subscribe / Info",
        footerText: "Made with",
        footerCommunity: "for the ultra running community",
        dateAsc: "Date (Ascending)",
        dateDesc: "Date (Descending)",
        distanceAsc: "Distance (Ascending)",
        distanceDesc: "Distance (Descending)"
    },
    nl: {
        title: "Benelux Ultra Race Gids",
        subtitle: "Ontdek de zwaarste hardloop- en gravel-evenementen in België, Nederland en Luxemburg.",
        searchPlaceholder: "Zoek op afstand of naam...",
        allCountries: "Alle Landen",
        belgium: "België",
        netherlands: "Nederland",
        luxembourg: "Luxemburg",
        allYears: "Alle Jaren",
        allMonths: "Alle Maanden",
        jan: "Januari", feb: "Februari", mar: "Maart", apr: "April", may: "Mei", jun: "Juni",
        jul: "Juli", aug: "Augustus", sep: "September", oct: "Oktober", nov: "November", dec: "December",
        allDistances: "Alle Afstanden",
        timedEvents: "Evenementen op Tijd",
        showPastRaces: "Toon eerdere races",
        type: "Type:",
        location: "Locatie:",
        distance: "Afstand:",
        date: "Datum:",
        subscribe: "Inschrijven / Info",
        footerText: "Gemaakt met",
        footerCommunity: "voor de ultra hardloop gemeenschap",
        dateAsc: "Datum (Oplopend)",
        dateDesc: "Datum (Aflopend)",
        distanceAsc: "Afstand (Oplopend)",
        distanceDesc: "Afstand (Aflopend)"
    },
    fr: {
        title: "Annuaire des Ultra Courses du Benelux",
        subtitle: "Découvrez les courses à pied et événements gravel les plus difficiles de Belgique, des Pays-Bas et du Luxembourg.",
        searchPlaceholder: "Rechercher par distance ou nom...",
        allCountries: "Tous les Pays",
        belgium: "Belgique",
        netherlands: "Pays-Bas",
        luxembourg: "Luxembourg",
        allYears: "Toutes les Années",
        allMonths: "Tous les Mois",
        jan: "Janvier", feb: "Février", mar: "Mars", apr: "Avril", may: "Mai", jun: "Juin",
        jul: "Juillet", aug: "Août", sep: "Septembre", oct: "Octobre", nov: "Novembre", dec: "Décembre",
        allDistances: "Toutes les Distances",
        timedEvents: "Événements Chronométrés",
        showPastRaces: "Afficher les courses passées",
        type: "Type:",
        location: "Lieu:",
        distance: "Distance:",
        date: "Date:",
        subscribe: "S'inscrire / Info",
        footerText: "Fait avec",
        footerCommunity: "pour la communauté de l'ultra course",
        dateAsc: "Date (Croissante)",
        dateDesc: "Date (Décroissante)",
        distanceAsc: "Distance (Croissante)",
        distanceDesc: "Distance (Décroissante)"
    }
};

function formatRaceName(name) {
    let raceTypes = [];
    let cleanName = name;

    const typePatterns = [
        "Backyard Ultra", "Backyard", "Ultra Trail", "Trail", "Ultrarun", "Ultra", "Marathon", "Run", "Loop"
    ];

    for (const t of typePatterns) {
        const regex = new RegExp(`\\b${t}\\b`, "i");
        if (regex.test(cleanName)) {
            if (!raceTypes.includes(t)) {
                raceTypes.push(t);
            }
            cleanName = cleanName.replace(new RegExp(`\\b${t}\\b`, "ig"), "");
        }
    }

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

    cleanName = cleanName.replace(/\(\s*\)/g, '');
    cleanName = cleanName.replace(/:\s*$/, '');
    cleanName = cleanName.replace(/^:\s*/, '');
    cleanName = cleanName.replace(/\s+-\s*$/g, '');
    cleanName = cleanName.replace(/^\s*-\s+/g, '');
    cleanName = cleanName.replace(/^-/, '');
    cleanName = cleanName.replace(/-\s*variant:\s*/i, '');
    cleanName = cleanName.replace(/^variant:\s*/i, '');
    cleanName = cleanName.replace(/\s+-\s+/g, ' - ');
    cleanName = cleanName.replace(/\s{2,}/g, ' ');
    cleanName = cleanName.trim();

    if (cleanName === "") {
        cleanName = name;
        raceTypes = [];
    }

    let displayType = raceTypes.length > 0 ? raceTypes.join(", ") : "Race";
    return { name: cleanName, type: displayType };
}

function parseDateForSort(dateStr) {
    if (!dateStr) return 0;
    const parts = dateStr.split('.');
    if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    }
    return 0;
}

function parseDistanceForSort(distStr) {
    if (!distStr) return 0;
    distStr = distStr.toLowerCase();
    let num = parseFloat(distStr.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return 0;
    if (distStr.includes("mi")) {
        num = num * 1.60934;
    } else if (distStr.includes("h")) {
        num = num * 10;
    }
    return num;
}

// Map Component - loaded dynamically without SSR
const Map = dynamic(() => import('../components/Map'), { ssr: false });

import FinishTimeCalculator from '../components/FinishTimeCalculator';
import PackYourBag from '../components/PackYourBag';

export default function Home({ initialRaces }) {
    const [lang, setLang] = useState('en');
    const [search, setSearch] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [distanceFilter, setDistanceFilter] = useState('');
    const [sortSelect, setSortSelect] = useState('date-asc');
    const [showPastRaces, setShowPastRaces] = useState(false);
    const [selectedRace, setSelectedRace] = useState(null);

    const t = i18n[lang];

    const filteredRaces = useMemo(() => {
        if (!initialRaces) return [];

        const query = search.toLowerCase();
        const countryF = countryFilter.toLowerCase();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filtered = initialRaces.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(query) || (r.distance && r.distance.toLowerCase().includes(query));
            const matchesCountry = countryF === "" || (r.country && r.country.toLowerCase() === countryF);

            let matchesYear = true;
            let matchesMonth = true;
            if (yearFilter !== "" || monthFilter !== "") {
                if (r.date) {
                    const parts = r.date.split('.');
                    if (parts.length === 3) {
                        const rMonth = parts[1];
                        const rYear = parts[2];

                        if (yearFilter !== "") matchesYear = (rYear === yearFilter);
                        if (monthFilter !== "") matchesMonth = (rMonth === monthFilter);
                    } else {
                        matchesYear = (yearFilter === "");
                        matchesMonth = (monthFilter === "");
                    }
                } else {
                    matchesYear = (yearFilter === "");
                    matchesMonth = (monthFilter === "");
                }
            }

            let matchesDistance = true;
            if (distanceFilter !== "") {
                const distStr = r.distance ? r.distance.toLowerCase() : "";
                if (distanceFilter === "timed") {
                    matchesDistance = distStr.includes("h");
                } else if (distStr.includes("km") || distStr.includes("mi")) {
                    let num = parseFloat(distStr.replace(/[^0-9.]/g, ''));
                    if (distStr.includes("mi")) num = num * 1.60934;

                    if (distanceFilter === "<60km") matchesDistance = num < 60;
                    else if (distanceFilter === "60-99km") matchesDistance = num >= 60 && num < 100;
                    else if (distanceFilter === "100km+") matchesDistance = num >= 100;
                } else {
                    matchesDistance = false;
                }
            }

            let matchesDate = true;
            if (!showPastRaces && r.date) {
                const parts = r.date.split('.');
                if (parts.length === 3) {
                    const raceDate = new Date(parts[2], parts[1] - 1, parts[0]);
                    matchesDate = raceDate >= today;
                }
            }

            return matchesSearch && matchesCountry && matchesYear && matchesMonth && matchesDistance && matchesDate;
        });

        filtered.sort((a, b) => {
            if (sortSelect.startsWith('date')) {
                const dateA = parseDateForSort(a.date);
                const dateB = parseDateForSort(b.date);
                return sortSelect === 'date-asc' ? dateA - dateB : dateB - dateA;
            } else if (sortSelect.startsWith('distance')) {
                const distA = parseDistanceForSort(a.distance);
                const distB = parseDistanceForSort(b.distance);
                return sortSelect === 'distance-asc' ? distA - distB : distB - distA;
            }
            return 0;
        });

        return filtered;
    }, [initialRaces, search, countryFilter, yearFilter, monthFilter, distanceFilter, sortSelect, showPastRaces]);

    return (
        <>
            <Head>
                <title>{t.title}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>
            <div className="language-flags">
                <img src="https://flagcdn.com/w40/gb.png" alt="English" title="English" className={`flag ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')} />
                <img src="https://flagcdn.com/w40/nl.png" alt="Nederlands" title="Nederlands" className={`flag ${lang === 'nl' ? 'active' : ''}`} onClick={() => setLang('nl')} />
                <img src="https://flagcdn.com/w40/fr.png" alt="Français" title="Français" className={`flag ${lang === 'fr' ? 'active' : ''}`} onClick={() => setLang('fr')} />
            </div>

            <div className="hero">
                <h1>{t.title}</h1>
                <p>{t.subtitle}</p>
            </div>

            <div className="container">
                <div className="controls">
                    <div className="input-group">
                        <i className="fas fa-search"></i>
                        <input type="text" id="search" placeholder={t.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <select id="country-filter" className="filter-select" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                        <option value="">{t.allCountries}</option>
                        <option value="belgium">{t.belgium}</option>
                        <option value="netherlands">{t.netherlands}</option>
                        <option value="luxembourg">{t.luxembourg}</option>
                    </select>
                    <select id="year-filter" className="filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                        <option value="">{t.allYears}</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                    <select id="month-filter" className="filter-select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                        <option value="">{t.allMonths}</option>
                        <option value="01">{t.jan}</option>
                        <option value="02">{t.feb}</option>
                        <option value="03">{t.mar}</option>
                        <option value="04">{t.apr}</option>
                        <option value="05">{t.may}</option>
                        <option value="06">{t.jun}</option>
                        <option value="07">{t.jul}</option>
                        <option value="08">{t.aug}</option>
                        <option value="09">{t.sep}</option>
                        <option value="10">{t.oct}</option>
                        <option value="11">{t.nov}</option>
                        <option value="12">{t.dec}</option>
                    </select>
                    <select id="distance-filter" className="filter-select" value={distanceFilter} onChange={(e) => setDistanceFilter(e.target.value)}>
                        <option value="">{t.allDistances}</option>
                        <option value="<60km">&lt; 60km</option>
                        <option value="60-99km">60 - 99km</option>
                        <option value="100km+">100km+</option>
                        <option value="timed">{t.timedEvents}</option>
                    </select>
                    <select id="sort-select" className="filter-select" value={sortSelect} onChange={(e) => setSortSelect(e.target.value)}>
                        <option value="date-asc">{t.dateAsc}</option>
                        <option value="date-desc">{t.dateDesc}</option>
                        <option value="distance-asc">{t.distanceAsc}</option>
                        <option value="distance-desc">{t.distanceDesc}</option>
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569', fontWeight: 500 }}>
                        <input type="checkbox" id="show-past-races" style={{ width: 'auto', padding: 0 }} checked={showPastRaces} onChange={(e) => setShowPastRaces(e.target.checked)} />
                        <span>{t.showPastRaces}</span>
                    </label>
                </div>

                <Map races={filteredRaces} t={t} formatRaceName={formatRaceName} lang={lang} />

                <div id="race-list">
                    {filteredRaces.map((race, idx) => {
                        let translatedCountry = race.country;
                        if (race.country && race.country.toLowerCase() === 'belgium') translatedCountry = t.belgium;
                        if (race.country && race.country.toLowerCase() === 'netherlands') translatedCountry = t.netherlands;
                        if (race.country && race.country.toLowerCase() === 'luxembourg') translatedCountry = t.luxembourg;

                        let locationStr = translatedCountry;
                        if (race.city) {
                            locationStr = `${race.city}, ${translatedCountry}`;
                        }

                        const formattedRace = formatRaceName(race.name);

                        return (
                            <div key={idx} className="race-card" onClick={() => setSelectedRace({ ...race, formattedRace, locationStr })}>
                                <h2>{formattedRace.name}</h2>
                                <p><i className="fas fa-running"></i> <strong>{t.type}</strong> {formattedRace.type}</p>
                                <p><i className="fas fa-map-marker-alt"></i> <strong>{t.location}</strong> {locationStr}</p>
                                <p><i className="fas fa-route"></i> <strong>{t.distance}</strong> {race.distance}</p>
                                <p><i className="far fa-calendar-alt"></i> <strong>{t.date}</strong> {race.date}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedRace && (
                <div className="modal-overlay" onClick={() => setSelectedRace(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedRace(null)}>&times;</button>
                        <h2>{selectedRace.formattedRace.name}</h2>
                        <p><i className="fas fa-running"></i> <strong>{t.type}</strong> {selectedRace.formattedRace.type}</p>
                        <p><i className="fas fa-map-marker-alt"></i> <strong>{t.location}</strong> {selectedRace.locationStr}</p>
                        <p><i className="fas fa-route"></i> <strong>{t.distance}</strong> {selectedRace.distance}</p>
                        <p><i className="far fa-calendar-alt"></i> <strong>{t.date}</strong> {selectedRace.date}</p>

                        <FinishTimeCalculator race={selectedRace} t={t} />
                        <PackYourBag race={selectedRace} t={t} />

                        <a href={selectedRace.url} target="_blank" rel="noopener noreferrer" className="subscribe-btn" style={{ marginTop: '20px', width: '100%', boxSizing: 'border-box' }}>
                            {t.subscribe} <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            )}

            <footer>
                <p><span>{t.footerText}</span> <i className="fas fa-heart"></i> <span>{t.footerCommunity}</span></p>
            </footer>
        </>
    );
}

export async function getStaticProps() {
    let races = [];
    try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'races.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        races = JSON.parse(jsonData);
    } catch (e) {
        console.error("Error reading races.json during build:", e);
    }

    return {
        props: {
            initialRaces: races
        }
    }
}
