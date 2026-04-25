import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { parseStandardDate } from '../utils/date';
import dynamic from 'next/dynamic';

const i18n = {
    en: {
        title: "Benelux Ultra Race Directory",
        aboutUs: "About Us",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        disclaimer: "Disclaimer",
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
        distanceDesc: "Distance (Descending)",
        flatEquivalent: "Flat Equivalent:",
        noRacesFound: "No races found",
        tryAdjusting: "Try adjusting your search or filters to find what you're looking for.",
        clearFilters: "Clear filters"
    },
    nl: {
        title: "Benelux Ultra Race Gids",
        aboutUs: "Over Ons",
        privacyPolicy: "Privacybeleid",
        termsOfService: "Servicevoorwaarden",
        disclaimer: "Disclaimer",
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
        distanceDesc: "Afstand (Aflopend)",
        flatEquivalent: "Vlakke Equivalent:",
        noRacesFound: "Geen races gevonden",
        tryAdjusting: "Probeer je zoekopdracht of filters aan te passen om te vinden wat je zoekt.",
        clearFilters: "Wis filters"
    },
    fr: {
        title: "Annuaire des Ultra Courses du Benelux",
        aboutUs: "À Propos",
        privacyPolicy: "Politique de Confidentialité",
        termsOfService: "Conditions d'Utilisation",
        disclaimer: "Avis de Non-Responsabilité",
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
        distanceDesc: "Distance (Décroissante)",
        flatEquivalent: "Équivalent Plat:",
        noRacesFound: "Aucune course trouvée",
        tryAdjusting: "Essayez de modifier votre recherche ou vos filtres pour trouver ce que vous cherchez.",
        clearFilters: "Effacer les filtres"
    }
};

const typePatterns = [
    "Backyard Ultra", "Backyard", "Ultra Trail", "Trail", "Ultrarun", "Ultra", "Marathon", "Run", "Loop"
];
const compoundPatterns = ["trailmarathon", "ultramarathon", "ultratrail"];

const compiledTypeRegexes = typePatterns.map(t => ({
    type: t,
    testRegex: new RegExp(`\\b${t}\\b`, "i"),
    replaceRegex: new RegExp(`\\b${t}\\b`, "ig")
}));

const compiledCompoundRegexes = compoundPatterns.map(c => ({
    compound: c,
    testRegex: new RegExp(`\\b${c}\\b`, "i"),
    replaceRegex: new RegExp(`\\b${c}\\b`, "ig")
}));

const formatRaceNameMemo = new globalThis.Map();

