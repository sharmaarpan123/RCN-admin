"use client";

import { useState, useMemo } from "react";
import { toastSuccess, toastError } from "@/utils/toast";
import { TableColumn } from "@/components";
import type { OrgUserRow } from "./types";
import { BTN_SMALL_CLASS } from "./types";
import { UserModalContent } from "./UserModal";

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

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
  // orgs: { id: string; name: string }[];
  selectedOrgId: string;
  modal: OrgUserListModalControl;
}

const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

export function useOrgUserList({
  users,
  setUsers,
  // orgs,
  selectedOrgId,
  modal,
}: UseOrgUserListParams) {
  const { openModal, closeModal } = modal;
  const [userSearch, setUserSearch] = useState("");

  const getFilteredUsers = useMemo(
    () => () => {
      if (!selectedOrgId) return [];
      const q = safeLower(userSearch);
      return users.filter((u) => {
        if (u.orgId !== selectedOrgId) return false;
        if (!q) return true;
        const hay = safeLower(
          [u.name, u.email, u.role, u.phone, u.notes].filter(Boolean).join(" ")
        );
        return hay.includes(q);
      });
    },
    [users, selectedOrgId, userSearch]
  );

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
    toastSuccess("User saved.");
  };

  const deleteUser = (userId: string) => {
    if (!confirm("Delete this user?")) return;
    setUsers(users.filter((u) => u.id !== userId));
    closeModal();
    toastSuccess("User deleted.");
  };

  const openUserModal = (userId?: string, presetOrgId?: string) => {
    const user = userId ? users.find((u) => u.id === userId) ?? null : null;
    const targetOrgId = user?.orgId ?? presetOrgId ?? selectedOrgId ?? "";
    openModal(
      <UserModalContent
        user={user}
        targetOrgId={targetOrgId}
        presetOrgId={presetOrgId}
        // orgs={orgs}
        onClose={closeModal}
        onSave={() => saveUser(userId)}
        onDelete={user ? () => deleteUser(user.id) : undefined}
      />
    );
  };

  const orgUserColumns: TableColumn<OrgUserRow>[] = [
    {
      head: "Name",
      component: (u) => (
        <>
          <b>{u.name}</b>{" "}
          <span className="text-rcn-muted font-mono text-[11px]">({u.id})</span>
        </>
      ),
    },
    { head: "Email", component: (u) => <span className="font-mono">{u.email ?? ""}</span> },
    {
      head: "Role",
      component: (u) =>
        u.role === "ORG_ADMIN"
          ? "Organization Admin"
          : u.role === "STAFF"
            ? "Staff"
            : (u.role ?? ""),
    },
    {
      head: "Access",
      component: (u) =>
        u.adminCap ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">
            Admin capabilities
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-rcn-border bg-rcn-bg">
            Active user
          </span>
        ),
    },
    { head: "Reset", component: (u) => <>{u.resetIntervalDays ?? "—"} days</> },
    {
      head: "MFA",
      component: (u) =>
        u.mfaEmail ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">
            On
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-rcn-border bg-rcn-bg">
            Off
          </span>
        ),
    },
    {
      head: "Status",
      component: (u) =>
        u.enabled ? (
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
      component: (u) => (
        <button type="button" onClick={() => openUserModal(u.id)} className={BTN_SMALL_CLASS}>
          Edit
        </button>
      ),
    },
  ];

  return {
    userSearch,
    setUserSearch,
    getFilteredUsers,
    orgUserColumns,
    openUserModal,
  };
}
