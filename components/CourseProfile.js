import React, { useMemo } from 'react';

export default function CourseProfile({ race, t }) {
    const profile = useMemo(() => {
        if (!race || !race.elevation_points || race.elevation_points.length === 0) {
            return null;
        }

        const points = race.elevation_points;
        const maxDist = Math.max(...points.map(p => p.d));
        const maxElev = Math.max(...points.map(p => p.e));
        const minElev = Math.min(...points.map(p => p.e));
        const elevRange = maxElev - minElev || 100;

        const width = 600;
        const height = 200;
        const padding = 20;

        const usableWidth = width - 2 * padding;
        const usableHeight = height - 2 * padding;

        const xCoords = points.map(p => padding + (p.d / maxDist) * usableWidth);
        const yCoords = points.map(p => padding + usableHeight - ((p.e - minElev) / elevRange) * usableHeight);

        let pathData = `M ${xCoords[0]} ${yCoords[0]} `;
        for (let i = 1; i < points.length; i++) {
            pathData += `L ${xCoords[i]} ${yCoords[i]} `;
        }

        // Close path for filling
        const fillPathData = `${pathData} L ${xCoords[points.length - 1]} ${height - padding} L ${xCoords[0]} ${height - padding} Z`;

        // Aid stations
        const aidStations = race.aid_stations || [];
        const aidMarkers = aidStations.map(aidDist => {
            if (aidDist < 0 || aidDist > maxDist) return null;
            // Interpolate elevation at this distance
            let y = height - padding; // fallback
            for (let i = 0; i < points.length - 1; i++) {
                if (points[i].d <= aidDist && points[i+1].d >= aidDist) {
                    const ratio = (aidDist - points[i].d) / (points[i+1].d - points[i].d);
                    const e = points[i].e + ratio * (points[i+1].e - points[i].e);
                    y = padding + usableHeight - ((e - minElev) / elevRange) * usableHeight;
                    break;
                }
            }
            const x = padding + (aidDist / maxDist) * usableWidth;

            return { x, y, dist: aidDist };
        }).filter(Boolean);

        return { pathData, fillPathData, aidMarkers, maxDist, maxElev, width, height, padding };
    }, [race]);

    if (!profile) return null;

    return (
        <div className="course-profile" style={{
            marginTop: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '8px', fontSize: '0.9em', border: '1px solid #e2e8f0'
        }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1em', color: '#334155' }}>
                <i className="fas fa-mountain" style={{ marginRight: '8px', color: '#64748b' }}></i>
                Course Profile
            </h3>

            <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg width="100%" viewBox={`0 0 ${profile.width} ${profile.height}`} style={{ minWidth: '400px' }}>
                    {/* Grid lines */}
                    <line x1={profile.padding} y1={profile.height - profile.padding} x2={profile.width - profile.padding} y2={profile.height - profile.padding} stroke="#cbd5e1" strokeWidth="1" />

                    {/* Fill */}
                    <path d={profile.fillPathData} fill="rgba(59, 130, 246, 0.2)" />

                    {/* Line */}
                    <path d={profile.pathData} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinejoin="round" />

                    {/* Aid Stations */}
                    {profile.aidMarkers.map((marker, i) => (
                        <g key={i}>
                            <line x1={marker.x} y1={marker.y} x2={marker.x} y2={profile.height - profile.padding} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
                            <circle cx={marker.x} cy={marker.y} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
                            <text x={marker.x} y={profile.height - profile.padding + 15} fontSize="12" fill="#64748b" textAnchor="middle">{marker.dist}km</text>
                            {/* Water drop icon using text/emoji since SVG path can be complex, or just text */}
                            <text x={marker.x} y={marker.y - 10} fontSize="14" textAnchor="middle">💧</text>
                        </g>
                    ))}

                    {/* Max Elevation Label */}
                    <text x={profile.padding} y={profile.padding - 5} fontSize="12" fill="#64748b">{Math.round(profile.maxElev)}m</text>
                </svg>
            </div>
        </div>
    );
}
