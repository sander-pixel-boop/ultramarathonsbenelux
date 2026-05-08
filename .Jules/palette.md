## 2024-05-18 - Added ARIA labels to icon-only modal close buttons
**Learning:** Icon-only buttons (like those using `&times;` or SVG icons for closing modals) need `aria-label` attributes for accessibility so screen readers can interpret their function. This app's modal components frequently miss these labels.
**Action:** When adding or reviewing modal components and any other icon-only buttons, ensure an `aria-label` attribute (e.g. `aria-label="Close"`) is always provided.
## 2024-05-15 - Missing keyboard support on div/img click handlers
**Learning:** React elements like `div` or `img` with `onClick` handlers are not accessible via keyboard by default. A common pattern in this app's components (like language flags or race cards) was missing keyboard operability, making these key interactive elements impossible to use without a mouse.
**Action:** When adding `onClick` to non-interactive HTML elements (`div`, `span`, `img`), always ensure you pair it with `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that correctly traps the 'Enter' and 'Space' keys to fire the same behavior.
## 2024-05-19 - Added targeted focus-visible states
**Learning:** Using broad wildcard selectors like `*:focus-visible` can cause unintended styling overrides and layout shifts. It's better to target specific interactive elements.
**Action:** When adding focus rings for keyboard accessibility, target specific classes (like `.race-card`, `.modal-close`) and use `outline: none` with a custom `box-shadow` for a clean focus state.

## 2024-05-20 - Adding focus-visible styles to custom UI components
**Learning:** Custom interactive components, such as 'div' elements acting as selectable cards (e.g., quiz result cards), must provide explicit visual feedback when focused via keyboard navigation. Without a focused state, keyboard users cannot determine which element is currently active.
**Action:** When implementing custom interactive elements, always ensure a corresponding `:focus-visible` CSS rule is added to explicitly display a focus ring (e.g., using `box-shadow`), maintaining accessibility and matching the project's styling conventions.

## 2024-05-21 - Accessible clear buttons for controlled search inputs
**Learning:** When creating controlled text inputs for filtering lists (like the race search bar), users can struggle to quickly clear long queries, especially on mobile. While some browsers provide a native clear `x`, it is inconsistent across platforms.
**Action:** When adding critical search or filter text inputs, implement a custom, cross-browser 'clear' button inside the input group. Ensure it only appears when text is present, uses `type="button"` to avoid form submission, includes an `aria-label` for screen readers, and dynamically adjusts the input's `padding-right` so text doesn't overlap the button.

## 2024-05-22 - Prevent scroll bleeding and add ARIA roles to custom modals
**Learning:** Custom overlay modals (like the Quiz and Race Details) can suffer from "scroll bleeding" where the background page remains scrollable while the modal is open, confusing users on mobile. Additionally, without `role="dialog"` and `aria-modal="true"`, screen readers do not understand that the user is trapped within a dialog context.
**Action:** When implementing custom modal overlays, always use a `useEffect` hook to set `document.body.style.overflow = 'hidden'` while the modal is active (and reset it on unmount). Ensure the modal container includes `role="dialog"`, `aria-modal="true"`, and an appropriate `aria-label` or `aria-labelledby` referencing the modal title.

## 2024-05-18 - Modal Focus Management
**Learning:** Screen readers and keyboard users may not realize a modal has opened unless focus is explicitly moved into the modal container.
**Action:** When implementing custom modals, add `tabIndex={-1}`, `autoFocus`, and `style={{ outline: 'none' }}` to the modal container (the element with `role="dialog"`) so focus is automatically captured without showing a persistent visual outline.

## 2024-05-23 - Explicit labels vs placeholders
**Learning:** Using placeholders as the only visual label for inputs is an accessibility and UX anti-pattern. Placeholders disappear when text is entered, forcing users to rely on memory. While `aria-label` is sufficient for screen readers, it does not help visual users.
**Action:** When creating form inputs, avoid relying solely on placeholders or `aria-label`. Always provide a visible `<label>` element explicitly linked to the input via `htmlFor` and `id` to ensure clarity for all users.

## 2024-05-23 - Hover feedback for icon-only buttons
**Learning:** While `aria-label` makes icon-only buttons accessible to screen readers, sighted users relying on a mouse may not understand the icon's meaning without hovering.
**Action:** When using icon-only buttons, always provide a `title` attribute in addition to the `aria-label`. This provides a native tooltip on hover, improving clarity for sighted mouse users without cluttering the UI.
