"use client";

import { useRouter } from "next/navigation";
import { getOrganizationBranchesApi, getOrganizationDepartmentsApi } from "@/apis/ApiCalls";
import { CustomNextLink } from "@/components";
import { UserForm, type BranchWithDepts } from "@/components/OrgComponent/UsersModule";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { useQuery } from "@tanstack/react-query";

export default function OrgPortalUserAddPage() {
  const router = useRouter();

  const { data: branchesWithDepts, isLoading } = useQuery({
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
    router.push("/org-portal/users");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">
          ← User list
        </CustomNextLink>
      </div>
      <UserForm
        mode="add"
        branches={branchesWithDepts ?? []}
        onSave={handleSave}
      />
      {isLoading && (
        <p className="text-rcn-muted text-sm mt-2">Loading branches…</p>
      )}
    </div>
  );
}
