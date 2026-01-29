import React, { useCallback, useMemo, useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  width?: string | number;
  /** Optional custom cell renderer. */
  render?: (row: T) => React.ReactNode;
}

export interface LargeTableProps<T extends { id: string | number }> {
  rows: T[];
  columns: Column<T>[];
  /**
   * Fixed row height in pixels. Required for simple virtualization.
   */
  rowHeight?: number;
  /**
   * Viewport height in pixels.
   */
  height?: number;
}

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_HEIGHT = 420;
const OVERSCAN_COUNT = 5;

function LargeTableComponent<T extends { id: string | number }>(
  props: LargeTableProps<T>,
) {
  const { rows, columns, rowHeight = DEFAULT_ROW_HEIGHT, height = DEFAULT_HEIGHT } = props;

  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const { visibleRows, startIndex, totalHeight } = useMemo(() => {
    const rowCount = rows.length;
    const total = rowCount * rowHeight;

    if (rowCount === 0) {
      return {
        visibleRows: [] as T[],
        startIndex: 0,
        totalHeight: 0,
      };
    }

    const safeHeight = height > 0 ? height : DEFAULT_HEIGHT;
    const visibleCount = Math.ceil(safeHeight / rowHeight);

    const start = Math.max(0, Math.floor(scrollTop / rowHeight));
    const end = Math.min(
      rowCount - 1,
      start + visibleCount + OVERSCAN_COUNT,
    );

    return {
      visibleRows: rows.slice(start, end + 1),
      startIndex: start,
      totalHeight: total,
    };
  }, [rows, rowHeight, height, scrollTop]);

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            style={{
              flex: column.width ? "0 0 auto" : 1,
              width: column.width,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#4b5563",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {column.header}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          height,
          overflowY: "auto",
          backgroundColor: "#ffffff",
        }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleRows.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: rowHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              No data
            </div>
          )}

          {visibleRows.map((row, index) => {
            const rowIndex = startIndex + index;

            return (
              <div
                key={row.id}
                style={{
                  position: "absolute",
                  top: rowIndex * rowHeight,
                  left: 0,
                  right: 0,
                  height: rowHeight,
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #f3f4f6",
                  backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
                  fontSize: 12,
                  color: "#111827",
                }}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    style={{
                      flex: column.width ? "0 0 auto" : 1,
                      width: column.width,
                      padding: "0 12px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {column.render ? column.render(row) : (row as any)[column.key]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function arePropsEqual<T extends { id: string | number }>(
  prev: Readonly<LargeTableProps<T>>,
  next: Readonly<LargeTableProps<T>>,
): boolean {
  return (
    prev.rows === next.rows &&
    prev.columns === next.columns &&
    prev.rowHeight === next.rowHeight &&
    prev.height === next.height
  );
}

/**
 * Memoized large table with simple windowing/virtualization.
 *
 * - Only the visible slice of rows is rendered, keeping tab switches snappy
 *   even with thousands of rows.
 * - Parent components should keep `rows` and `columns` references stable
 *   (e.g. via `useMemo`) so this component can skip unnecessary re-renders.
 */
export const LargeTable = React.memo(LargeTableComponent, arePropsEqual) as <
  T extends { id: string | number },
>(
  props: LargeTableProps<T>,
) => JSX.Element;
