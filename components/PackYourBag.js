import React, { useState, useEffect, useMemo } from 'react';
import { getUserCountry, getAffiliateLink } from '../utils/geoAffiliate';

export default function PackYourBag({ race, t }) {
    const [checkedItems, setCheckedItems] = useState({});
    const [userCountry, setUserCountry] = useState(null);

    useEffect(() => {
        getUserCountry().then(setUserCountry);
    }, []);

    const items = useMemo(() => {
        if (!race || !race.distance) return [];

        let d2 = 0;
        const distStr = String(race.distance).toLowerCase();
        if (distStr.includes('km')) {
            d2 = parseFloat(distStr.replace(/[^0-9.]/g, ''));
        } else if (distStr.includes('mi')) {
            d2 = parseFloat(distStr.replace(/[^0-9.]/g, '')) * 1.60934;
        } else if (distStr.includes('h')) {
            // For timed events, assume distance is > 0
            d2 = 1;
        }

        if (isNaN(d2) || d2 <= 0) return [];

        const gear = [];

        // Base gear
        gear.push({ id: 'survival_blanket', label: 'Survival Blanket', affiliateLink: getAffiliateLink('survival blanket', userCountry) });

        if (d2 >= 50 || distStr.includes('h')) {
            gear.push({ id: 'water_1l', label: '1L Water Capacity', affiliateLink: getAffiliateLink('running hydration vest 1L', userCountry) });
            gear.push({ id: 'headlamp', label: 'Headlamp', affiliateLink: getAffiliateLink('running headlamp', userCountry) });
        }

        if (d2 >= 80 || distStr.includes('h')) {
            gear.push({ id: 'waterproof_jacket', label: 'Waterproof Jacket', affiliateLink: getAffiliateLink('running waterproof jacket', userCountry) });
        }

        return gear;
    }, [race, userCountry]);

    if (items.length === 0) return null;

    const toggleItem = (id) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="pack-your-bag" style={{
            marginTop: '15px', padding: '15px', backgroundColor: '#e2e8f0', borderRadius: '8px', fontSize: '0.9em'
        }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1em', color: '#1e293b' }}>
                <i className="fas fa-backpack" style={{ marginRight: '8px', color: '#475569' }}></i>
                Pack Your Bag - Mandatory Gear
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#334155' }}>
                            <input
                                type="checkbox"
                                checked={!!checkedItems[item.id]}
                                onChange={() => toggleItem(item.id)}
                            />
                            <span style={{ textDecoration: checkedItems[item.id] ? 'line-through' : 'none' }}>
                                {item.label}
                            </span>
                        </label>
                        {!checkedItems[item.id] && (
                            <a href={item.affiliateLink} target="_blank" rel="noopener noreferrer" style={{
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                fontSize: '0.8em',
                                fontWeight: 'bold'
                            }}>
                                Buy Now
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
