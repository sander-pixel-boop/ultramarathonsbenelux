/**
 * Determines gear recommendations based on race characteristics.
 *
 * @param {number} elev_m - Elevation gain in meters.
 * @param {number} surface_trail_pct - Percentage of the race on trail surfaces.
 * @param {string} date_iso - ISO date string of the race (YYYY-MM-DD).
 * @returns {Object} An object containing boolean flags for recommended gear.
 */
export function getGearRecommendations(elev_m, surface_trail_pct, date_iso) {
    const isWinter = () => {
        if (!date_iso) return false;
        const month = parseInt(date_iso.split('-')[1], 10);
        return month === 12 || month === 1 || month === 2;
    };

    const winter = isWinter();
    const highElevation = elev_m > 1500;
    const technicalTrail = surface_trail_pct > 70;

    // Standard kit is recommended only if no specialized gear is prioritized
    const standardKit = !highElevation && !technicalTrail && !winter;

    return {
        highElevation,
        technicalTrail,
        winter,
        standardKit
    };
}