function formatRaceName(name) {
    if (formatRaceNameMemo.has(name)) {
        return formatRaceNameMemo.get(name);
    }

    let raceTypes = [];
    let cleanName = name;

    for (const { type, testRegex, replaceRegex } of compiledTypeRegexes) {
        if (testRegex.test(cleanName)) {
            if (!raceTypes.includes(type)) {
                raceTypes.push(type);
            }
            cleanName = cleanName.replace(replaceRegex, "");
        }
    }

    for (const { compound, testRegex, replaceRegex } of compiledCompoundRegexes) {
        if (testRegex.test(cleanName)) {
            if (compound === "trailmarathon") {
                if(!raceTypes.includes("Trail")) raceTypes.push("Trail");
                if(!raceTypes.includes("Marathon")) raceTypes.push("Marathon");
            } else if (compound === "ultramarathon") {
                if(!raceTypes.includes("Ultra")) raceTypes.push("Ultra");
                if(!raceTypes.includes("Marathon")) raceTypes.push("Marathon");
            } else if (compound === "ultratrail") {
                if(!raceTypes.includes("Ultra")) raceTypes.push("Ultra");
                if(!raceTypes.includes("Trail")) raceTypes.push("Trail");
            }
            cleanName = cleanName.replace(replaceRegex, "");
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
    const result = { name: cleanName, type: displayType };
    formatRaceNameMemo.set(name, result);
    return result;
}


function parseDateForSort(dateStr) {
    const parsed = parseStandardDate(dateStr);
    if (parsed) {
        return new Date(parsed.year, parsed.month - 1, parsed.day).getTime();
    }
    return 0;
}

function formatDateDisplay(dateStr, t) {
    const parsed = parseStandardDate(dateStr);
    if (!parsed) return dateStr;
    const { day, month, year } = parsed;
    const monthNamesEn = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthKey = monthNamesEn[month - 1];
    let monthName = t[monthKey];
    if (!monthName) return dateStr;
    return `${day} ${monthName.toLowerCase()} ${year}`;
}

function getFlatEquivalent(race) {
    if (!race) return null;

    let distNum = 0;
    const distStr = String(race.distance || '').toLowerCase();
    if (distStr.includes('h')) return null; // timed event

    if (distStr.includes('km')) {
        distNum = parseFloat(distStr.replace(/[^0-9.]/g, ''));
    } else if (distStr.includes('mi')) {
        distNum = parseFloat(distStr.replace(/[^0-9.]/g, '')) * 1.60934;
    } else {
        distNum = parseFloat(distStr.replace(/[^0-9.]/g, ''));
    }

    if (!distNum || isNaN(distNum)) return null;

    let totalElevation = 0;
    if (race.elevation) {
        const elevStr = String(race.elevation).toLowerCase();
        const elevMeters = parseFloat(elevStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(elevMeters)) totalElevation = elevMeters;
    } else if (race.elevation_points && race.elevation_points.length > 0) {
        let ascent = 0;
        const pts = race.elevation_points;
        for (let i = 0; i < pts.length - 1; i++) {
            if (pts[i+1].e > pts[i].e) {
                ascent += (pts[i+1].e - pts[i].e);
            }
        }
        totalElevation = ascent;
    }

    if (totalElevation <= 0) return null;

    const flatEq = distNum + (totalElevation / 100);
    return Math.round(flatEq);
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
import CourseProfile from '../components/CourseProfile';
import FOMO from "../components/FOMO";
import Quiz from '../components/Quiz';

export default function Home({ initialRaces }) {
    const [lang, setLang] = useState('en');
    const [search, setSearch] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [distanceFilter, setDistanceFilter] = useState('');
    const [sortSelect, setSortSelect] = useState('date-asc');
        const [selectedRace, setSelectedRace] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);

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
                    const parsed = parseStandardDate(r.date);
                    if (parsed) {
                        const rYear = String(parsed.year);
                        const rMonth = String(parsed.month).padStart(2, '0');

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
            if (r.date) {
                const parsed = parseStandardDate(r.date);
                if (parsed) {
                    const raceDate = new Date(parsed.year, parsed.month - 1, parsed.day);
                    matchesDate = raceDate >= today;
                    if (matchesDate && yearFilter === "" && monthFilter === "") {
                        const twelveMonthsFromNow = new Date(today);
                        twelveMonthsFromNow.setFullYear(twelveMonthsFromNow.getFullYear() + 1);
                        if (raceDate > twelveMonthsFromNow) {
                            matchesDate = false;
                        }
                    }
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
    }, [initialRaces, search, countryFilter, yearFilter, monthFilter, distanceFilter, sortSelect]);

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
                <Link href="/blog" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', fontWeight: '500', fontSize: '1.2em' }}>Blog</Link>

                <img src="https://flagcdn.com/w40/gb.png" alt="English" title="English" className={`flag ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')} />
                <img src="https://flagcdn.com/w40/nl.png" alt="Nederlands" title="Nederlands" className={`flag ${lang === 'nl' ? 'active' : ''}`} onClick={() => setLang('nl')} />
                <img src="https://flagcdn.com/w40/fr.png" alt="Français" title="Français" className={`flag ${lang === 'fr' ? 'active' : ''}`} onClick={() => setLang('fr')} />
            </div>

            <div className="hero">
                <h1>{t.title}</h1>
                <p>{t.subtitle}</p>
                <button
                    onClick={() => setShowQuiz(true)}
                    style={{
                        marginTop: '20px',
                        padding: '12px 24px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1em',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                    <i className="fas fa-clipboard-question"></i> Find my Race
                </button>
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
                </div>

                <Map races={filteredRaces} t={t} formatRaceName={formatRaceName} lang={lang} />

                <div id="race-list">
                    {filteredRaces.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', gridColumn: '1 / -1', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <i className="fas fa-search" style={{ fontSize: '3em', color: '#94a3b8', marginBottom: '20px' }}></i>
                            <h2 style={{ fontSize: '1.5em', color: '#334155', margin: '0 0 10px 0' }}>{t.noRacesFound}</h2>
                            <p style={{ color: '#64748b', marginBottom: '20px' }}>{t.tryAdjusting}</p>
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setCountryFilter('');
                                    setYearFilter('');
                                    setMonthFilter('');
                                    setDistanceFilter('');
                                }}
                                style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                            >
                                {t.clearFilters}
                            </button>
                        </div>
                    ) : filteredRaces.map((race, idx) => {
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
                                <p><i className="far fa-calendar-alt"></i> <strong>{t.date}</strong> {formatDateDisplay(race.date, t)}</p>
                                <FOMO race={race} allRaces={filteredRaces} onSelectRace={(r) => {
                                    let translatedCountry = r.country;
                                    if (r.country && r.country.toLowerCase() === 'belgium') translatedCountry = t.belgium;
                                    if (r.country && r.country.toLowerCase() === 'netherlands') translatedCountry = t.netherlands;
                                    if (r.country && r.country.toLowerCase() === 'luxembourg') translatedCountry = t.luxembourg;

                                    let rLocationStr = translatedCountry;
                                    if (r.city) {
                                        rLocationStr = `${r.city}, ${translatedCountry}`;
                                    }
                                    const rFormattedRace = formatRaceName(r.name);
                                    setSelectedRace({ ...r, formattedRace: rFormattedRace, locationStr: rLocationStr });
                                }} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {showQuiz && (
                <div className="modal-overlay" onClick={() => setShowQuiz(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <Quiz
                            races={filteredRaces}
                            onClose={() => setShowQuiz(false)}
                            onSelectRace={(race) => {
                                setShowQuiz(false);
                                let translatedCountry = race.country;
                                if (race.country && race.country.toLowerCase() === 'belgium') translatedCountry = t.belgium;
                                if (race.country && race.country.toLowerCase() === 'netherlands') translatedCountry = t.netherlands;
                                if (race.country && race.country.toLowerCase() === 'luxembourg') translatedCountry = t.luxembourg;

                                let locationStr = translatedCountry;
                                if (race.city) {
                                    locationStr = `${race.city}, ${translatedCountry}`;
                                }
                                const formattedRace = formatRaceName(race.name);
                                setSelectedRace({ ...race, formattedRace, locationStr });
                            }}
                            t={t}
                        />
                    </div>
                </div>
            )}

            {selectedRace && (
                <div className="modal-overlay" onClick={() => setSelectedRace(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" aria-label="Close" onClick={() => setSelectedRace(null)}>&times;</button>
                        <h2>{selectedRace.formattedRace.name}</h2>
                        <p><i className="fas fa-running"></i> <strong>{t.type}</strong> {selectedRace.formattedRace.type}</p>
                        <p><i className="fas fa-map-marker-alt"></i> <strong>{t.location}</strong> {selectedRace.locationStr}</p>
                        <p><i className="fas fa-route"></i> <strong>{t.distance}</strong> {selectedRace.distance}</p>
                        {getFlatEquivalent(selectedRace) && (
                            <p style={{ color: '#d97706', fontWeight: '500' }}>
                                <i className="fas fa-equals"></i> <strong>{t.flatEquivalent}</strong> {getFlatEquivalent(selectedRace)}km
                            </p>
                        )}
                        <p><i className="far fa-calendar-alt"></i> <strong>{t.date}</strong> {formatDateDisplay(selectedRace.date, t)}</p>

                        <FinishTimeCalculator race={selectedRace} t={t} />
                        <PackYourBag race={selectedRace} t={t} />
                        <CourseProfile race={selectedRace} t={t} />
                        <FOMO race={selectedRace} allRaces={filteredRaces} onSelectRace={(r) => { let locationStr = r.country; if (r.country && r.country.toLowerCase() === "belgium") locationStr = t.belgium; if (r.country && r.country.toLowerCase() === "netherlands") locationStr = t.netherlands; if (r.country && r.country.toLowerCase() === "luxembourg") locationStr = t.luxembourg; if (r.city) { locationStr = `${r.city}, ${locationStr}`; } setSelectedRace({ ...r, formattedRace: formatRaceName(r.name), locationStr }); }} />

                        <a href={selectedRace.url} target="_blank" rel="noopener noreferrer" className="subscribe-btn" style={{ marginTop: '20px', width: '100%', boxSizing: 'border-box' }}>
                            {t.subscribe} <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            )}


            <footer style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <p><span>{t.footerText}</span> <i className="fas fa-heart"></i> <span>{t.footerCommunity}</span></p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href="/about" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}>{t.aboutUs}</Link>
                    <Link href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}>{t.privacyPolicy}</Link>
                    <Link href="/terms" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}>{t.termsOfService}</Link>
                    <Link href="/disclaimer" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}>{t.disclaimer}</Link>
                </div>
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
