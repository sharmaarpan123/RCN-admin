"use client";

import { getStaffBranchesApi } from "@/apis/ApiCalls";
import { DebouncedInput } from "@/components";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type BranchApiItem = {
  _id?: string;
  id?: string;
  name?: string;
  status?: number | string;
  organization_name?: string;
  organization?: {
    name?: string;
  };
};

type BranchRow = {
  id: string;
  name: string;
  organization: string;
  status: string;
};

const toStatusLabel = (status?: number | string) => {
  if (status === 1 || status === "1" || status === "active") return "Active";
  if (status === 0 || status === "0" || status === "inactive") return "Inactive";
  return "Unknown";
};

const normalizeBranches = (items: unknown[]): BranchRow[] =>
  items
    .map((item) => item as BranchApiItem)
    .map((item) => ({
      id: item._id ?? item.id ?? "",
      name: item.name?.trim() || "Untitled Branch",
      organization: item.organization_name?.trim() || item.organization?.name?.trim() || "-",
      status: toStatusLabel(item.status),
    }))
    .filter((item) => item.id || item.name !== "Untitled Branch");

export function StaffBranches() {
  const [search, setSearch] = useState("");

  const { data: branches, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.branchesList, search],
    queryFn: async (): Promise<BranchRow[]> => {
      const res = await getStaffBranchesApi(search ? { search } : undefined);
      if (!checkResponse({ res })) return [];

      const payload = res.data as unknown;
      if (Array.isArray(payload)) return normalizeBranches(payload);

      if (payload && typeof payload === "object" && "data" in payload) {
        const data = (payload as { data?: unknown }).data;
        if (Array.isArray(data)) return normalizeBranches(data);
      }

      return [];
    },
  });

  const filteredBranches = useMemo(() => {
    const rows = branches ?? [];
    if (!search.trim()) return rows;

    const query = search.toLowerCase();
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        row.organization.toLowerCase().includes(query) ||
        row.id.toLowerCase().includes(query),
    );
  }, [branches, search]);

  return (
    <div className="max-w-[1100px] mx-auto p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold m-0">Branches</h1>
        <p className="text-sm text-rcn-muted mt-1 mb-0">
          View branches available to your staff account.
        </p>
      </div>

      <div className="bg-white border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4 border-b border-rcn-border">
          <DebouncedInput
            value={search}
            onChange={setSearch}
            placeholder="Search by branch name, organization, or ID"
          />
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-rcn-muted">Loading branches...</div>
        ) : filteredBranches.length === 0 ? (
          <div className="p-6 text-sm text-rcn-muted">
            {search ? "No branches match your search." : "No branches found."}
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-rcn-border">
                  <th className="text-left px-4 py-3 font-semibold">Branch</th>
                  <th className="text-left px-4 py-3 font-semibold">Organization</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map((row) => (
                  <tr key={row.id} className="border-b border-rcn-border last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-rcn-text">{row.name}</div>
                      <div className="text-xs text-rcn-muted mt-0.5">{row.id}</div>
                    </td>
                    <td className="px-4 py-3 text-rcn-text">{row.organization}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : row.status === "Inactive"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
