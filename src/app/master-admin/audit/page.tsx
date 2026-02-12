"use client";
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fmtDate, escapeHtml } from "@/utils/database";
import { toastSuccess } from "@/utils/toast";
import { Button, TableLayout, type TableColumn } from "@/components";
import { getAdminAuthLogsApi } from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { checkResponse } from "@/utils/commonFunc";

type AuditLogItem = {
  _id?: string;
  id?: string;
  action?: string;
  user_id?: string;
  user_name?: string;
  email?: string;
  role_id?: number;
  role_type?: string;
  device_type?: string | null;
  device_token?: string | null;
  ip_address?: string;
  user_agent?: string;
  details?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

type AuditLogsApiResponse = {
  success?: boolean;
  message?: string;
  data?: AuditLogItem[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
};

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

const Audit: React.FC = () => {
  const [search, setSearch] = useState("");

  const { data: auditRes, isLoading, refetch } = useQuery({
    queryKey: defaultQueryKeys.auditLogsList,
    queryFn: async () => {
      const res = await getAdminAuthLogsApi();
      if (!checkResponse({ res })) return { data: [] } as AuditLogsApiResponse;
      const body = res.data as AuditLogsApiResponse | { data?: AuditLogItem[] };
      return {
        ...(typeof body === "object" && body ? body : {}),
        data: (body as AuditLogsApiResponse)?.data ?? [],
      } as AuditLogsApiResponse;
    },
  });

  const auditData = useMemo(
    () => (auditRes?.data ?? []) as AuditLogItem[],
    [auditRes]
  );

  const filteredAudit = useMemo(() => {
    const q = safeLower(search);
    if (!q) return auditData;
    return auditData.filter((row) => {
      const hay = [
        row.action,
        row.user_name,
        row.email,
        row.role_type,
        row.ip_address,
        row.user_agent,
      ]
        .map(safeLower)
        .join(" ");
      return hay.includes(q);
    });
  }, [auditData, search]);

  const clearLog = () => {
    if (window.confirm("Clear audit log?")) {
      toastSuccess("Audit log cleared (demo only - not persisted).");
    }
  };

  const data = filteredAudit.slice(0, 200);
  const columns: TableColumn<AuditLogItem>[] = [
    {
      head: "Time",
      component: (row) =>
        row.createdAt ? (
          <>
            {fmtDate(row.createdAt)}
            <div className="text-rcn-muted font-mono text-xs">
              {new Date(row.createdAt).toLocaleString()}
            </div>
          </>
        ) : (
          <span className="text-rcn-muted">—</span>
        ),
    },
    {
      head: "User",
      component: (row) => (
        <div>
          <span className="font-mono font-medium">
            {row.user_name || row.email || "—"}
          </span>
          {row.email && (
            <div className="text-rcn-muted font-mono text-xs">{row.email}</div>
          )}
        </div>
      ),
    },
    {
      head: "Action",
      component: (row) => (
        <b>{escapeHtml(row.action || "")}</b>
      ),
    },
    {
      head: "Details",
      component: (row) => (
        <span className="font-mono text-xs">
          {row.ip_address ? `IP: ${row.ip_address}` : ""}
          {row.role_type && ` • ${row.role_type}`}
          {row.user_agent && (
            <div className="text-[10px] text-rcn-muted truncate max-w-[200px]" title={row.user_agent}>
              {row.user_agent}
            </div>
          )}
        </span>
      ),
    },
  ];

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Audit Log</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">Tracks system actions and user activities.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={clearLog}>
              Clear log
            </Button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="flex flex-wrap gap-3 items-end mt-4 mb-4">
          <div className="flex flex-col gap-1.5 min-w-[260px] flex-1">
            <label className="text-xs text-rcn-muted font-semibold">Search (user, email, event, IP)</label>
            <input
              placeholder="Search audit logs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
          {search && (
            <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
              Clear
            </Button>
          )}
        </div>

        <div className="overflow-auto">
          <TableLayout<AuditLogItem>
            columns={columns}
            data={data}
            loader={isLoading}
            variant="bordered"
            size="sm"
            emptyMessage="No audit entries yet."
            getRowKey={(row) => row._id ?? row.id ?? ""}
          />
        </div>
      </div>
    </>
  );
};

export default Audit;
