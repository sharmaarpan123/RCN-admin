"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomNextLink } from "@/components";
import { UserForm } from "@/components/OrgComponent/UsersModule";
import { toastSuccess } from "@/utils/toast";
import { MOCK_ORG, type Branch } from "../../mockData";

export default function OrgPortalUserAddPage() {
  const [branches] = useState<Branch[]>(MOCK_ORG.branches);
  const router = useRouter();

  const handleSave = () => {
    toastSuccess("User created.");
    router.push("/org-portal/users");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">
          ← User list
        </CustomNextLink>
      </div>
        <UserForm mode="add" branches={branches} onSave={handleSave} />
    </div>
  );
}
