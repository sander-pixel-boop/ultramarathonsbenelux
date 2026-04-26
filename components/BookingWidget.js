export default function BookingWidget({ city, country }) {
    if (!city) return null;

    // Construct the Booking.com search URL
    const searchUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city + ', ' + country)}`;

    return (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #b0d4ff', borderRadius: '8px' }}>
            <h3>Need a place to stay?</h3>
            <p>Find the best accommodations near the start line in <strong>{city}</strong>.</p>
            <a href={searchUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 15px', backgroundColor: '#003580', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
                Search on Booking.com
            </a>
        </div>
    );
}
