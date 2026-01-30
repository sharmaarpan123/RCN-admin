"use client";

import React from "react";
import type { TableColumn, TableSortState } from "./types";

const SortUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle ml-0.5 opacity-70" aria-hidden>
    <path d="M7 14l5-5 5 5H7z" />
  </svg>
);

const SortDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle ml-0.5 opacity-70" aria-hidden>
    <path d="M7 10l5 5 5-5H7z" />
  </svg>
);

export interface TableLayoutProps<T = object> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Row data */
  data: T[];
  /** Loading state – shows loading row */
  loader?: boolean;
  /** Optional sort state (when using sortable columns) */
  body?: TableSortState;
  /** Optional setState for sort (enables click-to-sort on sortKey columns) */
  setBody?: React.Dispatch<React.SetStateAction<TableSortState>>;
  /** Empty message when data is empty and not loading */
  emptyMessage?: string;
  /** Optional table className */
  tableClassName?: string;
  /** Optional wrapper className (e.g. min-w for horizontal scroll) */
  wrapperClassName?: string;
  /** Optional row key extractor; defaults to (row, i) => i */
  getRowKey?: (row: T, index: number) => string | number;
  /** Optional onRowClick */
  onRowClick?: (row: T, index: number) => void;
  /** "bordered" = master-admin style (border-separate, rounded-2xl, header bg) */
  variant?: "default" | "bordered";
  /** When variant="bordered", use smaller text (text-xs) */
  size?: "sm" | "md";
}

function TableLayoutInner<T extends object>({
  columns,
  data,
  loader = false,
  body,
  setBody,
  emptyMessage = "No data found.",
  tableClassName = "",
  wrapperClassName = "",
  getRowKey = (_, i) => i,
  onRowClick,
  variant = "default",
  size = "md",
}: TableLayoutProps<T>) {
  const colCount = columns?.length ?? 0;
  const isBordered = variant === "bordered";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  const handleSort = (sortKey: string) => {
    if (!body || !setBody) return;
    setBody((p) => ({
      ...p,
      sort: sortKey,
      order: (p.order === -1 ? 1 : -1) as 1 | -1,
    }));
  };

  return (
    <div className={`overflow-x-auto ${wrapperClassName}`.trim()}>
      <table
        className={`w-full ${isBordered ? "border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border" : "border-collapse"} ${textSize} ${tableClassName}`.trim()}
        role="grid"
        aria-readonly
      >
        <thead>
          <tr className={isBordered ? "bg-[#f6fbf7] text-rcn-dark-bg" : "bg-rcn-bg/90 border-b border-rcn-border/60"}>
            {columns?.length > 0 &&
              columns.map((item, key) => {
                if (item.headComponent) {
                  return (
                    <th
                      key={key}
                      className={`px-2 py-2 sm:px-3 sm:py-2.5 text-left text-xs uppercase tracking-wide font-semibold ${isBordered ? "border-b border-rcn-border text-rcn-dark-bg" : "text-rcn-muted"} ${item.thClassName ?? ""}`.trim()}
                    >
                      {item.headComponent(data, key, data)}
                    </th>
                  );
                }
                const isSortable = Boolean(item.sortKey && body && setBody);
                return (
                  <th
                    key={key}
                    className={`px-2 py-2 sm:px-3 sm:py-2.5 text-left text-xs uppercase tracking-wide font-semibold ${isBordered ? "border-b border-rcn-border text-rcn-dark-bg" : "text-rcn-muted"} ${item.thClassName ?? ""} ${isSortable ? "cursor-pointer select-none hover:text-rcn-accent" : ""}`.trim()}
                    onClick={() => {
                      if (isSortable && item.sortKey) handleSort(item.sortKey);
                    }}
                  >
                    {item.head}{" "}
                    {item.sortKey && body && setBody && (
                      <>
                        {body.sort === item.sortKey ? (
                          body.order === -1 ? (
                            <SortUpIcon />
                          ) : (
                            <SortDownIcon />
                          )
                        ) : null}
                      </>
                    )}
                  </th>
                );
              })}
          </tr>
        </thead>
        <tbody>
          {!loader && data?.length > 0 &&
            data.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                className={`${isBordered ? "border-b border-rcn-border" : "border-t border-rcn-border/60"} hover:bg-rcn-accent/5 ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns?.length > 0 &&
                  columns.map((col, colIndex) => {
                    if (col.component) {
                      return (
                        <td
                          key={colIndex}
                          className={`px-2.5 py-2.5 ${isBordered ? "border-b border-rcn-border text-xs align-top" : "sm:px-3 sm:py-2.5"} ${col.tdClassName ?? ""}`.trim()}
                        >
                          {col.component(row, rowIndex, data)}
                        </td>
                      );
                    }
                    const accessor = col.accessor;
                    const value = accessor != null ? (row as Record<string, unknown>)[accessor as string] : undefined;
                    return (
                      <td
                        key={colIndex}
                        className={`px-2.5 py-2.5 ${isBordered ? "border-b border-rcn-border text-xs align-top" : "sm:px-3 sm:py-2.5"} ${col.tdClassName ?? ""}`.trim()}
                      >
                        {value != null && value !== "" ? String(value) : "—"}
                      </td>
                    );
                  })}
              </tr>
            ))}
          {loader && (
            <tr>
              <td colSpan={colCount} className="px-2 py-8 sm:px-3 text-center">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-rcn-border border-t-rcn-accent" aria-hidden />
                <p className="text-xs text-rcn-muted mt-2 mb-0">Loading…</p>
              </td>
            </tr>
          )}
          {!loader && (!data || data.length === 0) && (
            <tr>
              <td colSpan={colCount} className="px-2 py-6 sm:px-3 text-rcn-muted text-xs text-center">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Cast so we can use generic with default type
const TableLayout = TableLayoutInner as <T extends object>(
  props: TableLayoutProps<T>
) => React.ReactElement;

export default TableLayout;
