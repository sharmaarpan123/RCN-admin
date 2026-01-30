"use client";

import { useOrgPortal } from "@/context/OrgPortalContext";
import type { Branch } from "@/context/OrgPortalContext";
import { Button, Modal, TableLayout } from "@/components";
import { useState, useMemo } from "react";
import type { TableColumn } from "@/components";

export default function OrgPortalBranchesPage() {
  const { branches, addBranch, renameBranch } = useOrgPortal();
  const [modal, setModal] = useState<{ mode: "add" } | { mode: "edit"; id: string; name: string } | null>(null);
  const [name, setName] = useState("");

  const brs = branches();

  const columns: TableColumn<Branch>[] = useMemo(
    () => [
      { head: "Name", accessor: "name", component: (row) => <span className="font-medium">{row.name}</span> },
      {
        head: "Departments",
        component: (row) => <span className="text-rcn-muted">{(row.departments || []).length} departments</span>,
      },
      {
        head: "Actions",
        thClassName: "text-right",
        tdClassName: "text-right",
        component: (row) => (
          <Button variant="secondary" size="sm" onClick={() => openEdit(row.id, row.name)}>Edit</Button>
        ),
      },
    ],
    []
  );

  const openAdd = () => {
    setName("");
    setModal({ mode: "add" });
  };

  const openEdit = (id: string, currentName: string) => {
    setName(currentName);
    setModal({ mode: "edit", id, name: currentName });
  };

  const handleSave = () => {
    const n = name.trim();
    if (!n) return;
    if (modal?.mode === "add") {
      addBranch(n);
    } else if (modal?.mode === "edit") {
      renameBranch(modal.id, n);
    }
    setModal(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold m-0">Branch</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">Create and manage branches for this organization.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Add Branch</Button>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4">
          <p className="text-xs text-rcn-muted mb-3">Branches belong to this organization only. Users may be assigned to multiple branches.</p>
          <div className="border border-rcn-border rounded-xl overflow-hidden">
            <TableLayout<Branch>
              columns={columns}
              data={brs}
              emptyMessage='No branches yet. Click "+ Add Branch" to create one.'
              wrapperClassName="min-w-[260px]"
              getRowKey={(row) => row.id}
            />
          </div>
        </div>
      </div>

      <Modal isOpen={!!modal} onClose={() => setModal(null)} maxWidth="420px">
        <div className="p-4">
          <h3 className="font-bold m-0">{modal?.mode === "add" ? "Add Branch" : "Edit Branch"}</h3>
          <label className="block text-xs text-rcn-muted mt-3 mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Branch name"
            className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
          />
          <div className="flex gap-2 mt-4 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
