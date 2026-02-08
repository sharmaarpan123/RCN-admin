import { Dispatch, SetStateAction } from "react";
import { TableColumn } from "@/components";
import { AdminOrgModal, BTN_SMALL_CLASS, OrgTableRow, BranchTableRow } from "./types";

const adminOrgTableColumns = ({
  setSelectedOrg,
  setActiveTab,
  setOrgModal,
  onToggleOrganization,
}: {
  setSelectedOrg: (org: OrgTableRow) => void;
  setActiveTab: Dispatch<SetStateAction<"depts" | "branches" | "users" | "profile">>;
  setOrgModal: Dispatch<SetStateAction<AdminOrgModal>>;
  onToggleOrganization: (organizationId: string) => void;
}) => [
    {
      head: "Name",
      component: (row: OrgTableRow) => (
        <>
          <b>{row.organization?.name ?? "—"} </b>
          <div className="text-rcn-muted">{row.organization?.email ?? "—"}</div>
        </>
      ),
    },
    { head: "State", component: (row: OrgTableRow) => row.organization?.state ?? "—" },
    { head: "Zip", component: (row: OrgTableRow) => <span className="font-mono">{row.organization?.zip_code ?? "—"}</span> },
    { head: "City", component: (row: OrgTableRow) => row.organization?.city ?? "—" },
    { head: "Street", component: (row: OrgTableRow) => row.organization?.street ?? "—" },
    {
      head: "Enabled",
      component: (row: OrgTableRow) =>
        row.status === 1 ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">
            Enabled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">
            Disabled
          </span>
        ),
    },
    {
      head: "Actions",
      component: (row: OrgTableRow) => {
        const orgId = row.organization?._id ?? row.organization_id ?? "";
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onToggleOrganization(row?._id)}
              className={BTN_SMALL_CLASS}
            >
              Toggle
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedOrg(row);
                setActiveTab("branches");
                setTimeout(() => {
                  document.getElementById("org-modules-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }}
              className={BTN_SMALL_CLASS}
            >
              Manage
            </button>
            <button
              type="button"
              onClick={() =>
                setOrgModal((prev) => ({
                  ...prev,
                  isOpen: true,
                  mode: "edit",
                  editId: orgId,
                }))
              }
              className={BTN_SMALL_CLASS}
            >
              Edit
            </button>
          </div>
        );
      },
    },
  ];

const adminBranchTableColumns = ({
  onToggleBranch,
  openBranchModal,
}: {
  onToggleBranch: (branchId: string) => void;
  openBranchModal: (branch: { _id: string; name?: string }) => void;
}): TableColumn<BranchTableRow>[] => [
    {
      head: "Branch",
      component: (b) => (
        <>
          <b>{b.name ?? "—"}</b>{" "}
          <span className="text-rcn-muted font-mono text-[11px]">({b._id})</span>
        </>
      ),
    },
    {
      head: "Status",
      component: (b) =>
        b.status === 1 ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">
            Enabled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">
            Disabled
          </span>
        ),
    },
    {
      head: "Actions",
      component: (b) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => onToggleBranch(b._id)} className={BTN_SMALL_CLASS}>
            Toggle
          </button>
          <button type="button" onClick={() => openBranchModal(b)} className={BTN_SMALL_CLASS}>
            Edit
          </button>
        </div>
      ),
    },
  ];

export default adminOrgTableColumns;
export { adminBranchTableColumns };