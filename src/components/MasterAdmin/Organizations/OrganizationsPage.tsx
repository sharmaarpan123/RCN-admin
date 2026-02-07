"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import CustomReactSelect from "@/components/CustomReactSelect";
import { OrganizationsTable } from "./OrganizationsTable";
import { OrgBranchesTab } from "./OrgBranchesTab";
import { OrgDeptsTab } from "./OrgDeptsTab";
import { OrgProfileTab } from "./OrgProfileTab";
import { OrgUsersTab } from "./OrgUsersTab";
import type { OrgTableRow, OrgUserRow } from "./types";
import { useOrganizationList, type OrgRecord } from "./useOrganizationList";
import { useOrgBranchList, type BranchRecord } from "./useOrgBranchList";
import { useOrgDeptList, type DeptRecord } from "./useOrgDeptList";
import { useOrgUserList, type UserRecord } from "./useOrgUserList";
import { MOCK_BRANCHES, MOCK_DEPARTMENTS, MOCK_ORG_USERS } from "./mockData";
import { getAdminOrganizationsApi } from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";

/** Map nested organization object (API shape) to OrgRecord. */
function mapApiOrgToRecord(
  org: Record<string, unknown>,
  primaryContact?: Record<string, unknown>
): OrgRecord {
  const id = (org.id ?? org._id ?? "").toString();
  const str = (v: unknown) => (v ?? "").toString().trim();
  const phone = [org.dial_code, org.phone_number].filter(Boolean).map(String).join(" ").trim() || str(org.phone_number);
  const contact = (primaryContact ?? org.contact ?? {}) as Record<string, unknown>;
  const contactTel = [contact.dial_code, contact.phone_number].filter(Boolean).map(String).join(" ").trim()
    || str(contact.phone_number ?? contact.tel);
  return {
    id,
    name: str(org.name),
    phone: phone || str(org.phone),
    email: str(org.email),
    ein: str(org.ein_number ?? org.ein),
    enabled: org.status !== undefined ? org.status === 1 : undefined,
    walletCents: typeof org.wallet_cents === "number" ? org.wallet_cents : undefined,
    referralCredits: typeof org.referral_credits === "number" ? org.referral_credits : undefined,
    address: {
      street: str(org.street),
      suite: str(org.suite ?? org.apt),
      city: str(org.city),
      state: str(org.state),
      zip: str(org.zip_code ?? org.zip),
    },
    contact: {
      first: str(contact.first ?? contact.first_name),
      last: str(contact.last ?? contact.last_name),
      email: str(contact.email),
      tel: contactTel,
      fax: str(contact.fax ?? contact.fax_number),
    },
  };
}

/**
 * API returns data = array of { _id, first_name, last_name, email, organization_id, organization: { ... } }.
 * Extract unique organizations by organization._id and map to OrgRecord[].
 */
function parseOrganizationsResponse(data: unknown): OrgRecord[] {
  const arr = Array.isArray(data) ? data : [];
  const byOrgId = new Map<string, { org: Record<string, unknown>; contact?: Record<string, unknown> }>();
  for (const row of arr as Record<string, unknown>[]) {
    const org = row.organization as Record<string, unknown> | undefined;
    if (!org) continue;
    const orgId = (org._id ?? org.id ?? "").toString();
    if (!orgId || byOrgId.has(orgId)) continue;
    byOrgId.set(orgId, {
      org,
      contact: {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        dial_code: row.dial_code,
        phone_number: row.phone_number,
        fax_number: row.fax_number,
      },
    });
  }
  return Array.from(byOrgId.values()).map(({ org, contact }) =>
    mapApiOrgToRecord(org, contact)
  );
}

