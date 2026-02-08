"use client";

import { getAdminOrganizationsApi, putAdminBranchToggleApi, putAdminOrganizationToggleApi } from "@/apis/ApiCalls";
import Button from "@/components/Button";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { toastError, toastSuccess } from "@/utils/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BranchModalContent } from "./BranchModal";
import adminOrgTableColumns from "./columns";
import { MOCK_ORG_USERS } from "./mockData";
import { OrganizationsTable } from "./OrganizationsTable";
import { OrgBranchesTab } from "./OrgBranchesTab";
import { OrgDeptsTab } from "./OrgDeptsTab";
import { OrgModalContent } from "./OrgModal";
import { OrgProfileTab } from "./OrgProfileTab";
import { OrgUsersTab } from "./OrgUsersTab";
import { AdminOrgModal, OrgTableRow, type AdminBranchListItem, type AdminOrganizationListItem, type OrgUserRow } from "./types";
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

  const [selectedOrg, setSelectedOrg] = useState<OrgTableRow | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"profile" | "branches" | "depts" | "users">("profile");

  const [orgListBody, setOrgListBody] = useState({
    page: 1,
    limit: 10,
    search: ""
  });

  const [orgModal, setOrgModal] = useState<AdminOrgModal>({ isOpen: false, mode: "add", editId: null });

  const [branchModal, setBranchModal] = useState<{
    isOpen: boolean;
    branchId: string | null;
    presetOrgId?: string;
    branch: { _id: string; name?: string } | null;
  }>({
    isOpen: false,
    branchId: null,
    presetOrgId: undefined,
    branch: null,
  });


  const [users, setUsers] = useState<UserRecord[]>(MOCK_ORG_USERS as UserRecord[]);

  const { data: orgsResponse, isLoading: orgsLoading, error: orgsError } = useQuery({
    queryKey: [...defaultQueryKeys.organizationsList, orgListBody.page, orgListBody.search],
    queryFn: async () => {
      const res = await getAdminOrganizationsApi();
      return res.data as AdminOrganizationsApiResponse;
    },
  });


  const orgsList = useMemo(() => orgsResponse?.data ?? [], [orgsResponse?.data]);


  const invalidateDepts = () =>
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.organizationDepartmentList });

  const openModal = (content: React.ReactNode) => setModalContent(content);
  const closeModal = () => setModalContent(null);
  const modal = { openModal, closeModal };


  const invalidateBranches = () =>
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.organizationBranchesList });

  const closeBranchModal = () =>
    setBranchModal((prev) => ({ ...prev, isOpen: false, branchId: null, presetOrgId: undefined, branch: null }));

  const saveBranch = () => {
    invalidateBranches();
  };

  const deleteBranch = (branchId: string) => {
    if (!confirm("Delete this branch?")) return;
    void branchId;
    closeBranchModal();
    invalidateBranches();
    invalidateDepts();
    toastSuccess("Branch deleted.");
  };

  const openBranchModal = (branch?: { _id: string; name?: string } | null, presetOrgId?: string) => {
    setBranchModal({
      isOpen: true,
      branchId: branch?._id ?? null,
      presetOrgId,
      branch: branch ?? null,
    });
  };

  const invalidateOrgs = () =>
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.organizationsList });

  const toggleBranch = async (branchId: string) => {
    try {
      await putAdminBranchToggleApi(branchId);
      invalidateBranches();
      toastSuccess("Branch toggled.");
    } catch {
      toastError("Failed to toggle branch.");
    }
  };

  const toggleOrganization = async (organizationId: string) => {
    try {
      await putAdminOrganizationToggleApi(organizationId);
      invalidateOrgs();
      toastSuccess("Organization status toggled.");
    } catch {
      toastError("Failed to toggle organization.");
    }
  };

  const {
    userSearch,
    setUserSearch,
    getFilteredUsers,
    orgUserColumns,
    openUserModal,
  } = useOrgUserList({
    users,
    setUsers,
    // orgs: orgsForSelect,
    selectedOrgId: selectedOrg?.organization_id ?? "",
    modal,
  });

  const selectedOrgRow = selectedOrg


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
        onClose={() => setOrgModal((prev) => ({ ...prev, isOpen: false }))}
      />


      <BranchModalContent
        key={branchModal.branch?._id ?? "new"}
        isOpen={branchModal.isOpen}
        branch={branchModal.branch}
        selectedOrgId={selectedOrg?.organization_id ?? ""}
        selectedOrgName={selectedOrg?.organization?.name}
        onClose={closeBranchModal}
        onSave={saveBranch}
      />


      <OrganizationsTable
        isLoading={orgsLoading}
        body={orgListBody}
        setBody={setOrgListBody}
        data={orgsList}
        columns={adminOrgTableColumns({ setSelectedOrg, setActiveTab, setOrgModal, onToggleOrganization: toggleOrganization })}
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

        {!selectedOrg ? (
          <div className="text-xs text-rcn-muted">
            Select an organization to manage branches, departments, and users.
          </div>
        ) : (
          <>
            <div className="text-xs mb-3 flex flex-wrap items-center gap-2">
              <b>{selectedOrgRow?.organization?.name}</b> •{" "}
              {selectedOrgRow?.status === 1 ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">
                  Disabled
                </span>
              )}
            
              <span className="text-rcn-muted">
                • {selectedOrgRow?.organization?.street} {selectedOrgRow?.organization?.suite} •{" "}
                {selectedOrgRow?.organization?.city}, {selectedOrgRow?.organization?.state}{" "}
                {selectedOrgRow?.organization?.zip_code}
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
                selectedOrgRow={selectedOrgRow ?? null}
                selectedOrgId={selectedOrg?.organization_id ?? ""}
                onEditOrg={() => setOrgModal(prev => ({ ...prev, isOpen: true, mode: "edit", editId: selectedOrg?.organization_id ?? "" }))}
              />
            )}
            {activeTab === "branches" && (
              <OrgBranchesTab
                selectedOrgId={selectedOrg?.organization_id ?? ""}
                onNewBranch={() => openBranchModal(null, selectedOrg?.organization_id ?? "")}
                onEditBranch={(branch) => openBranchModal(branch)}
                onToggleBranch={toggleBranch}
              />
            )}
            {activeTab === "depts" && (
              <OrgDeptsTab
                selectedOrgId={selectedOrg?.organization_id ?? ""}
                modal={modal}
              />
            )}
            {activeTab === "users" && (
              <OrgUsersTab
                userSearch={userSearch}
                setUserSearch={setUserSearch}
                filteredUsers={getFilteredUsers() as OrgUserRow[]}
                columns={orgUserColumns}
                onNewUser={() => openUserModal(undefined, selectedOrg?.organization_id ?? "")}
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
