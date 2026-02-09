import { Button } from "@/components";
import type { RoleTableRow } from "./types";
import { getRoleId } from "./types";

export type RolesTableColumnsParams = {
  onEdit: (role: RoleTableRow) => void;
  onDelete: (role: RoleTableRow) => void;
};

export function rolesTableColumns({ onEdit, onDelete }: RolesTableColumnsParams) {
  return [
    {
      head: "Name",
      component: (row: RoleTableRow) => (
        <b>{row.name ?? "—"}</b>
      ),
    },
    {
      head: "ID",
      component: (row: RoleTableRow) => (
        <span className="text-rcn-muted font-mono text-[11px]">
          {getRoleId(row) || "—"}
        </span>
      ),
    },
    {
      head: "Permissions",
      component: (row: RoleTableRow) => {
        const list = row.permissions ?? [];
        const count = list.length;
        return (
          <span className="text-xs text-rcn-muted">
            {count} permission{count !== 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      head: "Actions",
      component: (row: RoleTableRow) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDelete(row)}
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];
}
