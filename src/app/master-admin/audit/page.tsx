"use client";
import React, { useState } from "react";
import { fmtDate, escapeHtml } from "@/utils/database";
import { toastSuccess } from "@/utils/toast";
import { Button, TableLayout, type TableColumn } from "@/components";

interface AuditEntry {
  id: string;
  at: string;
  who: string;
  action: string;
  meta?: Record<string, unknown>;
}

// Mock audit data
const MOCK_AUDIT_DATA: AuditEntry[] = [
  {
    id: "audit_001",
    at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    who: "sysadmin@rcn.local",
    action: "login",
    meta: { role: "SYSTEM_ADMIN" },
  },
  {
    id: "audit_002",
    at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    who: "sysadmin@rcn.local",
    action: "organization_updated",
    meta: { orgId: "org_northlake" },
  },
];

const Audit: React.FC = () => {
  const [auditData, setAuditData] = useState<AuditEntry[]>(MOCK_AUDIT_DATA);

  const clearLog = () => {
    if (window.confirm("Clear audit log?")) {
      setAuditData([]);
      toastSuccess("Audit log cleared.");
    }
  };

  const data = auditData.slice(0, 200);
  const columns: TableColumn<AuditEntry>[] = [
    {
      head: "Time",
      component: (a) => (
        <>
          {fmtDate(a.at)}
          <div className="text-rcn-muted font-mono text-xs">{a.at}</div>
        </>
      ),
    },
    { head: "User", component: (a) => <span className="font-mono">{escapeHtml(a.who || "")}</span> },
    { head: "Action", component: (a) => <b>{escapeHtml(a.action)}</b> },
    { head: "Details", component: (a) => <span className="font-mono">{escapeHtml(JSON.stringify(a.meta || {}))}</span> },
  ];

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Audit Log</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">Tracks demo actions locally.</p>
          </div>
          <Button variant="secondary" onClick={clearLog}>
            Clear log
          </Button>
        </div>
        <div className="overflow-auto mt-3">
          <TableLayout<AuditEntry>
            columns={columns}
            data={data}
            variant="bordered"
            size="sm"
            emptyMessage="No audit entries yet."
            getRowKey={(a) => a.id}
          />
        </div>
      </div>
    </>
  );
};

export default Audit;