export function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "branches" | "depts" | "users">("profile");

   


  const [branches, setBranches] = useState<BranchRecord[]>(MOCK_BRANCHES as BranchRecord[]);
  const [depts, setDepts] = useState<DeptRecord[]>(MOCK_DEPARTMENTS as DeptRecord[]);
  const [users, setUsers] = useState<UserRecord[]>(MOCK_ORG_USERS as UserRecord[]);

  const { data: orgs, isLoading: orgsLoading, error: orgsError } = useQuery({
    queryKey: [...defaultQueryKeys.organizationsList],
    queryFn: async () => {
      const res = await getAdminOrganizationsApi();
      const payload = res.data as { data?: unknown } | undefined;
      const raw = payload?.data ?? res.data;
      return parseOrganizationsResponse(raw);
    },
  });

  const setOrgs = useCallback(
    (updater: React.SetStateAction<OrgRecord[]>) => {
      queryClient.setQueryData<OrgRecord[]>([...defaultQueryKeys.organizationsList], (prev) => {
        const current = prev ?? [];
        return typeof updater === "function" ? updater(current) : updater;
      });
    },
    [queryClient]
  );

  const orgsList = orgs ?? [];

  const openModal = (content: React.ReactNode) => setModalContent(content);
  const closeModal = () => setModalContent(null);
  const modal = { openModal, closeModal };

  const {
    search,
    setSearch,
    stateFilter,
    setStateFilter,
    zipFilter,
    setZipFilter,
    filteredOrgs,
    orgTableColumns,
    openOrgModal,
  } = useOrganizationList({
    orgs: orgsList,
    setOrgs,
    setBranches: setBranches as React.Dispatch<React.SetStateAction<unknown[]>>,
    setDepts: setDepts as React.Dispatch<React.SetStateAction<unknown[]>>,
    setUsers: setUsers as React.Dispatch<React.SetStateAction<unknown[]>>,
    modal,
    setSelectedOrgId,
    setActiveTab,
  });

  const {
    branchSearch,
    setBranchSearch,
    getFilteredBranches,
    branchTableColumns,
    openBranchModal,
  } = useOrgBranchList({
    branches,
    setBranches,
    setDepts: setDepts as React.Dispatch<React.SetStateAction<unknown[]>>,
    orgs: orgsList,
    selectedOrgId,
    modal,
  });

  const {
    deptSearch,
    setDeptSearch,
    getFilteredDepts,
    deptTableColumns,
    openDeptModal,
  } = useOrgDeptList({
    depts,
    setDepts,
    branches,
    orgs: orgsList,
    selectedOrgId,
    modal,
  });

  const {
    userSearch,
    setUserSearch,
    getFilteredUsers,
    orgUserColumns,
    openUserModal,
  } = useOrgUserList({
    users,
    setUsers,
    orgs: orgsList,
    selectedOrgId,
    modal,
  });

  const selectedOrg = selectedOrgId ? (orgsList.find((o) => o.id === selectedOrgId) ?? null) : null;



  return (
    <>
      {orgsLoading && (
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-4 text-sm text-rcn-muted">
          Loading organizations…
        </div>
      )}
      {orgsError && (
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-4 text-sm text-red-600">
          Failed to load organizations. Please try again.
        </div>
      )}
      <OrganizationsTable
        search={search}
        setSearch={setSearch}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
        zipFilter={zipFilter}
        setZipFilter={setZipFilter}
        filteredOrgs={filteredOrgs as OrgTableRow[]}
        columns={orgTableColumns}
        onNewOrg={openOrgModal}
      />

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
                selectedOrg={selectedOrg ?? null}
                selectedOrgId={selectedOrgId}
                onEditOrg={openOrgModal}
              />
            )}
            {activeTab === "branches" && (
              <OrgBranchesTab
                branchSearch={branchSearch}
                setBranchSearch={setBranchSearch}
                filteredBranches={getFilteredBranches()}
                columns={branchTableColumns}
                onNewBranch={() => openBranchModal(undefined, selectedOrgId)}
              />
            )}
            {activeTab === "depts" && (
              <OrgDeptsTab
                deptSearch={deptSearch}
                setDeptSearch={setDeptSearch}
                filteredDepts={getFilteredDepts()}
                columns={deptTableColumns}
                onNewDept={() => openDeptModal(undefined, selectedOrgId)}
              />
            )}
            {activeTab === "users" && (
              <OrgUsersTab
                userSearch={userSearch}
                setUserSearch={setUserSearch}
                filteredUsers={getFilteredUsers() as OrgUserRow[]}
                columns={orgUserColumns}
                onNewUser={() => openUserModal(undefined, selectedOrgId)}
              />
            )}
          </>
        )}
      </div>

      {modalContent && (
        <div
          className="fixed inset-0 bg-black/55 flex items-center justify-center p-5 z-50"
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains("bg-black/55")) {
              closeModal();
            }
          }}
        >
          <div className="max-w-[900px] w-full">
            <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 max-h-[80vh] overflow-auto">
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
