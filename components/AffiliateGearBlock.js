export default function AffiliateGearBlock({ elev_m, surface_trail_pct, date_iso }) {
    const isWinter = () => {
        if (!date_iso) return false;
        const month = parseInt(date_iso.split('-')[1], 10);
        return month === 12 || month === 1 || month === 2;
    };

    return (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Recommended Gear</h3>
            <ul>
                {elev_m > 1500 && (
                    <li>⛰️ <strong>Recommended Poles & Compression:</strong> Essential for the high elevation gain. <a href="https://amazon.com" target="_blank" rel="noopener noreferrer">Shop Poles</a></li>
                )}
                {surface_trail_pct > 70 && (
                    <li>👟 <strong>Top Technical Trail Shoes:</strong> Required for heavy trail surfaces. <a href="https://amazon.com" target="_blank" rel="noopener noreferrer">Shop Shoes</a></li>
                )}
                {isWinter() && (
                    <li>❄️ <strong>Winter Ultra Survival Kit:</strong> Stay warm during the cold months. <a href="https://amazon.com" target="_blank" rel="noopener noreferrer">Shop Winter Gear</a></li>
                )}
                {elev_m <= 1500 && surface_trail_pct <= 70 && !isWinter() && (
                    <li>🎒 <strong>Standard Ultra Kit:</strong> Vest, hydration, and nutrition. <a href="https://amazon.com" target="_blank" rel="noopener noreferrer">Shop Gear</a></li>
                )}
            </ul>
        </div>
    );
}
