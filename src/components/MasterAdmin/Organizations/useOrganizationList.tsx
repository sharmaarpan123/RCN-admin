"use client";

import { useState, useMemo } from "react";
import { toastSuccess, toastError } from "@/utils/toast";
import { TableColumn } from "@/components";
import type { OrgTableRow } from "./types";
import { BTN_SMALL_CLASS } from "./types";
import { OrgModalContent } from "./OrgModal";

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

export type OrgListModalControl = {
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
};

export type OrgRecord = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  ein?: string;
  enabled?: boolean;
  walletCents?: number;
  referralCredits?: number;
  address?: { street?: string; suite?: string; city?: string; state?: string; zip?: string };
  contact?: { first?: string; last?: string; email?: string; tel?: string; fax?: string };
};

export interface UseOrganizationListParams {
  orgs: OrgRecord[];
  setOrgs: React.Dispatch<React.SetStateAction<OrgRecord[]>>;
  setBranches: React.Dispatch<React.SetStateAction<unknown[]>>;
  setDepts: React.Dispatch<React.SetStateAction<unknown[]>>;
  setUsers: React.Dispatch<React.SetStateAction<unknown[]>>;
  modal: OrgListModalControl;
  setSelectedOrgId: (id: string) => void;
  setActiveTab: (tab: "profile" | "branches" | "depts" | "users") => void;
}

const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

export function useOrganizationList({
  orgs,
  setOrgs,
  setBranches,
  setDepts,
  setUsers,
  modal,
  setSelectedOrgId,
  setActiveTab,
}: UseOrganizationListParams) {
  const { openModal, closeModal } = modal;
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [zipFilter, setZipFilter] = useState("");

  const filteredOrgs = useMemo(
    () =>
      orgs.filter((o) => {
        const searchLower = safeLower(search);
        const hay = [
          o.name,
          o.phone,
          o.email,
          o.address?.street,
          o.address?.suite,
          o.address?.city,
          o.address?.state,
          o.address?.zip,
        ]
          .map(safeLower)
          .join(" ");
        return (
          (!search || hay.includes(searchLower)) &&
          (!stateFilter || o.address?.state === stateFilter) &&
          (!zipFilter || safeLower(o.address?.zip ?? "").includes(safeLower(zipFilter)))
        );
      }),
    [orgs, search, stateFilter, zipFilter]
  );

  const saveOrg = (orgId?: string) => {
    const name = (document.getElementById("org_name") as HTMLInputElement)?.value.trim();
    const phone = (document.getElementById("org_phone") as HTMLInputElement)?.value.trim();
    const email = (document.getElementById("org_email") as HTMLInputElement)?.value.trim();
    const state = (document.getElementById("org_state") as HTMLSelectElement)?.value.trim();
    const zip = (document.getElementById("org_zip") as HTMLInputElement)?.value.trim();

    if (!name) {
      toastError("Organization Name is required.");
      return;
    }
    if (!phone) {
      toastError("Organization Phone is required.");
      return;
    }
    if (!email) {
      toastError("Organization Email is required.");
      return;
    }
    if (!state) {
      toastError("State is required.");
      return;
    }
    if (!zip) {
      toastError("Zip is required.");
      return;
    }

    const obj = {
      ...orgs.find((o) => o.id === orgId),
      id: orgId ?? uid("org"),
      name,
      phone,
      email,
      ein: (document.getElementById("org_ein") as HTMLInputElement)?.value.trim() ?? "",
      enabled: (document.getElementById("org_enabled") as HTMLSelectElement)?.value === "true",
      address: {
        street: (document.getElementById("org_street") as HTMLInputElement)?.value.trim() ?? "",
        suite: (document.getElementById("org_suite") as HTMLInputElement)?.value.trim() ?? "",
        city: (document.getElementById("org_city") as HTMLInputElement)?.value.trim() ?? "",
        state,
        zip,
      },
      contact: {
        first: (document.getElementById("org_c_first") as HTMLInputElement)?.value.trim() ?? "",
        last: (document.getElementById("org_c_last") as HTMLInputElement)?.value.trim() ?? "",
        email: (document.getElementById("org_c_email") as HTMLInputElement)?.value.trim() ?? "",
        tel: (document.getElementById("org_c_tel") as HTMLInputElement)?.value.trim() ?? "",
        fax: (document.getElementById("org_c_fax") as HTMLInputElement)?.value.trim() ?? "",
      },
      walletCents: orgId ? orgs.find((o) => o.id === orgId)?.walletCents ?? 0 : 0,
      referralCredits: orgId ? orgs.find((o) => o.id === orgId)?.referralCredits ?? 0 : 0,
    } as OrgRecord;

    if (orgId) {
      setOrgs(orgs.map((o) => (o.id === orgId ? obj : o)));
    } else {
      setOrgs([...orgs, obj]);
    }
    closeModal();
    toastSuccess("Organization saved.");
  };

  const deleteOrg = (orgId: string) => {
    if (!confirm("Delete this organization?")) return;
    setOrgs(orgs.filter((o) => o.id !== orgId));
    setBranches((prev: unknown[]) => (prev as { orgId: string }[]).filter((b) => b.orgId !== orgId));
    setDepts((prev: unknown[]) => (prev as { orgId: string }[]).filter((d) => d.orgId !== orgId));
    setUsers((prev: unknown[]) => (prev as { orgId: string }[]).filter((u) => u.orgId !== orgId));
    closeModal();
    setSelectedOrgId("");
    toastSuccess("Organization deleted.");
  };

  const openOrgModal = (orgId?: string) => {
    const org = orgId ? orgs.find((o) => o.id === orgId) ?? null : null;
    openModal(
      <OrgModalContent
        org={org}
        orgId={orgId}
        onClose={closeModal}
        onSave={() => saveOrg(orgId)}
        onDelete={org ? () => deleteOrg(org.id) : undefined}
      />
    );
  };

  const orgTableColumns: TableColumn<OrgTableRow>[] = [
    {
      head: "Name",
      component: (o) => (
        <>
          <b>{o.name}</b>
          <div className="text-rcn-muted">{o.email}</div>
        </>
      ),
    },
    { head: "State", component: (o) => o.address?.state ?? "—" },
    { head: "Zip", component: (o) => <span className="font-mono">{o.address?.zip ?? "—"}</span> },
    { head: "City", component: (o) => o.address?.city ?? "—" },
    { head: "Street", component: (o) => o.address?.street ?? "—" },
    {
      head: "Enabled",
      component: (o) =>
        o.enabled ? (
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
      component: (o) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedOrgId(o.id);
              setActiveTab("branches");
              setTimeout(() => {
                document.getElementById("org-modules-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            }}
            className={BTN_SMALL_CLASS}
          >
            Manage
          </button>
          <button type="button" onClick={() => openOrgModal(o.id)} className={BTN_SMALL_CLASS}>
            Edit
          </button>
        </div>
      ),
    },
  ];

  return {
    search,
    setSearch,
    stateFilter,
    setStateFilter,
    zipFilter,
    setZipFilter,
    filteredOrgs,
    orgTableColumns,
    openOrgModal,
  };
}
