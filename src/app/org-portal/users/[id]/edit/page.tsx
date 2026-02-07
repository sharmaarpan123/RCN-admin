"use client";

import { getOrganizationBranchesApi, getOrganizationDepartmentsApi } from "@/apis/ApiCalls";
import { CustomNextLink } from "@/components";
import { UserForm, type BranchWithDepts } from "@/components/OrgComponent/UsersModule";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { toastSuccess } from "@/utils/toast";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export default function OrgPortalUserEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;

  const { data: branchesWithDepts, isLoading: isLoadingBranches } = useQuery({
    queryKey: [...defaultQueryKeys.branchList, "with-departments"],
    queryFn: async () => {
      const res = await getOrganizationBranchesApi({ search: "" });
      if (!checkResponse({ res })) return [];
      const list = res.data?.data ?? [];
      const withDepts: BranchWithDepts[] = await Promise.all(
        list.map(async (b: { _id: string; name: string }) => {
          const dRes = await getOrganizationDepartmentsApi({ branch_id: b._id });
          const departments = checkResponse({ res: dRes }) ? (dRes.data?.data ?? []) : [];
          return {
            _id: b._id,
            name: b.name,
            departments: departments.map((d: { _id: string; name: string }) => ({ _id: d._id, name: d.name })),
          };
        })
      );
      return withDepts;
    },
  });

  const handleSave = () => {
    toastSuccess("User profile updated.");
    router.push("/org-portal/users");
  };

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

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">
          ← User list
        </CustomNextLink>
      </div>
      <UserForm
        mode="edit"
        userId={userId}
        branches={branchesWithDepts ?? []}
        onSave={handleSave}
      />
      {isLoadingBranches && (
        <p className="text-rcn-muted text-sm mt-2">Loading branches…</p>
      )}
    </div>
  );
}
