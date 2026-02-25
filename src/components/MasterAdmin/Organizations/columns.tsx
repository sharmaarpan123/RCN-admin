import { Dispatch, SetStateAction } from "react";
import { Button, TableColumn } from "@/components";
import { AdminOrgModal, OrgTableRow, BranchTableRow } from "./types";
import DisableIcon from "@/assets/svg/DisableIcons";
import EnableIcon from "@/assets/svg/EnableIcons";
const adminOrgTableColumns = ({
  setSelectedOrg,
  setActiveTab,
  setOrgModal,
  onToggleOrganization,
  onDeleteOrganization,
}: {
  setSelectedOrg: (org: OrgTableRow) => void;
  setActiveTab: Dispatch<
    SetStateAction<"depts" | "branches" | "users" | "profile">
  >;
  setOrgModal: Dispatch<SetStateAction<AdminOrgModal>>;
  onToggleOrganization: (organizationId: string) => void;
  onDeleteOrganization: (organizationId: string) => void;
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
    {
      head: "State",
      component: (row: OrgTableRow) => row.organization?.state ?? "—",
    },
    {
      head: "Zip",
      component: (row: OrgTableRow) => (
        <span className="font-mono">{row.organization?.zip_code ?? "—"}</span>
      ),
    },
    {
      head: "City",
      component: (row: OrgTableRow) => row.organization?.city ?? "—",
    },
    {
      head: "Street",
      component: (row: OrgTableRow) => row.organization?.street ?? "—",
    },
    {
      head: "Status",
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
        return (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onToggleOrganization(row?._id)}
              title={row.status === 1 ? "Disable" : "Enable"}
              className="inline-flex items-center gap-1.5"
            >
              {row.status === 2 ? (
                <EnableIcon />
              ) : (
                <DisableIcon
                />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedOrg(row);
                setActiveTab("branches");
                setTimeout(() => {
                  document
                    .getElementById("org-modules-card")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }}
            >
              Manage
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setOrgModal((prev) => ({
                  ...prev,
                  isOpen: true,
                  mode: "edit",
                  editId: row?._id,
                }))
              }
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDeleteOrganization(row?._id)}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              Delete
            </Button>
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onToggleBranch(b._id)}
            title={b.status === 1 ? "Disable" : "Enable"}
            className="inline-flex items-center gap-1.5"
          >
            {b.status === 2 ? (
                <EnableIcon />
              ) : (
                <DisableIcon
                />
              )}
          
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openBranchModal(b)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

export default adminOrgTableColumns;
export { adminBranchTableColumns };
