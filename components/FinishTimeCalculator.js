import React, { useState, useMemo } from 'react';

export default function FinishTimeCalculator({ race, t }) {
    const [pbTimeStr, setPbTimeStr] = useState('');
    const [pbType, setPbType] = useState('10k'); // '10k' or 'marathon'

    const calculatedTime = useMemo(() => {
        if (!pbTimeStr || !race || !race.distance) return null;

        // Parse PB time (format: HH:MM or HH:MM:SS)
        const parts = pbTimeStr.split(':');
        if (parts.length < 2 || parts.length > 3) return null;

        let pbHours = 0;
        let pbMinutes = 0;
        let pbSeconds = 0;

        if (parts.length === 2) {
            pbHours = parseInt(parts[0], 10);
            pbMinutes = parseInt(parts[1], 10);
        } else {
            pbHours = parseInt(parts[0], 10);
            pbMinutes = parseInt(parts[1], 10);
            pbSeconds = parseInt(parts[2], 10);
        }

        if (isNaN(pbHours) || isNaN(pbMinutes) || isNaN(pbSeconds)) return null;

        const t1Hours = pbHours + pbMinutes / 60 + pbSeconds / 3600;
        if (t1Hours <= 0) return null;

        const d1 = pbType === '10k' ? 10 : 42.195;

        // Parse race distance
        let d2 = 0;
        const distStr = String(race.distance).toLowerCase();
        if (distStr.includes('km')) {
            d2 = parseFloat(distStr.replace(/[^0-9.]/g, ''));
        } else if (distStr.includes('mi')) {
            d2 = parseFloat(distStr.replace(/[^0-9.]/g, '')) * 1.60934;
        } else if (distStr.includes('h')) {
            return null; // Can't estimate for timed events
        }

        if (d2 <= 0 || isNaN(d2)) return null;

        // Riegel formula: T2 = T1 * (D2 / D1)^1.06
        let t2Hours = t1Hours * Math.pow(d2 / d1, 1.06);

        // Elevation adjustment
        if (race.elevation) {
            // Assume elevation is given in meters, parse it
            const elevStr = String(race.elevation).toLowerCase();
            const elevMeters = parseFloat(elevStr.replace(/[^0-9.]/g, ''));
            if (!isNaN(elevMeters) && elevMeters > 0) {
                 // Naismith's rule adapted: +1 hour per 1000m of elevation
                 t2Hours += (elevMeters / 1000);
            }
        }

        // Format result
        const hours = Math.floor(t2Hours);
        const minutes = Math.floor((t2Hours - hours) * 60);

        return `${hours}h ${minutes}m`;

    }, [pbTimeStr, pbType, race]);

    const i18n = {
        en: { title: "Estimate Finish Time", pbLabel: "Flat PB (HH:MM):", timeTitle: "Estimated Time" },
        nl: { title: "Geschatte Eindtijd", pbLabel: "Vlakke PR (UU:MM):", timeTitle: "Geschatte Tijd" },
        fr: { title: "Estimer le Temps", pbLabel: "RP Plat (HH:MM):", timeTitle: "Temps Estimé" }
    };

    const lang = t && t.title === "Benelux Ultra Race Directory" ? 'en' :
                 (t && t.title === "Benelux Ultra Race Gids" ? 'nl' :
                 (t && t.title === "Annuaire des Ultra Courses du Benelux" ? 'fr' : 'en'));
    const txt = i18n[lang];

    // Do not render for timed events
    if (race && race.distance && String(race.distance).toLowerCase().includes('h')) {
        return null;
    }

    return (
        <div className="finish-time-calculator" style={{
            marginTop: '15px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.9em'
        }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1em', color: '#334155' }}>
                <i className="fas fa-stopwatch" style={{ marginRight: '8px', color: '#64748b' }}></i>
                {txt.title}
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                    value={pbType}
                    onChange={e => setPbType(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', flex: 1, minWidth: '100px' }}
                >
                    <option value="10k">10k PB</option>
                    <option value="marathon">Marathon PB</option>
                </select>
                <input
                    type="text"
                    placeholder="e.g. 00:45 or 03:30"
                    value={pbTimeStr}
                    onChange={e => setPbTimeStr(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', flex: 2, minWidth: '120px' }}
                />
            </div>
            {calculatedTime && (
                <div style={{ marginTop: '10px', fontWeight: '600', color: '#0f172a' }}>
                    {txt.timeTitle}: <span style={{ color: '#3b82f6' }}>{calculatedTime}</span>
                </div>
            )}
        </div>
    );
}
