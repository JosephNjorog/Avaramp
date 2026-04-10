"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  getRowKey?: (row: T, i: number) => string;
  // Pagination
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (p: number) => void;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-3.5 rounded-md" style={{ width: `${60 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T extends object>({
  columns,
  data,
  loading,
  emptyMessage = "No records found",
  onRowClick,
  getRowKey,
  page,
  totalPages,
  total,
  onPageChange,
}: DataTableProps<T>) {
  const showPagination = onPageChange && totalPages && totalPages > 1;

  return (
    <div className="flex flex-col gap-0">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wide whitespace-nowrap",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-16 text-muted text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={getRowKey ? getRowKey(row, i) : i}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-border transition-colors duration-100",
                    "hover:bg-surface/60",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-secondary whitespace-nowrap",
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-1 pt-3">
          <p className="text-xs text-muted">
            {total !== undefined ? `${total.toLocaleString()} total records` : ""}
          </p>
          <div className="flex items-center gap-1">
            <PagBtn
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              title="First"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </PagBtn>
            <PagBtn
              onClick={() => onPageChange((page ?? 1) - 1)}
              disabled={page === 1}
              title="Prev"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </PagBtn>
            <span className="text-xs text-secondary px-2">
              {page} / {totalPages}
            </span>
            <PagBtn
              onClick={() => onPageChange((page ?? 1) + 1)}
              disabled={page === totalPages}
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </PagBtn>
            <PagBtn
              onClick={() => onPageChange(totalPages ?? 1)}
              disabled={page === totalPages}
              title="Last"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PagBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-secondary hover:bg-surface hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
