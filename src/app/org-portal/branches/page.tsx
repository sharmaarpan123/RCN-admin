"use client";

import { Button, Modal, TableLayout } from "@/components";
import { useState } from "react";
import type { TableColumn } from "@/components";
import { MOCK_ORG, uid, type Branch } from "../mockData";

export default function OrgPortalBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(MOCK_ORG.branches);
  const [modal, setModal] = useState<{ mode: "add" } | { mode: "edit"; id: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<{ title: string; body: string } | null>(null);

  const showToast = (title: string, body: string) => {
    setToastMsg({ title, body });
    setTimeout(() => setToastMsg(null), 2200);
  };

  const addBranch = (name: string) => {
    const n = (name || "").trim();
    if (!n) return;
    const newBranch: Branch = { id: uid("br"), name: n, departments: [] };
    setBranches((prev) => [...prev, newBranch]);
    showToast("Branch created", "Branch added.");
  };

  const renameBranch = (branchId: string, name: string) => {
    const n = (name || "").trim();
    if (!n) return;
    setBranches((prev) => prev.map((b) => (b.id === branchId ? { ...b, name: n } : b)));
    showToast("Branch updated", "Branch renamed.");
  };

  const searchLower = search.trim().toLowerCase();
  const filteredBrs = searchLower
    ? branches.filter((b) => b.name.toLowerCase().includes(searchLower) || b.id.toLowerCase().includes(searchLower))
    : branches;

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

  const columns: TableColumn<Branch>[] = [
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
  ];

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
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <label className="sr-only" htmlFor="branch-search">Search branches</label>
              <input
                id="branch-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or ID"
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
              />
            </div>
            {search && (
              <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
                Clear
              </Button>
            )}
          </div>
          <div className="border border-rcn-border rounded-xl overflow-hidden">
            <TableLayout<Branch>
              columns={columns}
              data={filteredBrs}
              emptyMessage={
                search.trim()
                  ? 'No branches match your search.'
                  : 'No branches yet. Click "+ Add Branch" to create one.'
              }
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

      {toastMsg && (
        <div
          className="fixed left-4 right-4 sm:left-auto sm:right-4 bottom-4 z-50 min-w-0 max-w-[min(440px,calc(100vw-2rem))] bg-rcn-dark-bg text-white rounded-2xl px-4 py-3 shadow-rcn border border-white/10"
          role="status"
          aria-live="polite"
        >
          <p className="font-bold text-sm m-0">{toastMsg.title}</p>
          <p className="text-xs m-0 mt-1 opacity-90">{toastMsg.body}</p>
        </div>
      )}
    </div>
  );
}
