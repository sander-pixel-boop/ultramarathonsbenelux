## 2024-05-18 - Added ARIA labels to icon-only modal close buttons
**Learning:** Icon-only buttons (like those using `&times;` or SVG icons for closing modals) need `aria-label` attributes for accessibility so screen readers can interpret their function. This app's modal components frequently miss these labels.
**Action:** When adding or reviewing modal components and any other icon-only buttons, ensure an `aria-label` attribute (e.g. `aria-label="Close"`) is always provided.
