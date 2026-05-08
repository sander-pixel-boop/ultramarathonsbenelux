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

## 2026-04-27 - Object Mutation in Memoization
**Learning:** When memoizing a function that returns an object (like `parseStandardDate`), returning the cached object directly exposes the cache to downstream mutations (e.g., consumers modifying `result.month`). This creates a shared-state vulnerability (cache poisoning) where subsequent reads receive corrupted data.
**Action:** Always return a clone (e.g., `return { ...cached }`) when retrieving an object from a memoization cache, or `Object.freeze()` it upon insertion to enforce immutability.

## 2024-05-20 - SVG Elevation Chart Performance
**Learning:** React components dealing with large datasets inside `useMemo` hooks (like generating SVG elevation profiles using `race.elevation_points` in `CourseProfile.js`) often employ chaining functional arrays (`.reduce()`, `.map()`, `.filter()`). This leads to multiple O(n) array iterations and continuous memory allocation/garbage collection spikes.
**Action:** When working with thousands of numeric points for charting or path generation, replace functional array chaining with a single-pass primitive `for` loop. Compute min/max boundaries and string builder tasks simultaneously to minimize memory allocation overhead and prevent UI thread blocking.

## 2024-04-30 - Optimize Filter Operations
**Learning:** Calling `.toLowerCase()` inside array filter operations on heavily filtered datasets (e.g. `pages/index.js`) blocks the main thread during repetitive user input (search updates).
**Action:** Pre-compute lowercase string representations (`_lowerName`, `_lowerDistance`, `_lowerCountry`) during SSR in `getStaticProps` instead of computing them on the fly. This avoids runtime memory allocations and reduces string manipulation overhead inside `.filter()`, resulting in a >2x performance improvement.

## 2026-04-30 - [Performance Logging Requirement]
**Learning:** Learned that performance optimizations need to be logged in .jules/bolt.md.
**Action:** Logged.

## 2026-04-30 - Scraper Async Concurrency Optimization
**Learning:** Found that sequential looping in scraper scripts (e.g., `for (const el of events) { await processEvent(el) }`) creates a significant N+1 Async I/O bottleneck, heavily delaying data extraction.
**Action:** Replaced sequential looping with concurrency-controlled `Promise.all` batches using `MAX_CONCURRENT` when performing network I/O operations (like fetching event details) to dramatically improve scraper performance while avoiding overwhelming target servers.

## 2025-05-01 - Concurrency Limits for Async I/O
**Learning:** Sequential await calls for I/O operations (like fetching web pages in a loop) cause significant performance bottlenecks due to lack of concurrency.
**Action:** Implemented a lightweight `runWithLimit` concurrency control function to manage parallel async requests and refactored the sequential `for` loop in `scrape_hardloopkalender` to map into task functions executed concurrently, improving execution time from ~7.7s down to ~1.6s.

## 2024-05-22 - Network I/O Promise Chunking Optimization
**Learning:** Sequential async network I/O loops (e.g. `for (const x of events) { await fetch(x) }`) present severe bottlenecks, blocking execution on individual request latency.
**Action:** Use chunked `Promise.all` (`chunk.map(async () => ...); await Promise.all()`) to batch network calls in controlled bursts. This parallelizes latency while avoiding memory exhaustion or rate limit triggers, commonly providing a ~20x speedup compared to synchronous loops.

## 2024-05-24 - Pre-calculating Sort Keys (Schwartzian Transform)
**Learning:** Even with caching (`Map`), executing expensive operations (like string manipulation or regex parsing) inside the `Array.prototype.sort()` comparator scales poorly because the comparator is executed $O(N \log N)$ times.
**Action:** For lists filtered or sorted dynamically, map the objects to temporary structures pre-calculating the parsed value for comparison. Do an $O(N \log N)$ sort using these simple computed numeric values, then extract the origin objects. Avoid mutating the data itself with temporary attributes.
## 2024-05-20 - SVG Elevation Chart Performance\n**Learning:** React components dealing with large datasets inside `useMemo` hooks (like generating SVG elevation profiles using `race.elevation_points` in `CourseProfile.js`) often employ chaining functional arrays (`.reduce()`, `.map()`, `.filter()`). This leads to multiple O(n) array iterations and continuous memory allocation/garbage collection spikes.\n**Action:** When working with thousands of numeric points for charting or path generation, replace functional array chaining with a single-pass primitive `for` loop. Compute min/max boundaries and string builder tasks simultaneously to minimize memory allocation overhead and prevent UI thread blocking.
## 2024-05-19 - Separating invariant object map cycles from volatile state filters
**Learning:** In a `useMemo` block used for filtering arrays, if array items need to be temporarily augmented with lowercased search string fields (e.g. `_lowerName`), performing the mapping inside the `useMemo` that also depends on highly volatile variables (like the `search` keystrokes) causes major GC churn.
**Action:** Always extract invariant preprocessing `.map()` operations into their own `useMemo` block that only triggers when the primary data source updates, passing the preprocessed array into the volatile filter cycle.

## 2026-05-04 - Pre-calculated Sort Keys
**Learning:** For performance-critical sorting of arrays in React, pre-calculating sort keys in an initial mapping pass (preprocessing) is significantly more efficient than constructing object wrappers or re-parsing data during the sorting phase.
**Action:** Always hoist expensive parsing logic out of sort loops and into a single-pass preprocessing step. Perform in-place sorting on the resulting filtered array to minimize allocations and CPU cycles.
## 2024-05-18 - Avoid Memory Allocation in Inner React Filter Loops
**Learning:** Even when using memoized parsing functions (e.g. `parseStandardDate`), returning objects and subsequently instantiating new objects (like `new Date(...)`) inside a high-frequency React `useMemo` filter loop causes significant Garbage Collection (GC) pressure. This was verified via a benchmark script which showed that preprocessing values outside the filter loop reduced execution time by 98%.
**Action:** Always hoist object instantiations and data transformations out of inner loops (like search or filter filters) and pre-calculate invariant fields (e.g., sort keys, stringified years/months) during an initial preprocessing map phase.

## 2024-05-06 - Search Filter Debouncing
**Learning:** In a codebase with over 800+ mapped items in React where rendering relies on inline arrow functions and lacks component-level memoization, rapidly updating the state variable driving the `useMemo` filter array causes excessive filtering and DOM updates. Furthermore, adding debounced state directly to the top-level parent component fails to solve the issue because the keystroke state updates still force the entire parent and all its unmemoized children to re-render.
**Action:** Extract the fast-updating input into its own isolated component (`<SearchInput />`). This component should manage its own local keystroke state and use a `useEffect` debounce to push the final value up to the parent component, entirely skipping the parent render cycle during active typing.
## 2024-05-24 - Network I/O Promise Chunking Optimization
**Learning:** Sequential async network I/O loops (e.g. `for (const x of events) { await fetch(x) }`) present severe bottlenecks, blocking execution on individual request latency.
**Action:** Use chunked `Promise.all` (`chunk.map(async () => ...); await Promise.all()`) to batch network calls in controlled bursts. This parallelizes latency while avoiding memory exhaustion or rate limit triggers, commonly providing a ~4.6x speedup compared to synchronous loops.
## 2026-05-04 - Quiz Results Refactor
**Learning:** The previous implementation used .map() and object spreading inside a quiz results calculation function, allocating many objects unnecessarily before a sort, contributing to GC overhead and increasing execution time from ~550ms up to ~1100ms.
**Action:** Use primitive loops to accumulate items and scores into an array, sort in-place, and only return a sliced new object copy of the top results.
