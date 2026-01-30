"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { fmtDate, escapeHtml, saveDB } from "@/utils/database";
import { Button, TableLayout, type TableColumn } from "@/components";

interface AuditEntry {
  id: string;
  at: string;
  who: string;
  action: string;
  meta?: Record<string, unknown>;
}

const Audit: React.FC = () => {
  const { db, refreshDB, showToast } = useApp();

  const clearLog = () => {
    if (window.confirm("Clear audit log?")) {
      const newDb = { ...db };
      newDb.audit = [];
      saveDB(db);
      refreshDB();
      showToast("Audit log cleared.");
    }
  };

  const data: AuditEntry[] = (db.audit || []).slice(0, 200);
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
