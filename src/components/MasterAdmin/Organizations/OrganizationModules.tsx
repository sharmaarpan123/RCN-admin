"use client";

import React from "react";
import { Button, CustomReactSelect } from "@/components";
import type { OrgModulesTab } from "./types";
import { OrgProfileTab } from "./OrgProfileTab";
import { OrgBranchesTab } from "./OrgBranchesTab";
import { OrgDeptsTab } from "./OrgDeptsTab";
import { OrgUsersTab } from "./OrgUsersTab";
import type { OrgUserRow } from "./types";
import type { BranchTableRow, DeptTableRow } from "./types";
import type { TableColumn } from "@/components";

interface OrganizationModulesProps {
  selectedOrgId: string;
  setSelectedOrgId: (v: string) => void;
  activeTab: OrgModulesTab;
  setActiveTab: (v: OrgModulesTab) => void;
  selectedOrg: {
    name?: string;
    enabled?: boolean;
    address?: {
      street?: string;
      suite?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  } | null;
  orgs: { id: string; name: string; address?: { state?: string; zip?: string } }[];
  branchSearch: string;
  setBranchSearch: (v: string) => void;
  deptSearch: string;
  setDeptSearch: (v: string) => void;
  userSearch: string;
  setUserSearch: (v: string) => void;
  getFilteredBranches: () => BranchTableRow[];
  getFilteredDepts: () => DeptTableRow[];
  getFilteredUsers: () => OrgUserRow[];
  branchTableColumns: TableColumn<BranchTableRow>[];
  deptTableColumns: TableColumn<DeptTableRow>[];
  orgUserColumns: TableColumn<OrgUserRow>[];
  onEditOrg: (orgId: string) => void;
  onNewBranch: () => void;
  onNewDept: () => void;
  onNewUser: () => void;
}

export function OrganizationModules({
  selectedOrgId,
  setSelectedOrgId,
  activeTab,
  setActiveTab,
  selectedOrg,
  orgs,
  branchSearch,
  setBranchSearch,
  deptSearch,
  setDeptSearch,
  userSearch,
  setUserSearch,
  getFilteredBranches,
  getFilteredDepts,
  getFilteredUsers,
  branchTableColumns,
  deptTableColumns,
  orgUserColumns,
  onEditOrg,
  onNewBranch,
  onNewDept,
  onNewUser,
}: OrganizationModulesProps) {
  return (
    <div
      id="org-modules-card"
      className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4"
    >
      <div className="flex justify-between items-end flex-wrap gap-3">
        <div>
          <h3 className="m-0 text-sm font-semibold">Organization Modules</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Branches, Departments, and Users are managed inside the selected
            Organization.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 w-full md:w-[300px]">
          <label className="text-xs text-rcn-muted">Select Organization</label>
          <CustomReactSelect
            options={orgs.map((o) => ({
              value: o.id,
              label: `${o.name} — ${o.address?.state ?? ""} ${o.address?.zip ?? ""}`.trim(),
            }))}
            value={selectedOrgId}
            onChange={setSelectedOrgId}
            placeholder="— Select Organization —"
            aria-label="Select Organization"
            isClearable
            maxMenuHeight={280}
          />
        </div>
      </div>

      <div className="h-px bg-rcn-border my-4"></div>

      {!selectedOrgId ? (
        <div className="text-xs text-rcn-muted">
          Select an organization to manage branches, departments, and users.
        </div>
      ) : (
        <>
          <div className="text-xs mb-3">
            <b>{selectedOrg?.name}</b> •{" "}
            {selectedOrg?.enabled ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">
                Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">
                Disabled
              </span>
            )}
            <span className="text-rcn-muted ml-2">
              • {selectedOrg?.address?.street} {selectedOrg?.address?.suite} •{" "}
              {selectedOrg?.address?.city}, {selectedOrg?.address?.state}{" "}
              {selectedOrg?.address?.zip}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap mb-3">
            <Button
              variant="tab"
              size="sm"
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            >
              Organization
            </Button>
            <Button
              variant="tab"
              size="sm"
              active={activeTab === "branches"}
              onClick={() => setActiveTab("branches")}
            >
              Branches
            </Button>
            <Button
              variant="tab"
              size="sm"
              active={activeTab === "depts"}
              onClick={() => setActiveTab("depts")}
            >
              Departments
            </Button>
            <Button
              variant="tab"
              size="sm"
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
            >
              Users
            </Button>
          </div>

          {activeTab === "profile" && (
            <OrgProfileTab
              selectedOrg={selectedOrg}
              selectedOrgId={selectedOrgId}
              onEditOrg={onEditOrg}
            />
          )}
          {activeTab === "branches" && (
            <OrgBranchesTab
              branchSearch={branchSearch}
              setBranchSearch={setBranchSearch}
              filteredBranches={getFilteredBranches()}
              columns={branchTableColumns}
              onNewBranch={onNewBranch}
            />
          )}
          {activeTab === "depts" && (
            <OrgDeptsTab
              deptSearch={deptSearch}
              setDeptSearch={setDeptSearch}
              filteredDepts={getFilteredDepts()}
              columns={deptTableColumns}
              onNewDept={onNewDept}
            />
          )}
          {activeTab === "users" && (
            <OrgUsersTab
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              filteredUsers={getFilteredUsers()}
              columns={orgUserColumns}
              onNewUser={onNewUser}
            />
          )}
        </>
      )}
    </div>
  );
}
