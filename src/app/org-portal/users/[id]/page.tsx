"use client";

import { getOrganizationUserApi } from "@/apis/ApiCalls";
import { CustomNextLink } from "@/components";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

function userDisplayName(u: Record<string, unknown>): string {
  const first = (u.first_name as string) ?? "";
  const last = (u.last_name as string) ?? "";
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return ((u.email as string) ?? "").trim() || "—";
}

export default function OrgPortalUserViewPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: [...defaultQueryKeys.user, userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await getOrganizationUserApi(userId);
      if (!checkResponse({ res })) return null;
      const d = res.data;
      if (Array.isArray(d?.data)) return (d.data[0] as Record<string, unknown>) ?? null;
      return (d?.data ?? d) as Record<string, unknown> | null;
    },
    enabled: !!userId,
  });

  const user = userData && typeof userData === "object" ? userData : null;
  const userBranches = (Array.isArray(user?.branches) ? user.branches : []) as { _id: string; name: string }[];
  const userDepartments = (Array.isArray(user?.departments) ? user.departments : []) as {
    _id: string;
    name: string;
    branch_id?: string;
    branch?: { _id: string; name: string };
  }[];

  // Group departments by branch for display (API returns departments with nested branch)
  const departmentsByBranch = userDepartments.reduce<Record<string, { branchName: string; depts: { _id: string; name: string }[] }>>(
    (acc, d) => {
      const br = d.branch ?? { _id: d.branch_id ?? "", name: "—" };
      if (!acc[br._id]) acc[br._id] = { branchName: br.name, depts: [] };
      acc[br._id].depts.push({ _id: d._id, name: d.name });
      return acc;
    },
    {}
  );

  if (!userId) {
    return (
      <div>
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">
          ← User list
        </CustomNextLink>
        <p className="mt-4 text-rcn-muted">Invalid user.</p>
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div>
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">
          ← User list
        </CustomNextLink>
        <p className="mt-4 text-rcn-muted">Loading user…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">
          ← User list
        </CustomNextLink>
        <p className="mt-4 text-rcn-muted">User not found.</p>
      </div>
    );
  }


  

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">
          ← User list
        </CustomNextLink>
      </div>
      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold m-0">View User</h1>
              <p className="text-sm text-rcn-muted m-0 mt-1">{userDisplayName(user)}</p>
            </div>
            <CustomNextLink href={`/org-portal/users/${userId}/edit`} variant="primary" size="sm">
              Edit
            </CustomNextLink>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <dt className="text-xs text-rcn-muted mb-0.5">First Name</dt>
              <dd className="text-sm m-0">{(user.first_name as string) || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-rcn-muted mb-0.5">Last Name</dt>
              <dd className="text-sm m-0">{(user.last_name as string) || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-rcn-muted mb-0.5">Email</dt>
              <dd className="text-sm m-0">{(user.email as string) || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-rcn-muted mb-0.5">Phone</dt>
              <dd className="text-sm m-0">
                {[user.dial_code, user.phone_number].filter(Boolean).length
                  ? `+${(user.dial_code as string) ?? ""} ${(user.phone_number as string) ?? ""}`.trim()
                  : "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-rcn-muted mb-0.5">Notes</dt>
              <dd className="text-sm m-0 whitespace-pre-wrap">{(user.notes as string) || "—"}</dd>
            </div>
          </dl>

          <div className="border-t border-rcn-border mt-6 pt-6">
            <h2 className="font-bold text-sm m-0 mb-2">Branch & Department</h2>
            <p className="text-xs text-rcn-muted m-0 mb-3">Assigned branches and departments for this user.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs text-rcn-muted font-medium m-0 mb-2">Branches</h3>
                <ul className="list-none p-0 m-0 space-y-1.5 max-h-40 overflow-auto">
                  {userBranches.length === 0 ? (
                    <li className="text-sm text-rcn-muted">No branches assigned.</li>
                  ) : (
                    userBranches.map((br) => (
                      <li key={br._id} className="text-sm">{br.name}</li>
                    ))
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-xs text-rcn-muted font-medium m-0 mb-2">Departments by user</h3>
                <ul className="list-none p-0 m-0 space-y-2 max-h-40 overflow-auto">
                  {userDepartments.length === 0 ? (
                    <li className="text-sm text-rcn-muted">No departments assigned.</li>
                  ) : (
                    Object.entries(departmentsByBranch).map(([brId, { branchName, depts }]) => (
                      <li key={brId}>
                        <span className="text-xs font-bold text-rcn-accent block mb-0.5">{branchName}</span>
                        <ul className="list-none p-0 m-0 ml-2 space-y-0.5">
                          {depts.map((d) => (
                            <li key={d._id} className="text-sm">{d.name}</li>
                          ))}
                        </ul>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-rcn-border justify-between">
            <CustomNextLink href="/org-portal/users" variant="secondary" size="sm" className="shrink-0">
              Back to list
            </CustomNextLink>
          </div>
        </div>
      </div>
    </div>
  );
}
