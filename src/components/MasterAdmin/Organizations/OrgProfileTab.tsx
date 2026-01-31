"use client";

import React from "react";
import { BTN_CLASS } from "./types";

interface OrgProfileTabProps {
  selectedOrg: {
    name?: string;
    email?: string;
    phone?: string;
    ein?: string;
    enabled?: boolean;
    address?: {
      street?: string;
      suite?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    contact?: {
      first?: string;
      last?: string;
      email?: string;
      tel?: string;
      fax?: string;
    };
  } | null;
  selectedOrgId: string;
  onEditOrg: (orgId: string) => void;
}

export function OrgProfileTab({
  selectedOrg,
  selectedOrgId,
  onEditOrg,
}: OrgProfileTabProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-rcn-border rounded-2xl p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Organization Details</h3>
          <div className="text-xs space-y-1">
            <div>
              <b>Name:</b> {selectedOrg?.name}
            </div>
            <div>
              <b>Email:</b> {selectedOrg?.email || "—"}
            </div>
            <div>
              <b>Phone:</b> {selectedOrg?.phone || "—"}
            </div>
            <div>
              <b>EIN:</b> {selectedOrg?.ein || "—"}
            </div>
            <div className="mt-2">
              <b>Address:</b> {selectedOrg?.address?.street || "—"}
              {selectedOrg?.address?.suite
                ? `, ${selectedOrg.address.suite}`
                : ""}
              , {selectedOrg?.address?.city || ""}, {selectedOrg?.address?.state || ""}{" "}
              {selectedOrg?.address?.zip || ""}
            </div>
          </div>
        </div>

        <div className="bg-white border border-rcn-border rounded-2xl p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Contact</h3>
          <div className="text-xs space-y-1">
            <div>
              <b>Contact:</b>{" "}
              {`${selectedOrg?.contact?.first || ""} ${selectedOrg?.contact?.last || ""}`.trim() ||
                "—"}
            </div>
            <div>
              <b>Email:</b> {selectedOrg?.contact?.email || "—"}
            </div>
            <div>
              <b>Tel:</b> {selectedOrg?.contact?.tel || "—"}
            </div>
            <div>
              <b>Fax:</b> {selectedOrg?.contact?.fax || "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={() => onEditOrg(selectedOrgId)} className={BTN_CLASS}>
          Edit Organization
        </button>
      </div>
    </div>
  );
}
