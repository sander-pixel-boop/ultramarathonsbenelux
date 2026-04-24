const i18n = {
    en: {
        jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June",
        jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December"
    }
};

function parseStandardDate(dateStr) {
    if (!dateStr) return null;
    let match = String(dateStr).trim().match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
    if (match) {
        const month = parseInt(match[2], 10);
        if (month < 1 || month > 12) return null;
        return { year: parseInt(match[1], 10), month, day: parseInt(match[3], 10) };
    }
    match = String(dateStr).trim().match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{2,4})$/);
    if (match) {
        const month = parseInt(match[2], 10);
        if (month < 1 || month > 12) return null;
        return { day: parseInt(match[1], 10), month, year: parseInt(match[3], 10) };
    }
    return null;
}

function formatDateDisplay(dateStr, t) {
    const parsed = parseStandardDate(dateStr);
    if (!parsed) return dateStr;
    let { day, month, year } = parsed;
    if (year < 100) year += 2000;
    const monthNamesEn = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthKey = monthNamesEn[month - 1];
    let monthName = t[monthKey];
    if (!monthName) return dateStr;
    return `${day} ${monthName.toLowerCase()} ${year}`;
}

const tests = ["15.12.2024", "01.01.26", "2026-04-26", "29-3-26", "invalid", "15.00-17"];
tests.forEach(t => console.log(t, "->", formatDateDisplay(t, i18n.en)));
