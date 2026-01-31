"use client";

import React from "react";
import { INPUT_CLASS, BTN_CLASS, BTN_PRIMARY_CLASS } from "./types";

interface UserModalContentProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: string;
    orgId?: string | null;
    adminCap?: boolean;
    enabled?: boolean;
    resetIntervalDays?: number;
    mfaEmail?: boolean;
    notes?: string;
  } | null;
  targetOrgId: string;
  presetOrgId?: string;
  orgs: { id: string; name: string }[];
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export function UserModalContent({
  user,
  targetOrgId,
  presetOrgId,
  orgs,
  onClose,
  onSave,
  onDelete,
}: UserModalContentProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold m-0">
          {user ? "Edit" : "New"} User
        </h3>
        <button onClick={onClose} className={BTN_CLASS}>
          Close
        </button>
      </div>

      <div className="h-px bg-rcn-border my-4"></div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-xs text-rcn-muted block mb-1.5">
                First Name
              </label>
              <input
                id="u_first"
                defaultValue={user?.firstName || ""}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="text-xs text-rcn-muted block mb-1.5">
                Last Name
              </label>
              <input
                id="u_last"
                defaultValue={user?.lastName || ""}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-rcn-muted block mb-1.5">Email</label>
            <input
              id="u_email"
              type="email"
              defaultValue={user?.email || ""}
              className={INPUT_CLASS}
            />
          </div>
          <div className="mb-3">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Phone (optional)
            </label>
            <input
              id="u_phone"
              defaultValue={user?.phone || ""}
              placeholder="(optional)"
              className={INPUT_CLASS}
            />
          </div>
          <div className="mb-3">
            <label className="text-xs text-rcn-muted block mb-1.5">Role</label>
            <select
              id="u_role"
              defaultValue={user?.role || "STAFF"}
              className={INPUT_CLASS}
            >
              <option value="ORG_ADMIN">Organization Admin</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Organization
            </label>
            <select
              id="u_org"
              defaultValue={targetOrgId}
              className={INPUT_CLASS}
              disabled={!!presetOrgId}
            >
              <option value="">— None —</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="mb-3">
            <label className="text-xs text-rcn-muted block mb-1.5">Access</label>
            <select
              id="u_access"
              defaultValue={user?.adminCap ? "ADMIN" : "ACTIVE"}
              className={INPUT_CLASS}
            >
              <option value="ACTIVE">Active user</option>
              <option value="ADMIN">Admin capabilities</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Active user status
            </label>
            <select
              id="u_enabled"
              defaultValue={String(user?.enabled ?? true)}
              className={INPUT_CLASS}
            >
              <option value="true">Active</option>
              <option value="false">Disabled</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Password Reset Interval (days)
            </label>
            <input
              id="u_reset"
              type="number"
              min={1}
              step={1}
              defaultValue={user?.resetIntervalDays || 30}
              className={INPUT_CLASS}
            />
          </div>
          <div className="mb-3">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Email MFA
            </label>
            <select
              id="u_mfa"
              defaultValue={String(user?.mfaEmail ?? false)}
              className={INPUT_CLASS}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
          <div className="mb-0">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Notes (optional)
            </label>
            <textarea
              id="u_notes"
              defaultValue={user?.notes || ""}
              placeholder="Optional notes..."
              className={INPUT_CLASS}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-rcn-border my-4"></div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-rcn-muted">Changes apply immediately.</div>
        <div className="flex gap-2">
          {user && onDelete && (
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
    </div>
  );
}
