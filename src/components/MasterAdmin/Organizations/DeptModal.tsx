"use client";

import React from "react";
import { INPUT_CLASS, BTN_CLASS, BTN_PRIMARY_CLASS, AdminDepartmentListItem } from "./types";
import { Modal } from "@/components";


interface DeptModalContentProps {
  dept: AdminDepartmentListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export function DeptModalContent({
  dept,
  onClose,
  onSave,
  isOpen,
  onDelete,
}: DeptModalContentProps) {




  return (
    <Modal isOpen={isOpen} onClose={onClose}>
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold m-0">
          {dept ? "Edit" : "New"} Department
        </h3>
        <button onClick={onClose} className={BTN_CLASS}>
          Close
        </button>
      </div>

      <div className="h-px bg-rcn-border my-4"></div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-rcn-muted block mb-1.5">
            Organization
          </label>
          {/* <select
            id="dp_org"
            defaultValue={targetOrgId}
            className={INPUT_CLASS}
            disabled={!!presetOrgId}
            onChange={handleOrgChange}
          >
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select> */}
        </div>
        <div>
          <label className="text-xs text-rcn-muted block mb-1.5">Branch</label>
          {/* <select
            id="dp_branch"
            defaultValue={dept?.branchId || ""}
            className={INPUT_CLASS}
          >
            {orgBranches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name ?? ""}
              </option>
            ))}
          </select> */}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-rcn-muted block mb-1.5">
          Department Name
        </label>
        <input
          id="dp_name"
          defaultValue={dept?.name || ""}
          placeholder="e.g., Cardiology"
          className={INPUT_CLASS}
        />
      </div>

      <div className="h-px bg-rcn-border my-4"></div>

      <div className="flex justify-end gap-2">
        {dept && onDelete && (
          <button
            onClick={onDelete}
            className="border border-rcn-danger bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-danger text-sm hover:bg-rcn-danger hover:text-white transition-colors"
          >
            Delete
          </button>
        )}
        <button onClick={onSave} className={BTN_PRIMARY_CLASS}>
          Save
        </button>
      </div>
    </div>
    </Modal>
  );
}
