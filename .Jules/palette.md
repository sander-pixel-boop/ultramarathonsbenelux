## 2024-05-18 - Added ARIA labels to icon-only modal close buttons
**Learning:** Icon-only buttons (like those using `&times;` or SVG icons for closing modals) need `aria-label` attributes for accessibility so screen readers can interpret their function. This app's modal components frequently miss these labels.
**Action:** When adding or reviewing modal components and any other icon-only buttons, ensure an `aria-label` attribute (e.g. `aria-label="Close"`) is always provided.
## 2024-05-15 - Missing keyboard support on div/img click handlers
**Learning:** React elements like `div` or `img` with `onClick` handlers are not accessible via keyboard by default. A common pattern in this app's components (like language flags or race cards) was missing keyboard operability, making these key interactive elements impossible to use without a mouse.
**Action:** When adding `onClick` to non-interactive HTML elements (`div`, `span`, `img`), always ensure you pair it with `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that correctly traps the 'Enter' and 'Space' keys to fire the same behavior.
## 2024-05-19 - Added targeted focus-visible states
**Learning:** Using broad wildcard selectors like `*:focus-visible` can cause unintended styling overrides and layout shifts. It's better to target specific interactive elements.
**Action:** When adding focus rings for keyboard accessibility, target specific classes (like `.race-card`, `.modal-close`) and use `outline: none` with a custom `box-shadow` for a clean focus state.
