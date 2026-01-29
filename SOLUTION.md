# Solution Steps

1. Create a shared analytics type definition file to keep the dashboard strongly typed.
- Add `src/types/analytics.ts`.
- Define the union type `TabId = 'overview' | 'scores' | 'activity'`.
- Define interfaces `OverviewMetric`, `ScoreRow`, and `ActivityRow` with all the fields used by the dashboard tables and overview cards.


2. Implement a mock analytics API that returns realistic, large datasets with simulated latency.
- Add `src/api/analyticsApi.ts`.
- Implement a helper `withLatency(factory, delay)` that wraps a synchronous factory in a `Promise` with `setTimeout` to simulate network delay.
- Implement `fetchOverviewMetrics()` that returns a small list of `OverviewMetric` items.
- Implement `fetchScoreRows(count = 3000)` that generates `count` synthetic `ScoreRow` entries with realistic-looking data.
- Implement `fetchActivityRows(count = 3000)` that generates `count` synthetic `ActivityRow` entries.
- Export all three functions.


3. Introduce a central analytics data context to handle lazy, cached data fetching per tab.
- Add `src/context/AnalyticsDataContext.tsx`.
- Define a generic `TabState<T>` with `status`, `data`, and `error` fields.
- Define `AnalyticsState` with `overview`, `scores`, and `activity` states using `TabState` and initialize them to `idle` via a helper `initialTabState<T>()`.
- Implement a `analyticsReducer` handling start/success/error actions for each of the three tabs, updating only the relevant slice of state.
- Define `AnalyticsContextValue` with `state` and three functions: `fetchOverview`, `fetchScores`, and `fetchActivity`.
- Create the context with `createContext<AnalyticsContextValue | undefined>(undefined)`.
- Implement `AnalyticsDataProvider`:
  - Use `useReducer` with `analyticsReducer` and `initialState`.
  - Implement `fetchOverview`, `fetchScores`, and `fetchActivity` as `useCallback` functions.
  - In each fetch function, early-return if the tab is already `loading` or `success` to avoid redundant calls.
  - Dispatch `*_START`, call the respective API function, and then dispatch `*_SUCCESS` or `*_ERROR` with an error-safe message.
  - Memoize the context `value` with `useMemo`.
  - Render `AnalyticsDataContext.Provider` with the memoized `value`.
- Implement `useAnalyticsData()` hook that reads the context and throws a clear error if used outside the provider.


4. Create tab-specific hooks that trigger lazy loading only when a tab is actually viewed.
- Add `src/hooks/useAnalyticsTabData.ts`.
- Implement `useOverviewTabData(autoFetch = true)`:
  - Read `{ state, fetchOverview }` from `useAnalyticsData()`.
  - In `useEffect`, if `autoFetch` is true and `state.overview.status` is `idle`, call `fetchOverview()`.
  - Return `state.overview`.
- Implement `useScoresTabData(autoFetch = true)` and `useActivityTabData(autoFetch = true)` with the same pattern using `fetchScores` and `fetchActivity` respectively.
- This ensures data is only fetched when its tab is first mounted, not eagerly for all tabs.


5. Build a reusable, high-performance table component with simple virtualization for large datasets.
- Add `src/components/common/LargeTable.tsx`.
- Define a generic `Column<T>` interface with `key`, `header`, optional `width`, and optional `render(row)`.
- Define a generic `LargeTableProps<T extends { id: string | number }>` with `rows`, `columns`, optional `rowHeight`, and optional `height`.
- Inside `LargeTableComponent`:
  - Accept `rows`, `columns`, `rowHeight` (default ~40), and `height` (default ~420).
  - Keep `scrollTop` in local state; update it on the scroll handler.
  - Use `useMemo` to compute `visibleRows`, `startIndex`, and `totalHeight`:
    - Compute `rowCount` and `total = rowCount * rowHeight`.
    - From `scrollTop` and `rowHeight`, derive `startIndex`.
    - Compute `visibleCount = ceil(height / rowHeight)` and define `endIndex` with an `OVERSCAN_COUNT` for smoother scrolling.
    - Slice `rows` into `visibleRows` and return `{ visibleRows, startIndex, totalHeight }`.
  - Render a fixed header row (non-scrollable) using `columns`.
  - Render a scrollable body:
    - Outer `div` with fixed `height` and `overflowY: 'auto'` and `onScroll={handleScroll}`.
    - Inner `div` with `height: totalHeight` and `position: 'relative'`.
    - For each `visibleRow`, compute `rowIndex = startIndex + index` and render an absolutely positioned row at `top: rowIndex * rowHeight`.
    - Within each row, render each column, using `column.render(row)` if provided, otherwise `row[column.key]`.
    - Show a “No data” message when `visibleRows` is empty.
