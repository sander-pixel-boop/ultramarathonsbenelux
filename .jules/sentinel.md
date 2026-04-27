## 2024-05-20 - [Leaflet Popup DOM XSS]
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via `L.marker().bindPopup()` when rendering un-sanitized scraped string input.
**Learning:** Leaflet's `bindPopup(string)` inherently parses the string as raw HTML. When displaying third-party data from web scraping (e.g., race names or distances that could contain injected `<script>` tags by malicious providers), doing so directly exposes the user to XSS execution inside the map interface.
**Prevention:** Construct Leaflet popups safely by using standard DOM methods (`document.createElement()`, `document.createTextNode()`, and `textContent`) rather than string templates, and pass the generated `HTMLElement` to `bindPopup()`.
## 2026-04-25 - XSS in Blog Posts
**Vulnerability:** Cross-Site Scripting (XSS) via dangerouslySetInnerHTML in pages/blog/[slug].js
**Learning:** Rendering raw HTML from JSON files directly into the DOM using dangerouslySetInnerHTML exposes the application to XSS attacks if the JSON data is ever modified or compromised.
**Prevention:** Always sanitize HTML before rendering it using a library like DOMPurify, even if the data comes from a local file, to ensure defense in depth.
## 2026-05-20 - [XSS via Unsanitized External URLs in Links]
**Vulnerability:** Cross-Site Scripting (XSS) via `javascript:` URIs passed to `href` attributes in `<a>` tags.
**Learning:** React escapes text in curly braces but does NOT validate URLs. Rendering un-sanitized scraped URLs directly into `href` properties (e.g., `href={race.url}`) exposes the application to XSS attacks if the scraped string begins with `javascript:`, `vbscript:`, or `data:text/html`.
**Prevention:** Use a utility function to validate and sanitize dynamic URLs (e.g., allowing only `http:`, `https:`, `mailto:`, and `tel:`) before passing them to the `href` attribute.
