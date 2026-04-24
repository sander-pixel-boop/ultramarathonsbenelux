export function parseStandardDate(dateStr) {
    if (!dateStr) return null;
    const str = String(dateStr).trim();

    // Check for DD Month YYYY
    const monthNamesEn = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthNamesShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    // YYYY-MM-DD or YYYY.MM.DD or YYYY/MM/DD
    let match = str.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
    if (match) {
        const month = parseInt(match[2], 10);
        if (month < 1 || month > 12) return null;
        return { year: parseInt(match[1], 10), month, day: parseInt(match[3], 10) };
    }

    // DD-MM-YYYY or DD.MM.YYYY or DD/MM/YYYY or DD.MM.YY
    match = str.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{2,4})$/);
    if (match) {
        const month = parseInt(match[2], 10);
        if (month < 1 || month > 12) return null;
        let year = parseInt(match[3], 10);
        if (year < 100) year += 2000;
        return { day: parseInt(match[1], 10), month, year };
    }

    // DD Month YYYY
    match = str.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (match) {
        const mStr = match[2].toLowerCase();
        let month = monthNamesEn.indexOf(mStr) + 1;
        if (month === 0) month = monthNamesShort.findIndex(m => mStr.startsWith(m)) + 1;
        if (month === 0) return null;
        return { day: parseInt(match[1], 10), month, year: parseInt(match[3], 10) };
    }

    return null;
}
