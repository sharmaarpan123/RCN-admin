"use client";

import { useOrganizations } from "./useOrganizations";
import { OrganizationsTable } from "./OrganizationsTable";
import { OrganizationModules } from "./OrganizationModules";
import type { OrgTableRow } from "./types";

export function OrganizationsPage() {
  const {
    search,
    setSearch,
    stateFilter,
    setStateFilter,
    zipFilter,
    setZipFilter, 
    selectedOrgId,
    setSelectedOrgId,
    activeTab,
    setActiveTab,
    branchSearch,
    setBranchSearch,
    deptSearch,
    setDeptSearch,
    userSearch,
    setUserSearch,
    filteredOrgs,
    selectedOrg,
    getFilteredBranches,
    getFilteredDepts,
    getFilteredUsers,
    orgTableColumns,
    orgUserColumns,
    branchTableColumns,
    deptTableColumns,
    openOrgModal,
    openBranchModal,
    openDeptModal,
    openUserModal,
    db,
    toastMessage,
    showToastFlag,
    modalContent,
  } = useOrganizations();

  const orgsForSelect = db.orgs.map(
    (o: { id: string; name: string; address?: { state?: string; zip?: string } }) => ({
      id: o.id,
      name: o.name,
      address: o.address,
    })
  );

  return (
    <>
      <OrganizationsTable
        search={search}
        setSearch={setSearch}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
        zipFilter={zipFilter}
        setZipFilter={setZipFilter}
        filteredOrgs={filteredOrgs as OrgTableRow[]}
        columns={orgTableColumns}
        onNewOrg={() => openOrgModal()}
      />

      <OrganizationModules
        selectedOrgId={selectedOrgId}
        setSelectedOrgId={setSelectedOrgId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedOrg={selectedOrg ?? null}
        orgs={orgsForSelect}
        branchSearch={branchSearch}
        setBranchSearch={setBranchSearch}
        deptSearch={deptSearch}
        setDeptSearch={setDeptSearch}
        userSearch={userSearch}
        setUserSearch={setUserSearch}
        getFilteredBranches={getFilteredBranches}
        getFilteredDepts={getFilteredDepts}
        getFilteredUsers={getFilteredUsers}
        branchTableColumns={branchTableColumns}
        deptTableColumns={deptTableColumns}
        orgUserColumns={orgUserColumns}
        onEditOrg={openOrgModal}
        onNewBranch={() => openBranchModal(undefined, selectedOrgId)}
        onNewDept={() => openDeptModal(undefined, selectedOrgId)}
        onNewUser={() => openUserModal(undefined, selectedOrgId)}
      />

      {/* Toast notification */}
      <div className={`fixed right-4 bottom-4 z-60 bg-rcn-dark-bg text-rcn-dark-text border border-white/15 px-3 py-2.5 rounded-2xl shadow-rcn max-w-[360px] text-sm transition-all duration-300 ${
        showToastFlag ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {toastMessage}
      </div>

      {/* Modal */}
      {modalContent && (
        <div 
          className="fixed inset-0 bg-black/55 flex items-center justify-center p-5 z-50" 
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains('bg-black/55')) {
              // closeModal would need to be exposed or handled via escape key
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
