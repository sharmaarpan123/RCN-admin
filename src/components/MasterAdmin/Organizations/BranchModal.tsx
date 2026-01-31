"use client";

import React from "react";
import { INPUT_CLASS, BTN_CLASS, BTN_PRIMARY_CLASS } from "./types";

interface BranchModalContentProps {
  branch: { id: string; name?: string; orgId?: string } | null;
  targetOrgId: string;
  presetOrgId?: string;
  orgs: { id: string; name: string }[];
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export function BranchModalContent({
  branch,
  targetOrgId,
  presetOrgId,
  orgs,
  onClose,
  onSave,
  onDelete,
}: BranchModalContentProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold m-0">
          {branch ? "Edit" : "New"} Branch
        </h3>
        <button onClick={onClose} className={BTN_CLASS}>
          Close
        </button>
      </div>

      <div className="h-px bg-rcn-border my-4"></div>

      <div className="mb-4">
        <label className="text-xs text-rcn-muted block mb-1.5">
          Organization
        </label>
        <select
          id="br_org"
          defaultValue={targetOrgId}
          className={INPUT_CLASS}
          disabled={!!presetOrgId}
        >
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="text-xs text-rcn-muted block mb-1.5">
          Branch Name
        </label>
        <input
          id="br_name"
          defaultValue={branch?.name || ""}
          placeholder="e.g., Main"
          className={INPUT_CLASS}
        />
      </div>

      <div className="h-px bg-rcn-border my-4"></div>

      <div className="flex justify-end gap-2">
        {branch && onDelete && (
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
  );
}
