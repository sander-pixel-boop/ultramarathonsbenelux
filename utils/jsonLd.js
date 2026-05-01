/**
 * Safely converts an object to a JSON string for use in JSON-LD <script> tags.
 * Escapes characters that could be interpreted as HTML tags or script closing tags,
 * preventing Cross-Site Scripting (XSS) vulnerabilities.
 *
 * @param {Object} data - The object to serialize to JSON.
 * @returns {string} The safely escaped JSON string.
 */
export function safeJsonLd(data) {
    return JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}
