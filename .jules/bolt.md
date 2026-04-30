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
\n## 2026-04-27 - Object Mutation in Memoization\n**Learning:** When memoizing a function that returns an object (like `parseStandardDate`), returning the cached object directly exposes the cache to downstream mutations (e.g., consumers modifying `result.month`). This creates a shared-state vulnerability (cache poisoning) where subsequent reads receive corrupted data.\n**Action:** Always return a clone (e.g., `return { ...cached }`) when retrieving an object from a memoization cache, or `Object.freeze()` it upon insertion to enforce immutability.

## 2024-05-20 - SVG Elevation Chart Performance
**Learning:** React components dealing with large datasets inside `useMemo` hooks (like generating SVG elevation profiles using `race.elevation_points` in `CourseProfile.js`) often employ chaining functional arrays (`.reduce()`, `.map()`, `.filter()`). This leads to multiple O(n) array iterations and continuous memory allocation/garbage collection spikes.
**Action:** When working with thousands of numeric points for charting or path generation, replace functional array chaining with a single-pass primitive `for` loop. Compute min/max boundaries and string builder tasks simultaneously to minimize memory allocation overhead and prevent UI thread blocking.

## 2024-04-30 - Optimize Filter Operations
**Learning:** Calling `.toLowerCase()` inside array filter operations on heavily filtered datasets (e.g. `pages/index.js`) blocks the main thread during repetitive user input (search updates).
**Action:** Pre-compute lowercase string representations (`_lowerName`, `_lowerDistance`, `_lowerCountry`) during SSR in `getStaticProps` instead of computing them on the fly. This avoids runtime memory allocations and reduces string manipulation overhead inside `.filter()`, resulting in a >2x performance improvement.
## 2026-04-30 - [Performance Logging Requirement]\n**Learning:** Learned that performance optimizations need to be logged in .jules/bolt.md.\n**Action:** Logged.
## 2026-04-30 - Scraper Async Concurrency Optimization
**Learning:** Found that sequential looping in scraper scripts (e.g., \`for (const el of events) { await processEvent(el) }\`) creates a significant N+1 Async I/O bottleneck, heavily delaying data extraction.
**Action:** Replaced sequential looping with concurrency-controlled \`Promise.all\` batches using \`MAX_CONCURRENT\` when performing network I/O operations (like fetching event details) to dramatically improve scraper performance while avoiding overwhelming target servers.

## 2025-05-01 - Concurrency Limits for Async I/O
**Learning:** Sequential await calls for I/O operations (like fetching web pages in a loop) cause significant performance bottlenecks due to lack of concurrency.
**Action:** Implemented a lightweight `runWithLimit` concurrency control function to manage parallel async requests and refactored the sequential `for` loop in `scrape_hardloopkalender` to map into task functions executed concurrently, improving execution time from ~7.7s down to ~1.6s.

## 2024-05-22 - Network I/O Promise Chunking Optimization
**Learning:** Sequential async network I/O loops (e.g. `for (const x of events) { await fetch(x) }`) present severe bottlenecks, blocking execution on individual request latency.
**Action:** Use chunked `Promise.all` (`chunk.map(async () => ...); await Promise.all()`) to batch network calls in controlled bursts. This parallelizes latency while avoiding memory exhaustion or rate limit triggers, commonly providing a ~20x speedup compared to synchronous loops.
