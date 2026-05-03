export function safeJsonLd(data) {
  return JSON.stringify(data).replace(/[<>&]/g, (match) => {
    switch (match) {
      case '<':
        return '\\u003c';
      case '>':
        return '\\u003e';
      case '&':
        return '\\u0026';
      default:
        return match;
    }
  }).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
