"use client";

import { useOrgPortal } from "@/context/OrgPortalContext";
import { Button, Modal } from "@/components";
import { useState } from "react";

export default function OrgPortalDepartmentsPage() {
  const { branches, findBranch, addDepartment, renameDepartment } = useOrgPortal();
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [modal, setModal] = useState<
    | { mode: "add"; branchId: string }
    | { mode: "edit"; branchId: string; deptId: string; name: string }
    | null
  >(null);
  const [name, setName] = useState("");

  const brs = branches();
  const branchId = branchFilter || brs[0]?.id || "";
  const br = findBranch(branchId);
  const depts = br?.departments ?? [];

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

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold m-0">Department</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">Create and manage departments under a branch.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div>
            <label className="block text-xs text-rcn-muted mb-1">Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
            >
              {brs.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="sm" onClick={openAdd} disabled={!br}>+ Add Department</Button>
        </div>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4">
          <div className="border border-rcn-border rounded-xl overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-rcn-bg/90">
                  <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wide text-rcn-muted font-semibold">Name</th>
                  <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wide text-rcn-muted font-semibold">Branch</th>
                  <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wide text-rcn-muted font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!br && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-rcn-muted text-xs text-center">No branches yet. Create a branch first.</td>
                  </tr>
                )}
                {br && !depts.length && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-rcn-muted text-xs text-center">No departments in this branch. Click &quot;+ Add Department&quot; to create one.</td>
                  </tr>
                )}
                {depts.map((dp) => (
                  <tr key={dp.id} className="border-t border-rcn-border/60 hover:bg-rcn-accent/5">
                    <td className="px-3 py-2.5 font-medium">{dp.name}</td>
                    <td className="px-3 py-2.5 text-rcn-muted">{br?.name}</td>
                    <td className="px-3 py-2.5 text-right">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(br!.id, dp.id, dp.name)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                {brs.map((b) => (
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
    </div>
  );
}
