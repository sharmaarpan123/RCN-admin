"use client";

import React from "react";
import { Button } from "@/components";
import { US_STATES } from "@/utils/database";
import { INPUT_CLASS } from "./types";

interface OrgModalContentProps {
  org: {
    name?: string;
    phone?: string;
    email?: string;
    ein?: string;
    enabled?: boolean;
    address?: { street?: string; suite?: string; city?: string; state?: string; zip?: string };
    contact?: { first?: string; last?: string; email?: string; tel?: string; fax?: string };
  } | null;
  orgId?: string;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export function OrgModalContent({
  org,
  onClose,
  onSave,
  onDelete,
}: OrgModalContentProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold m-0">
            {org ? "Edit" : "New"} Organization
          </h3>
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="h-px bg-rcn-border my-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <div className="mb-4">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Organization Name
            </label>
            <input
              id="org_name"
              defaultValue={org?.name || ""}
              className={INPUT_CLASS}
            />
          </div>
          <div className="mb-4">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Organization Phone (Must)
            </label>
            <input
              id="org_phone"
              defaultValue={org?.phone || ""}
              className={INPUT_CLASS}
            />
          </div>
          <div className="mb-4">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Organization Email (Must)
            </label>
            <input
              id="org_email"
              type="email"
              defaultValue={org?.email || ""}
              className={INPUT_CLASS}
            />
          </div>
          <div className="mb-4">
            <label className="text-xs text-rcn-muted block mb-1.5">
              Organization EIN (Optional)
            </label>
            <input id="org_ein" defaultValue={org?.ein || ""} className={INPUT_CLASS} />
          </div>
          <div className="mb-4">
            <label className="text-xs text-rcn-muted block mb-1.5">Enabled</label>
            <select
              id="org_enabled"
              defaultValue={String(org?.enabled ?? true)}
              className={INPUT_CLASS}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-white border border-rcn-border rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-semibold m-0 mb-3">
              Organization Address
            </h3>
            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Street</label>
              <input
                id="org_street"
                defaultValue={org?.address?.street || ""}
                className={INPUT_CLASS}
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">
                Apt/Suite
              </label>
              <input
                id="org_suite"
                defaultValue={org?.address?.suite || ""}
                className={INPUT_CLASS}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">City</label>
                <input
                  id="org_city"
                  defaultValue={org?.address?.city || ""}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">State</label>
                <select
                  id="org_state"
                  defaultValue={org?.address?.state || ""}
                  className={INPUT_CLASS}
                >
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s === "" ? "Select" : s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-0">
              <label className="text-xs text-rcn-muted block mb-1.5">Zip</label>
              <input
                id="org_zip"
                defaultValue={org?.address?.zip || ""}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="bg-white border border-rcn-border rounded-2xl p-4">
            <h3 className="text-sm font-semibold m-0 mb-3">
              Organization Contact Person
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">
                  First Name
                </label>
                <input
                  id="org_c_first"
                  defaultValue={org?.contact?.first || ""}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">
                  Last Name
                </label>
                <input
                  id="org_c_last"
                  defaultValue={org?.contact?.last || ""}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Email</label>
              <input
                id="org_c_email"
                type="email"
                defaultValue={org?.contact?.email || ""}
                className={INPUT_CLASS}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-0">
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">Tel</label>
                <input
                  id="org_c_tel"
                  defaultValue={org?.contact?.tel || ""}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">Fax</label>
                <input
                  id="org_c_fax"
                  defaultValue={org?.contact?.fax || ""}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-rcn-border my-4"></div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-rcn-muted">
          {org
            ? "Changes apply immediately to dropdown searches and inboxes."
            : "Create a new organization for sender/receiver selection."}
        </div>
        <div className="flex gap-2">
          {org && onDelete && (
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
