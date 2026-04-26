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

export function getAffiliateLinks(itemKeyword, country) {
    const keyword = encodeURIComponent(itemKeyword);

    // Placeholder tags
    const amazonTag = 'your_amazon_tag_here';
    const decathlonTag = 'your_decathlon_tag_here';
    const asAdventureTag = 'your_asadventure_tag_here';
    const futurumshopTag = 'your_futurumshop_tag_here';

    const links = [];

    if (country === 'NL') {
        links.push({ store: 'Amazon', url: `https://www.amazon.nl/s?k=${keyword}&tag=${amazonTag}` });
        links.push({ store: 'Decathlon', url: `https://www.decathlon.nl/search?Ntt=${keyword}&affiliate=${decathlonTag}` });
        links.push({ store: 'Futurumshop', url: `https://www.futurumshop.nl/zoeken?q=${keyword}&affiliate=${futurumshopTag}` });
    } else if (country === 'BE' || country === 'LU') {
        links.push({ store: 'Amazon', url: `https://www.amazon.de/s?k=${keyword}&tag=${amazonTag}` });
        links.push({ store: 'Decathlon', url: `https://www.decathlon.be/nl/search?Ntt=${keyword}&affiliate=${decathlonTag}` });
        links.push({ store: 'AS Adventure', url: `https://www.asadventure.com/nl/c/search.html?q=${keyword}&affiliate=${asAdventureTag}` });
    } else {
        links.push({ store: 'Amazon', url: `https://www.amazon.com/s?k=${keyword}&tag=${amazonTag}` });
        links.push({ store: 'Decathlon', url: `https://www.decathlon.com/search?q=${keyword}&affiliate=${decathlonTag}` });
    }

    return links;
}
