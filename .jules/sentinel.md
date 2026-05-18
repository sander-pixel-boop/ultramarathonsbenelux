## 2024-05-24 - [Input Length Limits Missing]
**Vulnerability:** Text inputs (`SearchInput.js` and `FinishTimeCalculator.js`) lack `maxLength` attributes, allowing unbounded text input.
**Learning:** Without limits, malicious users can paste excessively large strings, causing client-side DoS (UI freezing, high memory consumption) when processing the input (e.g., regex, filtering).
**Prevention:** Always set reasonable `maxLength` limits on client-side text inputs to prevent DoS and ensure stability.
