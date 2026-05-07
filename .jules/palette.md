## 2026-04-27 - Add Escape Key Support for Modals
**Learning:** React modals missing 'Escape' key support is an accessibility and UX issue. Users often expect to press Esc to dismiss popups.
**Action:** When creating custom modal components or overlays, ensure a global 'keydown' event listener handles the 'Escape' key to dismiss the active modal.
## 2026-05-06 - Dark Mode UI Overhaul
**Learning:** Overhauling UI inline styles and isolated <style jsx> blocks within a React/Next.js application requires extreme care to prevent build breakages and component parse errors. String-replace operations can inadvertently damage JSX structures, especially when classNames and ternary operations are involved.
**Action:** When performing sweeping design system upgrades (e.g., applying a glassmorphism dark theme), extract styling to a global utility sheet (e.g., global.css). During refactoring, use extremely precise AST parsing or careful manual/regex replacement to avoid introducing Turbopack/Next.js compilation errors.
