"use client";

import { useState, useMemo } from "react";
import { US_STATES } from "@/utils/database";
import { TableColumn } from "@/components";
import type {
  OrgTableRow,
  OrgUserRow,
  BranchTableRow,
  DeptTableRow,
  OrgModulesTab,
} from "./types";
import { BTN_SMALL_CLASS } from "./types";
import { OrgModalContent } from "./OrgModal";
import { BranchModalContent } from "./BranchModal";
import { DeptModalContent } from "./DeptModal";
import { UserModalContent } from "./UserModal";
import { MOCK_ORGANIZATIONS, MOCK_BRANCHES, MOCK_DEPARTMENTS, MOCK_ORG_USERS } from "./mockData";

const safeLower = (s: any) => (s || "").toString().toLowerCase();

export function useOrganizations() {
  const [toastMessage, setToastMessage] = useState("");
  const [showToastFlag, setShowToastFlag] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  
  // Mock data stored in state
  const [orgs, setOrgs] = useState(MOCK_ORGANIZATIONS);
  const [branches, setBranches] = useState(MOCK_BRANCHES);
  const [depts, setDepts] = useState(MOCK_DEPARTMENTS);
  const [users, setUsers] = useState(MOCK_ORG_USERS);

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowToastFlag(true);
    setTimeout(() => setShowToastFlag(false), 2600);
  };

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [zipFilter, setZipFilter] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [activeTab, setActiveTab] = useState<OrgModulesTab>("profile");
  const [branchSearch, setBranchSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const uid = (prefix: string) =>
    `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

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
          (!zipFilter ||
            safeLower(o.address?.zip || "").includes(safeLower(zipFilter)))
        );
      }),
    [orgs, search, stateFilter, zipFilter]
  );

  const selectedOrg = selectedOrgId
    ? orgs.find((o) => o.id === selectedOrgId)
    : null;

  const getFilteredBranches = () => {
    if (!selectedOrgId) return [];
    const q = safeLower(branchSearch);
    return branches.filter((b) => {
      if (b.orgId !== selectedOrgId) return false;
      if (!q) return true;
      const hay = safeLower(b.name + " " + b.id);
      return hay.includes(q);
    });
  };

  const getFilteredDepts = () => {
    if (!selectedOrgId) return [];
    const q = safeLower(deptSearch);
    return depts.filter((d) => {
      if (d.orgId !== selectedOrgId) return false;
      if (!q) return true;
      const branch = branches.find((b) => b.id === d.branchId);
      const hay = safeLower(
        d.name + " " + d.id + " " + (branch?.name || "") + " " + d.branchId
      );
      return hay.includes(q);
    });
  };

  const getFilteredUsers = () => {
    if (!selectedOrgId) return [];
    const q = safeLower(userSearch);
    return users.filter((u) => {
        if (u.orgId !== selectedOrgId) return false;
        if (!q) return true;
        const hay = safeLower(
          [u.name, u.email, u.role, u.phone, u.notes].join(" ")
        );
        return hay.includes(q);
      }
    );
  };

  const saveOrg = (orgId?: string) => {
    const name = (document.getElementById("org_name") as HTMLInputElement)?.value.trim();
    const phone = (document.getElementById("org_phone") as HTMLInputElement)?.value.trim();
    const email = (document.getElementById("org_email") as HTMLInputElement)?.value.trim();
    const state = (document.getElementById("org_state") as HTMLSelectElement)?.value.trim();
    const zip = (document.getElementById("org_zip") as HTMLInputElement)?.value.trim();

    if (!name) {
      showToast("Organization Name is required.");
      return;
    }
    if (!phone) {
      showToast("Organization Phone is required.");
      return;
    }
    if (!email) {
      showToast("Organization Email is required.");
      return;
    }
    if (!state) {
      showToast("State is required.");
      return;
    }
    if (!zip) {
      showToast("Zip is required.");
      return;
    }

    const obj = {
      id: orgId || uid("org"),
      name,
      phone,
      email,
      ein: (document.getElementById("org_ein") as HTMLInputElement)?.value.trim() || "",
      enabled: (document.getElementById("org_enabled") as HTMLSelectElement)?.value === "true",
      address: {
        street: (document.getElementById("org_street") as HTMLInputElement)?.value.trim() || "",
        suite: (document.getElementById("org_suite") as HTMLInputElement)?.value.trim() || "",
        city: (document.getElementById("org_city") as HTMLInputElement)?.value.trim() || "",
        state,
        zip,
      },
      contact: {
        first: (document.getElementById("org_c_first") as HTMLInputElement)?.value.trim() || "",
        last: (document.getElementById("org_c_last") as HTMLInputElement)?.value.trim() || "",
        email: (document.getElementById("org_c_email") as HTMLInputElement)?.value.trim() || "",
        tel: (document.getElementById("org_c_tel") as HTMLInputElement)?.value.trim() || "",
        fax: (document.getElementById("org_c_fax") as HTMLInputElement)?.value.trim() || "",
      },
      walletCents: orgId ? orgs.find((o) => o.id === orgId)?.walletCents || 0 : 0,
      referralCredits: orgId ? orgs.find((o) => o.id === orgId)?.referralCredits || 0 : 0,
    };

    if (orgId) {
      setOrgs(orgs.map((o) => (o.id === orgId ? obj : o)));
    } else {
      setOrgs([...orgs, obj]);
    }
    closeModal();
    showToast("Organization saved.");
  };

  const deleteOrg = (orgId: string) => {
    if (!confirm("Delete this organization?"))
      return;
    setOrgs(orgs.filter((o) => o.id !== orgId));
    setBranches(branches.filter((b) => b.orgId !== orgId));
    setDepts(depts.filter((d) => d.orgId !== orgId));
    setUsers(users.filter((u) => u.orgId !== orgId));
    closeModal();
    setSelectedOrgId("");
    showToast("Organization deleted.");
  };

  const openOrgModal = (orgId?: string) => {
    const org = orgId ? orgs.find((o) => o.id === orgId) : null;
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

  const saveBranch = (branchId?: string) => {
    const orgId = (document.getElementById("br_org") as HTMLSelectElement)?.value;
    const name = (document.getElementById("br_name") as HTMLInputElement)?.value.trim();
    if (!name) {
      showToast("Branch name required.");
      return;
    }
    const obj = {
      id: branchId || uid("br"),
      orgId,
      name,
      enabled: branchId
        ? branches.find((b) => b.id === branchId)?.enabled ?? true
        : true,
    };
    if (branchId) {
      setBranches(branches.map((b) => (b.id === branchId ? obj : b)));
    } else {
      setBranches([...branches, obj]);
    }
    closeModal();
    showToast("Branch saved.");
  };

  const deleteBranch = (branchId: string) => {
    if (!confirm("Delete this branch?")) return;
    setBranches(branches.filter((b) => b.id !== branchId));
    setDepts(depts.filter((d) => d.branchId !== branchId));
    closeModal();
    showToast("Branch deleted.");
  };

  const toggleBranch = (branchId: string) => {
    setBranches(branches.map((b) => 
      b.id === branchId ? { ...b, enabled: !b.enabled } : b
    ));
  };

  const openBranchModal = (branchId?: string, presetOrgId?: string) => {
    const branch = branchId
      ? branches.find((b) => b.id === branchId)
      : null;
    const targetOrgId = branch?.orgId || presetOrgId || selectedOrgId || "";
    openModal(
      <BranchModalContent
        branch={branch}
        targetOrgId={targetOrgId}
        presetOrgId={presetOrgId}
        orgs={orgs}
        onClose={closeModal}
        onSave={() => saveBranch(branchId)}
        onDelete={branch ? () => deleteBranch(branch.id) : undefined}
      />
    );
  };

  const saveDept = (deptId?: string) => {
    const orgId = (document.getElementById("dp_org") as HTMLSelectElement)?.value;
    const branchId = (document.getElementById("dp_branch") as HTMLSelectElement)?.value;
    const name = (document.getElementById("dp_name") as HTMLInputElement)?.value.trim();
    if (!name) {
      showToast("Department name required.");
      return;
    }
    const obj = {
      id: deptId || uid("dp"),
      orgId,
      branchId,
      name,
      enabled: deptId
        ? depts.find((d) => d.id === deptId)?.enabled ?? true
        : true,
    };
    if (deptId) {
      setDepts(depts.map((d) => (d.id === deptId ? obj : d)));
    } else {
      setDepts([...depts, obj]);
    }
    closeModal();
    showToast("Department saved.");
  };

  const deleteDept = (deptId: string) => {
    if (!confirm("Delete this department?")) return;
    setDepts(depts.filter((d) => d.id !== deptId));
    closeModal();
    showToast("Department deleted.");
  };

  const toggleDept = (deptId: string) => {
    setDepts(depts.map((d) => 
      d.id === deptId ? { ...d, enabled: !d.enabled } : d
    ));
  };

  const openDeptModal = (deptId?: string, presetOrgId?: string) => {
    const dept = deptId ? depts.find((d) => d.id === deptId) : null;
    const targetOrgId = dept?.orgId || presetOrgId || selectedOrgId || "";
    openModal(
      <DeptModalContent
        dept={dept}
        targetOrgId={targetOrgId}
        presetOrgId={presetOrgId}
        orgs={orgs}
        branches={branches}
        onClose={closeModal}
        onSave={() => saveDept(deptId)}
        onDelete={dept ? () => deleteDept(dept.id) : undefined}
      />
    );
  };

  const saveUser = (userId?: string) => {
    const firstName = (document.getElementById("u_first") as HTMLInputElement)?.value.trim();
    const lastName = (document.getElementById("u_last") as HTMLInputElement)?.value.trim();
    const email = (document.getElementById("u_email") as HTMLInputElement)?.value.trim().toLowerCase();
    const phone = (document.getElementById("u_phone") as HTMLInputElement)?.value.trim();
    const role = (document.getElementById("u_role") as HTMLSelectElement)?.value;
    const orgId = (document.getElementById("u_org") as HTMLSelectElement)?.value || null;
    const adminCap = (document.getElementById("u_access") as HTMLSelectElement)?.value === "ADMIN";
    const enabled = (document.getElementById("u_enabled") as HTMLSelectElement)?.value === "true";
    const notes = (document.getElementById("u_notes") as HTMLTextAreaElement)?.value.trim();
    const resetIntervalDays = parseInt(
      (document.getElementById("u_reset") as HTMLInputElement)?.value || "30",
      10
    );
    const mfaEmail = (document.getElementById("u_mfa") as HTMLSelectElement)?.value === "true";

    if (!firstName) {
      showToast("First Name required.");
      return;
    }
    if (!lastName) {
      showToast("Last Name required.");
      return;
    }
    if (!email) {
      showToast("Email required.");
      return;
    }
    if (!email.includes("@")) {
      showToast("Invalid email.");
      return;
    }
    if (!userId && users.some((u) => u.email.toLowerCase() === email)) {
      showToast("Email already exists.");
      return;
    }

    const existing = userId ? users.find((u) => u.id === userId) : null;
    const obj = {
      id: userId || uid("u"),
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
      resetIntervalDays: isFinite(resetIntervalDays) ? resetIntervalDays : 30,
      mfaEmail,
      password: existing?.password || "Admin123!",
      passwordChangedAt: existing?.passwordChangedAt || "",
      forceChangeNextLogin: existing?.forceChangeNextLogin ?? false,
      branchIds: existing?.branchIds || [],
      deptIds: existing?.deptIds || [],
      permissions: existing?.permissions || {
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
    showToast("User saved.");
  };

  const deleteUser = (userId: string) => {
    if (!confirm("Delete this user?")) return;
    setUsers(users.filter((u) => u.id !== userId));
    closeModal();
    showToast("User deleted.");
  };

  const openUserModal = (userId?: string, presetOrgId?: string) => {
    const user = userId ? users.find((u) => u.id === userId) : null;
    const targetOrgId = user?.orgId || presetOrgId || selectedOrgId || "";
    openModal(
      <UserModalContent
        user={user}
        targetOrgId={targetOrgId}
        presetOrgId={presetOrgId}
        orgs={orgs}
        onClose={closeModal}
        onSave={() => saveUser(userId)}
        onDelete={user ? () => deleteUser(user.id) : undefined}
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
                document
                  .getElementById("org-modules-card")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    { head: "Email", component: (u) => <span className="font-mono">{u.email}</span> },
    {
      head: "Role",
      component: (u) =>
        u.role === "ORG_ADMIN"
          ? "Organization Admin"
          : u.role === "STAFF"
            ? "Staff"
            : u.role,
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
        <button type="button"   onClick={() => openUserModal(u.id)} className={BTN_SMALL_CLASS}>
          Edit
        </button>
      ),
    },
  ];

  const branchTableColumns: TableColumn<BranchTableRow>[] = [
    {
      head: "Branch",
      component: (b) => (
        <>
          <b>{b.name}</b>{" "}
          <span className="text-rcn-muted font-mono text-[11px]">({b.id})</span>
        </>
      ),
    },
    {
      head: "Status",
      component: (b) =>
        b.enabled ? (
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
      component: (b) => (
        <div className="flex gap-2">
          <button type="button"   onClick={() => toggleBranch(b.id)} className={BTN_SMALL_CLASS}>
            Toggle
          </button>
          <button type="button"   onClick={() => openBranchModal(b.id)} className={BTN_SMALL_CLASS}>
            Edit
          </button>
        </div>
      ),
    },
  ];

  const deptTableColumns: TableColumn<DeptTableRow>[] = [
    {
      head: "Branch",
      component: (d) => {
        const branch = branches.find((b) => b.id === d.branchId);
        return (
          <>
            {branch?.name || "—"}{" "}
            <span className="text-rcn-muted font-mono text-[11px]">
              ({d.branchId || "—"})
            </span>
          </>
        );
      },
    },
    {
      head: "Department",
      component: (d) => (
        <>
          <b>{d.name}</b>{" "}
          <span className="text-rcn-muted font-mono text-[11px]">({d.id})</span>
        </>
      ),
    },
    {
      head: "Status",
      component: (d) =>
        d.enabled ? (
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
      component: (d) => (
        <div className="flex gap-2">
          <button type="button"  onClick={() => toggleDept(d.id)} className={BTN_SMALL_CLASS}>
            Toggle
          </button>
          <button type="button"  onClick={() => openDeptModal(d.id)} className={BTN_SMALL_CLASS}>
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
    selectedOrgId,
    setSelectedOrgId,
    activeTab,
    setActiveTab,
    branchSearch,
    setBranchSearch,
    deptSearch,
    setDeptSearch,
    userSearch,
    setUserSearch,
    filteredOrgs,
    selectedOrg,
    getFilteredBranches,
    getFilteredDepts,
    getFilteredUsers,
    orgTableColumns,
    orgUserColumns,
    branchTableColumns,
    deptTableColumns,
    openOrgModal,
    openBranchModal,
    openDeptModal,
    openUserModal,
    db: { orgs, branches, depts, users },
    toastMessage,
    showToastFlag,
    modalContent,
  };
}
