## 2024-05-20 - [Leaflet Popup DOM XSS]
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via `L.marker().bindPopup()` when rendering un-sanitized scraped string input.
**Learning:** Leaflet's `bindPopup(string)` inherently parses the string as raw HTML. When displaying third-party data from web scraping (e.g., race names or distances that could contain injected `<script>` tags by malicious providers), doing so directly exposes the user to XSS execution inside the map interface.
**Prevention:** Construct Leaflet popups safely by using standard DOM methods (`document.createElement()`, `document.createTextNode()`, and `textContent`) rather than string templates, and pass the generated `HTMLElement` to `bindPopup()`.
