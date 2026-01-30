import type { ReactNode } from "react";

/** Single column definition for TableLayout */
export interface TableColumn<T = object> {
  /** Header label */
  head: string;
  /** Data key for simple cell value (ignored if component is set) */
  accessor?: keyof T | string;
  /** Sort key passed to setBody when column is sortable */
  sortKey?: string;
  /** Custom cell renderer: (row, rowIndex, fullData) */
  component?: (row: T, rowIndex: number, data: T[]) => ReactNode;
  /** Custom header renderer: (data, columnIndex, data) – for filters etc. */
  headComponent?: (data: T[], columnIndex: number, fullData: T[]) => ReactNode;
  /** Optional th className (e.g. text-right) */
  thClassName?: string;
  /** Optional td className */
  tdClassName?: string;
}

/** Sort state when using optional sorting */
export interface TableSortState {
  sort?: string;
  order?: 1 | -1;
}
