export async function getUserCountry() {
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/country.json');
        if (response.ok) {
            const data = await response.json();
            return data.country; // returns 'US', 'NL', 'BE', 'LU', etc.
        }
    } catch (e) {
        console.error("Error fetching user country:", e);
    }
    return null;
}

export function getAffiliateLink(itemKeyword, country) {
    // If the user is in the Netherlands, point links to amazon.nl or futurumshop.nl
    // if in Belgium/Luxembourg, prioritize amazon.de or asadventure.com.
    const keyword = encodeURIComponent(itemKeyword);
    const tag = 'your_amazon_tag_here'; // default placeholder tag

    if (country === 'NL') {
        return `https://www.amazon.nl/s?k=${keyword}&tag=${tag}`;
    } else if (country === 'BE' || country === 'LU') {
        return `https://www.amazon.de/s?k=${keyword}&tag=${tag}`;
    } else {
        return `https://www.amazon.com/s?k=${keyword}&tag=${tag}`;
    }
}
