"use client";

import { Button, Modal, TableLayout } from "@/components";
import { useState } from "react";
import type { TableColumn } from "@/components";
import { MOCK_ORG, uid, type Dept, type Branch } from "../mockData";

type DeptRow = Dept & { branchName?: string };

export default function OrgPortalDepartmentsPage() {
  const [branches, setBranches] = useState<Branch[]>(MOCK_ORG.branches);
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [modal, setModal] = useState<
    | { mode: "add"; branchId: string }
    | { mode: "edit"; branchId: string; deptId: string; name: string }
    | null
  >(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<{ title: string; body: string } | null>(null);

  const showToast = (title: string, body: string) => {
    setToastMsg({ title, body });
    setTimeout(() => setToastMsg(null), 2200);
  };

  const addDepartment = (branchId: string, name: string) => {
    const n = (name || "").trim();
    if (!n) return;
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId ? { ...b, departments: [...(b.departments || []), { id: uid("dp"), name: n }] } : b
      )
    );
    showToast("Department created", "Department added.");
  };

  const renameDepartment = (branchId: string, deptId: string, name: string) => {
    const n = (name || "").trim();
    if (!n) return;
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId
          ? { ...b, departments: (b.departments || []).map((dp) => (dp.id === deptId ? { ...dp, name: n } : dp)) }
          : b
      )
    );
    showToast("Department updated", "Department renamed.");
  };

  const findBranch = (id: string) => branches.find((b) => b.id === id) || null;

  const branchId = branchFilter || branches[0]?.id || "";
  const br = findBranch(branchId);
  const depts = br?.departments ?? [];
  const data: DeptRow[] = depts.map((dp) => ({ ...dp, branchName: br?.name }));
  const searchLower = search.trim().toLowerCase();
  const filteredData = searchLower
    ? data.filter(
        (row) =>
          (row.name ?? "").toLowerCase().includes(searchLower) ||
          (row.id ?? "").toLowerCase().includes(searchLower) ||
          (row.branchName ?? "").toLowerCase().includes(searchLower)
      )
    : data;

  const emptyMessage = !br
    ? "No branches yet. Create a branch first."
    : search.trim()
      ? "No departments match your search."
      : "No departments in this branch. Click \"+ Add Department\" to create one.";

  const openAdd = () => {
    if (!br) return;
    setName("");
    setModal({ mode: "add", branchId: br.id });
  };

  const openEdit = (bId: string, dId: string, currentName: string) => {
    setName(currentName);
    setModal({ mode: "edit", branchId: bId, deptId: dId, name: currentName });
  };

  const handleSave = () => {
    const n = name.trim();
    if (!n) return;
    if (modal?.mode === "add") {
      addDepartment(modal.branchId, n);
    } else if (modal?.mode === "edit") {
      renameDepartment(modal.branchId, modal.deptId, n);
    }
    setModal(null);
  };

  const columns: TableColumn<DeptRow>[] = [
    { head: "Name", accessor: "name", component: (row) => <span className="font-medium">{row.name}</span> },
    { head: "Branch", accessor: "branchName", component: (row) => <span className="text-rcn-muted">{row.branchName ?? "—"}</span> },
    {
      head: "Actions",
      thClassName: "text-right",
      tdClassName: "text-right",
      component: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (br) openEdit(br.id, row.id, row.name);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold m-0">Department</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">Create and manage departments under a branch.</p>
        </div>
        <div className="flex gap-2 items-end flex-wrap">
          <div className="w-full sm:w-auto min-w-0">
            <label className="block text-xs text-rcn-muted mb-1">Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full sm:w-auto min-w-0 px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="md" onClick={openAdd} disabled={!br}>+ Add Department</Button>
        </div>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <label className="sr-only" htmlFor="dept-search">Search departments</label>
              <input
                id="dept-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or branch"
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
            <TableLayout<DeptRow>
              columns={columns}
              data={filteredData}
              emptyMessage={emptyMessage}
              wrapperClassName="min-w-[260px]"
              getRowKey={(row) => row.id}
            />
          </div>
        </div>
      </div>

      <Modal isOpen={!!modal} onClose={() => setModal(null)} maxWidth="420px">
        <div className="p-4">
          <h3 className="font-bold m-0">{modal?.mode === "add" ? "Add Department" : "Edit Department"}</h3>
          {modal?.mode === "add" && (
            <>
              <label className="block text-xs text-rcn-muted mt-3 mb-1.5">Branch</label>
              <select
                value={modal.branchId}
                onChange={(e) => setModal({ mode: "add", branchId: e.target.value })}
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30 mb-2"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </>
          )}
          <label className="block text-xs text-rcn-muted mt-2 mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Department name"
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
