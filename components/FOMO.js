import React, { useState, useEffect } from 'react';

function parseDate(dateStr) {
    if (!dateStr) return null;
    let parts;
    if (dateStr.includes('.')) {
        parts = dateStr.split('.');
    } else if (dateStr.includes('/')) {
        parts = dateStr.split('/');
    } else {
        return null;
    }

    if (parts.length === 3) {
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;

        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

        // Sanity check for month
        if (month < 0 || month > 11) return null;

        return new Date(year, month, day);
    }
    return null;
}

function FOMO({ race, allRaces, onSelectRace }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isSoldOut, setIsSoldOut] = useState(false);
    const [nextRace, setNextRace] = useState(null);

    useEffect(() => {
        let targetDateStr = race.registration_close || race.date;
        if (!targetDateStr) return;

        const targetDate = parseDate(targetDateStr);
        if (!targetDate) return;

        targetDate.setHours(23, 59, 59, 999);

        const findNextRace = () => {
            const raceDate = parseDate(race.date);
            if (!raceDate) return null;

            const currentMonth = raceDate.getMonth();
            const currentYear = raceDate.getFullYear();

            const candidates = allRaces.filter(r => {
                if (r.name === race.name) return false;

                const rDateObj = parseDate(r.date);
                if (!rDateObj) return false;

                if (rDateObj.getMonth() !== currentMonth || rDateObj.getFullYear() !== currentYear) return false;

                // Ensure the alternative race is still open for registration
                let rRegDate = rDateObj;
                if (r.registration_close) {
                    const parsedReg = parseDate(r.registration_close);
                    if (parsedReg) {
                        parsedReg.setHours(23, 59, 59, 999);
                        rRegDate = parsedReg;
                    }
                }

                if (rRegDate.getTime() < new Date().getTime()) return false;

                return true;
            });

            candidates.sort((a, b) => {
                const aTime = parseDate(a.date).getTime();
                const bTime = parseDate(b.date).getTime();
                return aTime - bTime;
            });

            return candidates.length > 0 ? candidates[0] : null;
        };

        const updateTimer = () => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff <= 0) {
                setIsSoldOut(true);
                setTimeLeft('');
                setNextRace(prevNextRace => prevNextRace || findNextRace());
            } else {
                setIsSoldOut(false);
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [race, allRaces]);

    if (isSoldOut) {
        return (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <h3 style={{ color: '#dc2626', marginTop: 0, marginBottom: '10px', fontSize: '1.2em' }}><i className="fas fa-times-circle"></i> Registration Closed / Sold Out</h3>
                {nextRace && (
                    <div style={{ marginTop: '10px' }}>
                        <p style={{ margin: '0 0 10px 0', color: '#7f1d1d' }}><strong>Next Available:</strong> Looking for another race this month?</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectRace(nextRace);
                            }}
                            style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Check out {nextRace.name}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (timeLeft) {
        return (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                <h3 style={{ color: '#d97706', margin: '0 0 10px 0', fontSize: '1.2em' }}><i className="fas fa-clock"></i> Registration closes in:</h3>
                <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#b45309', fontFamily: 'monospace' }}>{timeLeft}</div>
            </div>
        );
    }

    return null;
}

export default FOMO;
