import React, { useState, useEffect } from 'react';

function FOMO({ race, allRaces, onSelectRace }) {
    const [isSoldOut, setIsSoldOut] = useState(false);
    const [nextRace, setNextRace] = useState(null);

    useEffect(() => {
        if (!race._targetDateTime) return;

        const findNextRace = () => {
            if (!race._fomoMonth || !race._fomoYear) return null;

            const currentMonth = race._fomoMonth;
            const currentYear = race._fomoYear;
            const nowTime = new Date().getTime();

            const candidates = allRaces.filter(r => {
                if (r.name === race.name) return false;

                if (r._fomoMonth !== currentMonth || r._fomoYear !== currentYear) return false;

                if (r._regDateTime < nowTime) return false;

                return true;
            });

            if (candidates.length > 0) {
                const sortMapped = [];
                for(let i=0; i<candidates.length; i++) {
                    sortMapped.push({ item: candidates[i], sortKey: candidates[i]._raceDateTime });
                }
                sortMapped.sort((a, b) => {
                    return a.sortKey - b.sortKey;
                });
                return sortMapped[0].item;
            }

            return null;
        };

        const updateStatus = () => {
            const nowTime = new Date().getTime();
            const diff = race._targetDateTime - nowTime;

            if (diff <= 0) {
                setIsSoldOut(true);
                setNextRace(prevNextRace => prevNextRace || findNextRace());
            } else {
                setIsSoldOut(false);
            }
        };

        updateStatus();

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

    return null;
}

export default FOMO;
