import { getGearRecommendations } from '../utils/gear';

export default function AffiliateGearBlock({ elev_m, surface_trail_pct, date_iso }) {
    const { highElevation, technicalTrail, winter, standardKit } = getGearRecommendations(elev_m, surface_trail_pct, date_iso);
    const amazonTag = process.env.NEXT_PUBLIC_AMAZON_TAG || 'your_amazon_tag_here';

    return (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Recommended Gear</h3>
            <ul>
                {highElevation && (
                    <li>⛰️ <strong>Recommended Poles & Compression:</strong> Essential for the high elevation gain. <a href={`https://www.amazon.com/s?k=trail+running+poles&tag=${amazonTag}`} target="_blank" rel="noopener noreferrer">Shop Poles</a></li>
                )}
                {technicalTrail && (
                    <li>👟 <strong>Top Technical Trail Shoes:</strong> Required for heavy trail surfaces. <a href={`https://www.amazon.com/s?k=technical+trail+running+shoes&tag=${amazonTag}`} target="_blank" rel="noopener noreferrer">Shop Shoes</a></li>
                )}
                {winter && (
                    <li>❄️ <strong>Winter Ultra Survival Kit:</strong> Stay warm during the cold months. <a href={`https://www.amazon.com/s?k=winter+running+gear&tag=${amazonTag}`} target="_blank" rel="noopener noreferrer">Shop Winter Gear</a></li>
                )}
                {standardKit && (
                    <li>🎒 <strong>Standard Ultra Kit:</strong> Vest, hydration, and nutrition. <a href={`https://www.amazon.com/s?k=trail+running+vest&tag=${amazonTag}`} target="_blank" rel="noopener noreferrer">Shop Gear</a></li>
                )}
            </ul>
        </div>
    );
}
