const MAX_MEMO_SIZE = 5000;
const parseDistanceMemo = new globalThis.Map();
const parseElevationMemo = new globalThis.Map();

/**
 * Parses a distance string (e.g., "50km", "100mi", "24h") and returns the distance in kilometers.
 * For timed events ("h"), it returns an approximate distance (10km per hour).
 * @param {string|number} distStr
 * @returns {number} Distance in km
 */
export function parseDistance(distStr) {
    if (!distStr) return 0;
    const str = String(distStr).trim();

    if (parseDistanceMemo.has(str)) {
        return parseDistanceMemo.get(str);
    }

    const lower = str.toLowerCase();
    let num = parseFloat(lower.replace(/[^0-9.]/g, ''));

    if (isNaN(num)) {
        num = 0;
    } else if (lower.includes('mi')) {
        num = num * 1.60934;
    } else if (lower.includes('h')) {
        num = num * 10;
    }

    if (parseDistanceMemo.size >= MAX_MEMO_SIZE) {
        parseDistanceMemo.clear();
    }
    parseDistanceMemo.set(str, num);
    return num;
}

/**
 * Parses an elevation string (e.g., "1000m", "500 D+") and returns the elevation in meters.
 * @param {string|number} elevStr
 * @returns {number} Elevation in meters
 */
export function parseElevation(elevStr) {
    if (!elevStr) return 0;
    const str = String(elevStr).trim();

    if (parseElevationMemo.has(str)) {
        return parseElevationMemo.get(str);
    }

    let num = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) {
        num = 0;
    }

    if (parseElevationMemo.size >= MAX_MEMO_SIZE) {
        parseElevationMemo.clear();
    }
    parseElevationMemo.set(str, num);
    return num;
}
