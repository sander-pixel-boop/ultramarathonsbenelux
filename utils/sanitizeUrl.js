/**
 * Sanitizes URLs to prevent XSS via javascript: or data: URIs.
 * If the URL is potentially unsafe, it returns a safe fallback (e.g., '#').
 *
 * @param {string} url - The URL to sanitize.
 * @returns {string} - The sanitized URL.
 */
export function sanitizeUrl(url) {
    if (!url) return '#';

    // Strip control characters and whitespace to prevent bypasses
    const cleanUrl = url.replace(/[\x00-\x20\x7F]/g, '').toLowerCase();
    if (cleanUrl.startsWith('javascript:') || cleanUrl.startsWith('vbscript:') || cleanUrl.startsWith('data:')) {
        return '#';
    }

    try {
        // Handle absolute URLs
        const parsedUrl = new URL(url, 'https://example.com'); // Base is needed for relative URLs to parse correctly
        const protocol = parsedUrl.protocol.toLowerCase();

        // List of allowed protocols
        const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

        if (allowedProtocols.includes(protocol)) {
            // For relative URLs or valid absolute URLs, return the original string
            // to preserve things like relative paths.
            return url;
        }

        return '#';
    } catch (e) {
        // If URL parsing fails, it might be a weird malformed URL
        return '#';
    }
}