- Implement `arePropsEqual` that shallow-compares `rows`, `columns`, `rowHeight`, and `height` to skip unnecessary re-renders.
- Export `LargeTable` as a memoized component using `React.memo(LargeTableComponent, arePropsEqual)` preserving generics.


6. Implement the tab switcher component that only renders the active tab content.
- Add `src/components/Tabs.tsx`.
- Define `TabsProps` with `activeTab: TabId`, `onChange(tab)`, and `isPending` (for a subtle loading hint).
- Create a `TAB_LABELS` map from `TabId` to string labels.
- Render buttons for each tab ID:
  - Highlight the `activeTab` via styles (background, border, font weight).
  - Call `onChange(tabId)` on click.
- Optionally show a small “Rendering view” text when `isPending` is true.
- Export `Tabs`.


7. Wire up the main dashboard container that coordinates the active tab and uses React transitions to keep the UI responsive.
- Add `src/components/Dashboard.tsx`.
- Keep `activeTab` state of type `TabId`, initialized to `'overview'`.
- Use `useTransition()` to obtain `[isPending, startTransition]`.
- Implement `handleTabChange(nextTab)`:
  - Ignore if `nextTab === activeTab`.
  - Call `startTransition(() => setActiveTab(nextTab))` so heavy tab renders don’t block the tab button update.
- Render the `Tabs` component with `activeTab`, `onChange={handleTabChange}`, and `isPending`.
- Conditionally render only the active tab component:
  - `activeTab === 'overview' && <OverviewTab />`.
  - `activeTab === 'scores' && <ScoresTab />`.
  - `activeTab === 'activity' && <ActivityTab />`.
- Export `Dashboard`.


8. Implement the overview tab using the lazy-loading hook and keep the UI simple and fast.
- Add `src/components/tabs/OverviewTab.tsx`.
- Call `useOverviewTabData(true)` to obtain the overview tab state.
- Use `useMemo` to derive `metrics = overview.data ?? []`.
- Show a small loading text when `status === 'loading'` and no data yet.
- On `status === 'error'`, render an inline error box with the error message.
- When data is available, render overview cards in a CSS grid (`gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'`).
  - For each metric, show label, value, and delta.
  - Compute `positive = metric.delta >= 0`, derive sign (`+` or empty) and color (green for positive, red for negative).
- Export `OverviewTab`.


9. Implement the scores tab that uses the memoized virtualized table.
- Add `src/components/tabs/ScoresTab.tsx`.
- Use `useScoresTabData(true)` to read lazy-loaded score state.
- Define `columns` with `useMemo` to keep the reference stable across renders:
  - Candidate, Assessment, Score, Percentile, Submitted (formatted with `toLocaleString()`), and Duration.
- Derive `hasData = !!scores.data && scores.data.length > 0`.
- Show a loading text only when `status === 'loading'` and there is no data yet.
- Show an inline error box when `status === 'error'`.
- When `hasData` is true, render `<LargeTable<ScoreRow> rows={scores.data} columns={columns} rowHeight={40} height={440} />`.
- Export `ScoresTab`.


10. Implement the activity tab, mirroring the scores tab behavior with its own columns.
- Add `src/components/tabs/ActivityTab.tsx`.
- Use `useActivityTabData(true)` to read lazy-loaded activity state.
- Define `columns` with `useMemo` for Candidate, Assessment, Event, Timestamp (formatted with `toLocaleString()`), and Metadata.
- Derive `hasData = !!activity.data && activity.data.length > 0`.
- Show a loading text when `status === 'loading'` and there is no data yet.
- Show an inline error box when `status === 'error'`.
- When `hasData` is true, render `<LargeTable<ActivityRow> rows={activity.data} columns={columns} rowHeight={40} height={440} />`.
- Export `ActivityTab`.


11. Create the application shell and mount point, wrapping everything in the analytics data provider.
- Add `src/App.tsx`:
  - Render a simple layout with a sticky header and a main section.
  - Inside main, render `<Dashboard />`.
- Add `src/index.tsx`:
  - Grab the `root` DOM element.
  - Use `createRoot` from `react-dom/client` to render.
  - Wrap `<App />` with `<AnalyticsDataProvider>` so all dashboard components can access shared cached data.
  - Keep `React.StrictMode` at the top level for dev safety.


12. Verify that the optimizations meet the task goals:
- Only the active tab component is rendered (and thus only its data is fetched) because the dashboard conditionally renders a single tab panel based on `activeTab`.
- `AnalyticsDataContext` ensures each tab’s data is fetched at most once and cached for subsequent visits, avoiding redundant network calls.
- `LargeTable` virtualizes thousands of rows and is wrapped in `React.memo` with stable `rows` and `columns` props, minimizing re-renders during tab switches and scroll.
- `useTransition` in `Dashboard` improves perceived responsiveness when switching to heavy tabs by making the tab button state update immediately while the new content renders in the background.
- TypeScript types are preserved end-to-end through shared interfaces, context state, hooks, and table generics.

