"use client";
import React, { useState } from "react";
import { fmtDate, escapeHtml } from "@/utils/database";
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
  const [toastMessage, setToastMessage] = useState("");
  const [showToastFlag, setShowToastFlag] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowToastFlag(true);
    setTimeout(() => setShowToastFlag(false), 2600);
  };

  const clearLog = () => {
    if (window.confirm("Clear audit log?")) {
      setAuditData([]);
      showToast("Audit log cleared.");
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

      {/* Toast notification */}
      <div className={`fixed right-4 bottom-4 z-60 bg-rcn-dark-bg text-rcn-dark-text border border-white/15 px-3 py-2.5 rounded-2xl shadow-rcn max-w-[360px] text-sm transition-all duration-300 ${
        showToastFlag ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {toastMessage}
      </div>
    </>
  );
};

export default Audit;
