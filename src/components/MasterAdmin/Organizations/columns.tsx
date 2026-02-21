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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onToggleBranch(b._id)}
            title={b.status === 1 ? "Disable" : "Enable"}
            className="inline-flex items-center gap-1.5"
          >
            {b.status === 1 ? (
              <svg
                stroke="currentColor"
                fill="none"
                stroke-width="0"
                viewBox="0 0 24 24"
                height="200px"
                width="200px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.63604 18.364C9.15076 21.8787 14.8492 21.8787 18.364 18.364C21.8787 14.8492 21.8787 9.15076 18.364 5.63604C14.8492 2.12132 9.15076 2.12132 5.63604 5.63604C2.12132 9.15076 2.12132 14.8492 5.63604 18.364ZM7.80749 17.6067C10.5493 19.6623 14.4562 19.4433 16.9497 16.9497C19.4433 14.4562 19.6623 10.5493 17.6067 7.80749L14.8284 10.5858C14.4379 10.9763 13.8047 10.9763 13.4142 10.5858C13.0237 10.1953 13.0237 9.5621 13.4142 9.17157L16.1925 6.39327C13.4507 4.33767 9.54384 4.55666 7.05025 7.05025C4.55666 9.54384 4.33767 13.4507 6.39327 16.1925L9.17157 13.4142C9.5621 13.0237 10.1953 13.0237 10.5858 13.4142C10.9763 13.8047 10.9763 14.4379 10.5858 14.8284L7.80749 17.6067Z"
                  fill="currentColor"
                ></path>
              </svg>
            ) : (
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 24 24"
                height="200px"
                width="200px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 0 1 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0 1 20 12c0 4.42-3.58 8-8 8z"></path>
              </svg>
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
