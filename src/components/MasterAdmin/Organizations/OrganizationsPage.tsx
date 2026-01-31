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
        selectedOrg={selectedOrg}
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
    </>
  );
}
