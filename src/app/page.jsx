"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import racesData from '../../races.json';

export default function Home() {
  const [races] = useState(racesData);
  const [currentLang, setCurrentLang] = useState('en');

  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('');
  const [sortOption, setSortOption] = useState('date-asc');
  const [showPastRaces, setShowPastRaces] = useState(false);

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
        details: "Details / Compare",
        footerText: "Made with",
        footerCommunity: "for the ultra running community"
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
        details: "Details / Vergelijk",
        footerText: "Gemaakt met",
        footerCommunity: "voor de ultra hardloop gemeenschap"
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
        details: "Détails / Comparer",
        footerText: "Fait avec",
        footerCommunity: "pour la communauté de l'ultra course"
    }
  };

  const t = i18n[currentLang];

  function formatRaceName(name) {
      if (!name) return { name: "Unknown", type: "Race" };
      let raceTypes = [];
      let cleanName = name;
      const typePatterns = ["Backyard Ultra", "Backyard", "Ultra Trail", "Trail", "Ultrarun", "Ultra", "Marathon", "Run", "Loop"];
      for (const t of typePatterns) {
          const regex = new RegExp(`\\b${t}\\b`, "i");
          if (regex.test(cleanName)) {
              if (!raceTypes.includes(t)) raceTypes.push(t);
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
      cleanName = cleanName.replace(/\(\s*\)/g, '').replace(/:\s*$/, '').replace(/^:\s*/, '').replace(/\s+-\s*$/g, '').replace(/^\s*-\s+/g, '').replace(/^-/, '').replace(/-\s*variant:\s*/i, '').replace(/^variant:\s*/i, '').replace(/\s+-\s+/g, ' - ').replace(/\s{2,}/g, ' ').trim();
      if (cleanName === "") {
          cleanName = name;
          raceTypes = [];
      }
      let displayType = raceTypes.length > 0 ? raceTypes.join(", ") : "Race";
      return { name: cleanName, type: displayType };
  }

  const filteredRaces = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = races.filter(r => {
        const matchesSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || r.distance?.toLowerCase().includes(search.toLowerCase());
        const matchesCountry = countryFilter === "" || r.country?.toLowerCase() === countryFilter.toLowerCase();

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
                } else if (r.date.includes('-')) {
                    const parts = r.date.split('-');
                    if(parts.length === 3) {
                         const rYear = parts[0];
                         const rMonth = parts[1];
                         if (yearFilter !== "") matchesYear = (rYear === yearFilter);
                         if (monthFilter !== "") matchesMonth = (rMonth === monthFilter);
                    }
                }
            } else {
                matchesYear = (yearFilter === "");
                matchesMonth = (monthFilter === "");
            }
        }

        let matchesDistance = true;
        if (distanceFilter !== "") {
            const distStr = r.distance?.toLowerCase() || '';
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
        if (!showPastRaces && r.date && r.date !== 'TBD') {
            let raceDate;
            if (r.date.includes('.')) {
                const parts = r.date.split('.');
                raceDate = new Date(parts[2], parts[1] - 1, parts[0]);
            } else if (r.date.includes('-')) {
                raceDate = new Date(r.date);
            }
            if (raceDate) {
               matchesDate = raceDate >= today;
            }
        }

        return matchesSearch && matchesCountry && matchesYear && matchesMonth && matchesDistance && matchesDate;
    });

    filtered.sort((a, b) => {
        const parseDate = (d) => {
            if (!d || d === 'TBD') return 0;
            if (d.includes('.')) {
                const parts = d.split('.');
                return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
            }
            return new Date(d).getTime();
        };
        const parseDist = (d) => {
            if (!d) return 0;
            const s = d.toLowerCase();
            let n = parseFloat(s.replace(/[^0-9.]/g, ''));
            if (isNaN(n)) return 0;
            if (s.includes('mi')) n *= 1.60934;
            if (s.includes('h')) n *= 10;
            return n;
        };

        if (sortOption.startsWith('date')) {
            const dA = parseDate(a.date);
            const dB = parseDate(b.date);
            return sortOption === 'date-asc' ? dA - dB : dB - dA;
        } else {
            const distA = parseDist(a.distance);
            const distB = parseDist(b.distance);
            return sortOption === 'distance-asc' ? distA - distB : distB - distA;
        }
    });

    return filtered;
  }, [races, search, countryFilter, yearFilter, monthFilter, distanceFilter, sortOption, showPastRaces]);

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen">
      <div className="absolute top-5 right-5 flex gap-2 z-50">
        {['en', 'nl', 'fr'].map((lang) => (
          <img
            key={lang}
            src={`https://flagcdn.com/w40/${lang === 'en' ? 'gb' : lang}.png`}
            alt={lang}
            className={`w-8 h-auto cursor-pointer rounded shadow transition-all hover:-translate-y-0.5 hover:opacity-80 ${currentLang === lang ? 'opacity-100 ring-2 ring-white scale-110' : 'opacity-50'}`}
            onClick={() => setCurrentLang(lang)}
          />
        ))}
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16 px-5 text-center shadow-md mb-10">
        <h1 className="text-4xl font-bold tracking-tight m-0">{t.title}</h1>
        <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      <div className="max-w-7xl mx-auto px-5 w-full flex-1">

        <div className="flex flex-wrap gap-5 mb-10 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="relative flex-grow min-w-[250px]">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="flex-1 min-w-[140px] px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
            <option value="">{t.allCountries}</option>
            <option value="belgium">{t.belgium}</option>
            <option value="netherlands">{t.netherlands}</option>
            <option value="luxembourg">{t.luxembourg}</option>
          </select>
          <select className="flex-1 min-w-[140px] px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
             <option value="">{t.allYears}</option>
             <option value="2024">2024</option>
             <option value="2025">2025</option>
             <option value="2026">2026</option>
             <option value="2027">2027</option>
          </select>
          <select className="flex-1 min-w-[140px] px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
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
          <select className="flex-1 min-w-[140px] px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none" value={distanceFilter} onChange={(e) => setDistanceFilter(e.target.value)}>
             <option value="">{t.allDistances}</option>
             <option value="<60km">&lt; 60km</option>
             <option value="60-99km">60 - 99km</option>
             <option value="100km+">100km+</option>
             <option value="timed">{t.timedEvents}</option>
          </select>
          <select className="flex-1 min-w-[140px] px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
             <option value="date-asc">Date (Ascending)</option>
             <option value="date-desc">Date (Descending)</option>
             <option value="distance-asc">Distance (Ascending)</option>
             <option value="distance-desc">Distance (Descending)</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
             <input type="checkbox" checked={showPastRaces} onChange={(e) => setShowPastRaces(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
             <span>{t.showPastRaces}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredRaces.map((race, i) => {
             const formatted = formatRaceName(race.name);
             let translatedCountry = race.country;
             if (race.country?.toLowerCase() === 'belgium') translatedCountry = t.belgium;
             if (race.country?.toLowerCase() === 'netherlands') translatedCountry = t.netherlands;
             if (race.country?.toLowerCase() === 'luxembourg') translatedCountry = t.luxembourg;
             const locationStr = race.city ? `${race.city}, ${translatedCountry}` : translatedCountry;

             return (
               <div key={`${race.slug}-${i}`} className="race-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <h2 className="text-xl font-semibold text-slate-900 mb-4">{formatted.name}</h2>

                 <div className="space-y-2 mb-6 flex-1">
                   <p className="flex items-center gap-3 text-slate-600"><i className="fas fa-running w-5 text-center text-slate-400"></i> <span><strong>{t.type}</strong> {formatted.type}</span></p>
                   <p className="flex items-center gap-3 text-slate-600"><i className="fas fa-map-marker-alt w-5 text-center text-slate-400"></i> <span><strong>{t.location}</strong> {locationStr}</span></p>
                   <p className="flex items-center gap-3 text-slate-600"><i className="fas fa-route w-5 text-center text-slate-400"></i> <span><strong>{t.distance}</strong> {race.distance}</span></p>
                   <p className="flex items-center gap-3 text-slate-600"><i className="far fa-calendar-alt w-5 text-center text-slate-400"></i> <span><strong>{t.date}</strong> {race.date}</span></p>
                 </div>

                 <Link href={`/races/${race.slug}`} className="mt-auto px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-2">
                   {t.details} <i className="fas fa-arrow-right"></i>
                 </Link>
               </div>
             );
          })}
          {filteredRaces.length === 0 && (
             <div className="col-span-full text-center py-12 text-slate-500">
                <i className="fas fa-search text-4xl mb-4 text-slate-300"></i>
                <p>No races found matching your criteria.</p>
             </div>
          )}
        </div>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-auto">
        <p>
           <span>{t.footerText}</span> <i className="fas fa-heart text-red-500 mx-1"></i> <span>{t.footerCommunity}</span>
        </p>
      </footer>
    </div>
  );
}
