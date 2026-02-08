"use client";

import { deleteOrganizationUserApi } from "@/apis/ApiCalls";
import { toastSuccess, toastError } from "@/utils/toast";
import { UserModalContent } from "./UserModal";

export type OrgUserListModalControl = {
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
};

export type UserRecord = {
  id: string;
  orgId: string;
  name: string;
  email?: string;
  role?: string;
  adminCap?: boolean;
  resetIntervalDays?: number;
  mfaEmail?: boolean;
  enabled?: boolean;
  phone?: string;
  notes?: string;
  [key: string]: unknown;
};

export interface UseOrgUserListParams {
  users: UserRecord[];
  setUsers: React.Dispatch<React.SetStateAction<UserRecord[]>>;
  selectedOrgId: string;
  modal: OrgUserListModalControl;
  /** Call after save/delete so the users list (e.g. from API) refetches. */
  invalidateUsers?: () => void;
}

const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

export function useOrgUserList({
  users,
  setUsers,
  selectedOrgId,
  modal,
  invalidateUsers,
}: UseOrgUserListParams) {
  const { openModal, closeModal } = modal;

  const saveUser = (userId?: string) => {
    const firstName = (document.getElementById("u_first") as HTMLInputElement)?.value.trim();
    const lastName = (document.getElementById("u_last") as HTMLInputElement)?.value.trim();
    const email = (document.getElementById("u_email") as HTMLInputElement)?.value.trim().toLowerCase();
    const phone = (document.getElementById("u_phone") as HTMLInputElement)?.value.trim();
    const role = (document.getElementById("u_role") as HTMLSelectElement)?.value;
    const orgId = (document.getElementById("u_org") as HTMLSelectElement)?.value ?? "";
    const adminCap = (document.getElementById("u_access") as HTMLSelectElement)?.value === "ADMIN";
    const enabled = (document.getElementById("u_enabled") as HTMLSelectElement)?.value === "true";
    const notes = (document.getElementById("u_notes") as HTMLTextAreaElement)?.value.trim();
    const resetIntervalDays = parseInt(
      (document.getElementById("u_reset") as HTMLInputElement)?.value ?? "30",
      10
    );
    const mfaEmail = (document.getElementById("u_mfa") as HTMLSelectElement)?.value === "true";

    if (!firstName) {
      toastError("First Name required.");
      return;
    }
    if (!lastName) {
      toastError("Last Name required.");
      return;
    }
    if (!email) {
      toastError("Email required.");
      return;
    }
    if (!email.includes("@")) {
      toastError("Invalid email.");
      return;
    }
    if (!userId && users.some((u) => u.email?.toLowerCase() === email)) {
      toastError("Email already exists.");
      return;
    }

    const existing = userId ? users.find((u) => u.id === userId) : null;
    const obj: UserRecord = {
      id: userId ?? uid("u"),
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      notes,
      role,
      orgId,
      adminCap,
      enabled,
      resetIntervalDays: Number.isFinite(resetIntervalDays) ? resetIntervalDays : 30,
      mfaEmail,
      password: existing?.password ?? "Admin123!",
      passwordChangedAt: existing?.passwordChangedAt ?? "",
      forceChangeNextLogin: existing?.forceChangeNextLogin ?? false,
      branchIds: existing?.branchIds ?? [],
      deptIds: existing?.deptIds ?? [],
      permissions: existing?.permissions ?? {
        referralDashboard: true,
        userPanel: false,
        paymentAdjustmentSettings: adminCap,
        bannerManagement: adminCap,
        financials: false,
        reports: true,
        auditLog: adminCap,
        settings: false,
      },
    };

    if (userId) {
      setUsers(users.map((u) => (u.id === userId ? obj : u)));
    } else {
      setUsers([...users, obj]);
    }
    closeModal();
    invalidateUsers?.();
    toastSuccess("User saved.");
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteOrganizationUserApi(userId);
      closeModal();
      invalidateUsers?.();
      toastSuccess("User deleted.");
    } catch {
      toastError("Failed to delete user.");
    }
  };

  const openUserModal = (user?: UserRecord | null, presetOrgId?: string) => {
    const targetOrgId = user?.orgId ?? presetOrgId ?? selectedOrgId ?? "";
    openModal(
      <UserModalContent
        user={user ?? null}
        targetOrgId={targetOrgId}
        presetOrgId={presetOrgId}
        onClose={closeModal}
        onSave={() => saveUser(user?.id)}
        onDelete={user ? () => deleteUser(user.id) : undefined}
      />
    );
  };

  return { openUserModal };
}
