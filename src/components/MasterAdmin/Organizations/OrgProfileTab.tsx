"use client";

import React from "react";
import type { AdminOrganizationListItem } from "./types";


interface OrgProfileTabProps {
  selectedOrgRow: AdminOrganizationListItem | null;

}

function formatOrgPhone(row: AdminOrganizationListItem | null): string {
  if (!row?.organization) return "—";
  const org = row.organization;
  const tel = [org.dial_code, org.phone_number].filter(Boolean).join(" ").trim() || org.phone_number;
  return tel ?? "—";
}

function formatContactPhone(row: AdminOrganizationListItem | null): string {
  if (!row) return "—";
  const tel = [row.dial_code, row.phone_number].filter(Boolean).join(" ").trim() || row.phone_number;
  return tel ?? "—";
}

export function OrgProfileTab({
  selectedOrgRow,

}: OrgProfileTabProps) {
  const org = selectedOrgRow?.organization;
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-rcn-border rounded-2xl p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Organization Details</h3>
          <div className="text-xs space-y-1">
            <div>
              <b>Name:</b> {org?.name ?? "—"}
            </div>
            <div>
              <b>Email:</b> {org?.email ?? "—"}
            </div>
            <div>
              <b>Phone:</b> {formatOrgPhone(selectedOrgRow)}
            </div>
            <div>
              <b>EIN:</b> {org?.ein_number ?? "—"}
            </div>
            <div className="mt-2">
              <b>Address:</b> {org?.street ?? "—"}
              {org?.suite ? `, ${org.suite}` : ""}
              , {org?.city ?? ""}, {org?.state ?? ""} {org?.zip_code ?? ""}
            </div>
          </div>
        </div>

        <div className="bg-white border border-rcn-border rounded-2xl p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Contact</h3>
          <div className="text-xs space-y-1">
            <div>
              <b>Contact:</b>{" "}
              {[selectedOrgRow?.first_name, selectedOrgRow?.last_name].filter(Boolean).join(" ").trim() || "—"}
            </div>
            <div>
              <b>Email:</b> {selectedOrgRow?.email ?? "—"}
            </div>
            <div>
              <b>Tel:</b> {formatContactPhone(selectedOrgRow)}
            </div>
            <div>
              <b>Fax:</b> {selectedOrgRow?.fax_number ?? "—"}
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
}
