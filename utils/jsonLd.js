/**
 * Safely stringifies an object for use in a JSON-LD script tag.
 * It escapes characters that could be used for XSS attacks,
 * specifically <, >, &, \u2028, and \u2029.
 *
 * @param {Object} data - The object to stringify.
 * @returns {string} - The sanitized JSON string.
 */
export function safeJsonLd(data) {
  return JSON.stringify(data).replace(/[<>&]/g, (char) => {
    switch (char) {
      case '<':
        return '\\u003c';
      case '>':
        return '\\u003e';
      case '&':
        return '\\u0026';
      default:
        return char;
    }
  }).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
