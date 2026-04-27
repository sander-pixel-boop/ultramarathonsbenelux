## 2026-04-27 - Add Escape Key Support for Modals
**Learning:** React modals missing 'Escape' key support is an accessibility and UX issue. Users often expect to press Esc to dismiss popups.
**Action:** When creating custom modal components or overlays, ensure a global 'keydown' event listener handles the 'Escape' key to dismiss the active modal.
