"use client";

import { getAdminOrganizationsApi } from "@/apis/ApiCalls";
import Button from "@/components/Button";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import adminOrgTableColumns from "./columns";
import { MOCK_BRANCHES, MOCK_DEPARTMENTS, MOCK_ORG_USERS } from "./mockData";
import { OrganizationsTable } from "./OrganizationsTable";
import { OrgBranchesTab } from "./OrgBranchesTab";
import { OrgDeptsTab } from "./OrgDeptsTab";
import { OrgModalContent } from "./OrgModal";
import { OrgProfileTab } from "./OrgProfileTab";
import { OrgUsersTab } from "./OrgUsersTab";
import { AdminOrgModal, type AdminOrganizationListItem, type OrgUserRow } from "./types";
import { useOrgBranchList, type BranchRecord } from "./useOrgBranchList";
import { useOrgDeptList, type DeptRecord } from "./useOrgDeptList";
import { useOrgUserList, type UserRecord } from "./useOrgUserList";

/** Full API response from GET /api/admin/organization (use as-is). */
type AdminOrganizationsApiResponse = {
  success?: boolean;
  message?: string;
  data: AdminOrganizationListItem[];
  meta?: unknown;
};



export function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "branches" | "depts" | "users">("profile");

  const [orgListBody, setOrgListBody] = useState({
    page: 1,
    limit: 10,
    search: ""
  });


  const [orgModal, setOrgModal] = useState<AdminOrgModal>({ isOpen: false, mode: "add", editId: null });

  const [branches, setBranches] = useState<BranchRecord[]>(MOCK_BRANCHES as BranchRecord[]);
  const [depts, setDepts] = useState<DeptRecord[]>(MOCK_DEPARTMENTS as DeptRecord[]);
  const [users, setUsers] = useState<UserRecord[]>(MOCK_ORG_USERS as UserRecord[]);

  const { data: orgsResponse, isLoading: orgsLoading, error: orgsError } = useQuery({
    queryKey: [...defaultQueryKeys.organizationsList, orgListBody.page, orgListBody.search],
    queryFn: async () => {
      const res = await getAdminOrganizationsApi();
      return res.data as AdminOrganizationsApiResponse;
    },
  });


  const orgsList = useMemo(() => orgsResponse?.data ?? [], [orgsResponse?.data]);

  const orgsForSelect = useMemo(() => {
    const seen = new Set<string>();
    return orgsList
      .filter((r) => {
        const id = r.organization?._id ?? r.organization_id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((r) => ({
        id: r.organization?._id ?? r.organization_id,
        name: r.organization?.name ?? "",
        address: {
          state: r.organization?.state,
          zip: r.organization?.zip_code,
        },
      }));
  }, [orgsList]);

  const openModal = (content: React.ReactNode) => setModalContent(content);
  const closeModal = () => setModalContent(null);
  const modal = { openModal, closeModal };

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
    orgs: orgsForSelect,
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
    orgs: orgsForSelect,
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
    orgs: orgsForSelect,
    selectedOrgId,
    modal,
  });

  const selectedOrgRow = selectedOrgId
    ? orgsList.find(
      (r) => (r.organization?._id ?? r.organization_id) === selectedOrgId
    ) ?? null
    : null;

  const selectedOrg = selectedOrgRow
    ? (() => {
      const org = selectedOrgRow.organization;
      const phone = ([org?.dial_code, org?.phone_number].filter(Boolean).join(" ").trim() || org?.phone_number) ?? "";
      return {
        name: org?.name,
        email: org?.email,
        phone,
        ein: org?.ein_number,
        enabled: selectedOrgRow.status === 1,
        address: {
          street: org?.street,
          suite: org?.suite,
          city: org?.city,
          state: org?.state,
          zip: org?.zip_code,
        },
        contact: {
          first: selectedOrgRow.first_name,
          last: selectedOrgRow.last_name,
          email: selectedOrgRow.email,
          tel: ([selectedOrgRow.dial_code, selectedOrgRow.phone_number].filter(Boolean).join(" ").trim() || selectedOrgRow.phone_number) ?? "",
          fax: selectedOrgRow.fax_number,
        },
      };
    })()
    : null;

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



      <OrgModalContent
        isOpen={orgModal.isOpen}
        orgId={orgModal.editId ?? undefined}
        onClose={() => setOrgModal(prev => ({ ...prev, isOpen: false }))}
      />

      <OrganizationsTable
        isLoading={orgsLoading}
        body={orgListBody}
        setBody={setOrgListBody}
        data={orgsList}
        columns={adminOrgTableColumns({ setSelectedOrgId, setActiveTab, setOrgModal })}
        onNewOrg={() => setOrgModal(prev => ({ ...prev, isOpen: true, mode: "add" }))}
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
                onEditOrg={() => setOrgModal(prev => ({ ...prev, isOpen: true, mode: "edit", editId: selectedOrgId }))}
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
