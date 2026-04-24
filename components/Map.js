import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function Map({ races, t, formatRaceName, lang }) {
    const mapRef = useRef(null);
    const markersLayerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) {
            // Initialize map
            mapRef.current = L.map('map').setView([51.2, 5.5], 7);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapRef.current);

            markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

            // Fix for Leaflet marker icons in Next.js/Webpack
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        }
    }, []);

    useEffect(() => {
        if (markersLayerRef.current) {
            markersLayerRef.current.clearLayers();

            races.forEach(race => {
                if (race.lat && race.lng) {
                    let translatedCountry = race.country;
                    if (race.country && race.country.toLowerCase() === 'belgium') translatedCountry = t.belgium;
                    if (race.country && race.country.toLowerCase() === 'netherlands') translatedCountry = t.netherlands;
                    if (race.country && race.country.toLowerCase() === 'luxembourg') translatedCountry = t.luxembourg;

                    const formattedRace = formatRaceName(race.name);
                    const marker = L.marker([race.lat, race.lng]);

                    // Prevent DOM XSS by constructing the popup safely using DOM nodes
                    const popupContent = document.createElement('div');
                    const boldText = document.createElement('b');
                    boldText.textContent = formattedRace.name;
                    popupContent.appendChild(boldText);
                    popupContent.appendChild(document.createElement('br'));
                    popupContent.appendChild(document.createTextNode(`${race.distance} - ${translatedCountry}`));

                    marker.bindPopup(popupContent);
                    markersLayerRef.current.addLayer(marker);
                }
            });
        }
    }, [races, t, formatRaceName, lang]);

    return <div id="map"></div>;
}
