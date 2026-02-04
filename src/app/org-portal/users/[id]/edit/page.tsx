"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CustomNextLink } from "@/components";
import { UserForm } from "@/components/OrgComponent/UsersModule";
import { toastSuccess, toastError } from "@/utils/toast";
import { MOCK_USERS, MOCK_ORG, userDisplayName, type OrgUser, type Branch } from "../../../mockData";

export default function OrgPortalUserEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [users] = useState(MOCK_USERS);
  const [branches] = useState<Branch[]>(MOCK_ORG.branches);
  const user = users.find((u) => u.id === params.id);

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

  const initial = {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    dialCode: (user as { dial_code?: string }).dial_code ?? "1",
    phone: user.phone ?? "",
    faxNumber: (user as { fax_number?: string }).fax_number ?? "",
    role: user.role ?? "User",
    isAdmin: user.isAdmin ?? false,
    isActive: user.isActive ?? true,
    notes: user.notes ?? "",
    branchIds: user.branchIds ?? [],
    deptIds: user.deptIds ?? [],
  };

  const handleSave = () => {
    toastSuccess("User profile updated.");
    setTimeout(() => router.push("/org-portal/users"), 1000);
  };

  const handleToggleActive = () => {
    toastSuccess(user.isActive ? "User deactivated" : "User activated.");
  };

  const handleRemoveFromOrg = () => {
    if (!user.orgAssigned) {
      toastError("User is already unassigned in this organization.");
      return;
    }
    toastSuccess("User unassigned from this organization.");
  };

  const handleDelete = () => {
    if (
      window.prompt(`Type DELETE to permanently delete ${userDisplayName(user)}:`)?.trim().toUpperCase() !==
      "DELETE"
    ) {
      toastError("Delete not confirmed.");
      return;
    }
    toastSuccess("User permanently deleted.");
    setTimeout(() => router.push("/org-portal/users"), 1000);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <CustomNextLink href="/org-portal/users" variant="ghost" size="sm">
          ← User list
        </CustomNextLink>
      </div>
      <UserForm
        key={user.id}
        mode="edit"
        user={user}
        branches={branches}
        initial={initial}
        onSave={handleSave}
        onToggleActive={handleToggleActive}
        onRemoveFromOrg={handleRemoveFromOrg}
        onDelete={handleDelete}
      />
    </div>
  );
}
