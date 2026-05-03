/**
 * Safely stringifies a JSON object for inclusion inside an HTML `<script type="application/ld+json">` tag.
 * It escapes characters that could potentially terminate the script tag or be interpreted as HTML markup,
 * preventing Cross-Site Scripting (XSS) vulnerabilities.
 *
 * @param {Object} obj - The JSON-LD object to stringify.
 * @returns {string} - The safely stringified JSON string.
 */
export function safeJsonLd(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
