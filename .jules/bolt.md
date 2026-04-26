## 2024-04-24 - Naming Conflict with React Components vs Standard Objects
**Learning:** In Next.js/React, components are often dynamically imported and might share names with standard JavaScript objects (like `Map`). In this project, `pages/index.js` dynamically imports a `Map` component from `../components/Map`. When adding memoization using `new Map()`, it caused a `ReferenceError` ("Cannot access 'Map' before initialization") because `Map` resolved to the React component variable which was declared further down via `const Map = dynamic(...)`.
**Action:** When adding standard objects like `Map`, `Set`, `URL` in the top level of a module where React components might be imported/declared, prefix with `globalThis.` (e.g., `new globalThis.Map()`) to avoid naming conflicts.

### Date Filtering & UI Checkbox Removal
* When fulfilling tasks that modify core filtering parameters (like `showPastRaces`), ensure you comprehensively trace state variables, dependent `useMemo` hooks, and associated dictionary (i18n) properties to securely unmount features.
* The Next.js dev server has a tendency to silently hang or throw port errors. Prefer using an isolated puppeteer test script pointing to the correct background-running local instance to accurately verify UX state against modifications.

## 2024-05-15 - Array Sort Memoization
**Learning:** React re-renders or sorting operations that rely on expensive parsing (like date string regex parsing in `parseStandardDate` or numeric parsing in `parseDistanceForSort`) inside `.sort()` callbacks scale poorly, repeating O(N log N) times.
**Action:** When filtering/sorting a list dynamically, module-level memoization of computed keys using `new globalThis.Map()` significantly prevents redundant object creation and string parsing.
## 2024-04-25 - Fast-fail optimization in data filtering loops
**Learning:** In frontend performance, when filtering large arrays (e.g., in `useMemo` hooks), performing expensive operations (like regex parsing strings into Date objects) on every iteration causes high CPU usage and garbage collection pressure, leading to UI thread blocking.
**Action:** Always implement a "fast-fail" (short-circuiting) pattern. Reorder conditionals so that cheap checks (string parsing, boolean checks) execute first. Defer expensive regex/instantiation operations until absolutely necessary. Hoist invariant object creations (e.g., `new Date()`) outside the loop and use integer math (`.getTime()`) for rapid comparisons.
