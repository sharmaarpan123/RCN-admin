"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, CustomNextLink } from "@/components";
import { toastSuccess, toastError } from "@/utils/toast";
import { userDisplayName, isValidEmail, type OrgUser, type Branch } from "@/app/org-portal/mockData";
import { createOrganizationUserApi, updateOrganizationUserApi } from "@/apis/ApiCalls";
import { catchAsync, checkResponse } from "@/utils/commonFunc";

export type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  dialCode: string;
  phone: string;
  faxNumber: string;
  role: string;
  isAdmin: boolean;
  isActive: boolean;
  notes: string;
  branchIds: string[];
  deptIds: string[];
};

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30";

type UserFormProps = {
  mode: "add" | "edit";
  branches: Branch[];
  initial?: Partial<UserFormData>;
  user?: OrgUser;
  onSave: (data: UserFormData) => void;
  onToggleActive?: () => void;
  onRemoveFromOrg?: () => void;
  onDelete?: () => void;
};

export function UserForm({
  mode,
  branches,
  initial,
  user,
  onSave,
  onToggleActive,
  onRemoveFromOrg,
  onDelete,
}: UserFormProps) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [dialCode, setDialCode] = useState(initial?.dialCode ?? "1");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [faxNumber, setFaxNumber] = useState(initial?.faxNumber ?? "");
  const [role, setRole] = useState(initial?.role ?? "User");
  const [isAdmin, setIsAdmin] = useState(initial?.isAdmin ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [branchIds, setBranchIds] = useState<Set<string>>(new Set(initial?.branchIds ?? []));
  const [deptIds, setDeptIds] = useState<Set<string>>(new Set(initial?.deptIds ?? []));
  const [showPassword, setShowPassword] = useState(false);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addPasswordConfirm, setAddPasswordConfirm] = useState("");

  const findBranch = (id: string) => branches.find((b) => b.id === id) ?? null;
  const toggleBranch = (id: string) =>
    setBranchIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleDept = (id: string) =>
    setDeptIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const showBranchIds = Array.from(branchIds);

  const { isPending, mutate } = useMutation({
    mutationFn: catchAsync(
      async (vars: { mode: "add" | "edit"; userId?: string; createPayload?: Parameters<typeof createOrganizationUserApi>[0]; updatePayload?: Parameters<typeof updateOrganizationUserApi>[1] }) => {
        if (vars.mode === "add" && vars.createPayload) {
          const res = await createOrganizationUserApi(vars.createPayload);
          if (!checkResponse({ res, showSuccess: true })) throw new Error("Create failed");
        } else if (vars.mode === "edit" && vars.userId && vars.updatePayload) {
          const res = await updateOrganizationUserApi(vars.userId, vars.updatePayload);
          if (!checkResponse({ res, showSuccess: true })) throw new Error("Update failed");
        }
      }
    ),
    onSuccess: () => {
      onSave({
        firstName: (firstName || "").trim(),
        lastName: (lastName || "").trim(),
        email: (email || "").trim().toLowerCase(),
        dialCode: dialCode.trim() || "1",
        phone: (phone || "").trim(),
        faxNumber: (faxNumber || "").trim(),
        role,
        isAdmin,
        isActive,
        notes: (notes || "").trim(),
        branchIds: Array.from(branchIds),
        deptIds: Array.from(deptIds),
      });
    },
  });

  const handleSave = () => {
    const firstNameTrimmed = (firstName || "").trim();
    const lastNameTrimmed = (lastName || "").trim();
    const emailTrimmed = (email || "").trim().toLowerCase();
    const phoneTrimmed = (phone || "").trim().replace(/\D/g, "");
    const dialCodeTrimmed = (dialCode || "").trim() || "1";
    const faxTrimmed = (faxNumber || "").trim();
    const notesTrimmed = (notes || "").trim();

    if (!firstNameTrimmed || !lastNameTrimmed) {
      toastError("First name and last name are required.");
      return;
    }
    if (!emailTrimmed || !isValidEmail(emailTrimmed)) {
      toastError("Please enter a valid email.");
      return;
    }
    if (mode === "add") {
      if (addPassword.length < 8) {
        toastError("Password must be at least 8 characters.");
        return;
      }
      if (addPassword !== addPasswordConfirm) {
        toastError("Password and confirm password do not match.");
        return;
      }
    }

    if (mode === "add") {
      mutate({
        mode: "add",
        createPayload: {
          first_name: firstNameTrimmed,
          last_name: lastNameTrimmed,
          email: emailTrimmed,
          dial_code: dialCodeTrimmed,
          password: addPassword,
          phone_number: phoneTrimmed || "",
          fax_number: faxTrimmed || undefined,
          notes: notesTrimmed || undefined,
        },
      });
    } else if (user?.id) {
      mutate({
        mode: "edit",
        userId: user.id,
        updatePayload: {
          first_name: firstNameTrimmed,
          last_name: lastNameTrimmed,
          dial_code: dialCodeTrimmed,
          phone_number: phoneTrimmed || "",
          fax_number: faxTrimmed || undefined,
          notes: notesTrimmed || undefined,
        },
      });
    } else {
      toastError("User ID is required to update.");
    }
  };

  const handlePassword = () => {
    if (p1.length < 8) return;
    if (p1 !== p2) return;
    toastSuccess("Password reset prepared (demo).");
    setP1("");
    setP2("");
    setShowPassword(false);
  };

  const isEdit = mode === "edit";

  return (
    <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold m-0">
              {isEdit ? "Edit User detail" : "Add User"}
            </h1>
            <p className="text-sm text-rcn-muted m-0 mt-1">
              {isEdit && user ? userDisplayName(user) : "Create a new user and assign branches & departments."}
            </p>
          </div>
        </div>

        {isEdit && (
          <div className="shrink-0 border border-rcn-border rounded-xl p-4 mt-2 bg-rcn-bg/50 min-w-[220px]">
            <h2 className="font-bold text-sm m-0 mb-2">Manage Password</h2>
            {!showPassword ? (
              <Button variant="secondary" size="sm" onClick={() => setShowPassword(true)}>
                Change Password
              </Button>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  value={p1}
                  onChange={(e) => setP1(e.target.value)}
                  placeholder="New password (8+ chars)"
                  className={inputClass}
                />
                <input
                  type="password"
                  value={p2}
                  onChange={(e) => setP2(e.target.value)}
                  placeholder="Confirm"
                  className={inputClass}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePassword}
                    disabled={p1.length < 8 || p1 !== p2}
                  >
                    Update Password
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowPassword(false);
                      setP1("");
                      setP2("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-xs text-rcn-muted mb-1">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted mb-1">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-rcn-muted mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="email@example.com"
              className={inputClass}
              readOnly={isEdit}
            />
          </div>
          {!isEdit && (
            <>
              <div>
                <label className="block text-xs text-rcn-muted mb-1">Password</label>
                <input
                  type="password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={addPasswordConfirm}
                  onChange={(e) => setAddPasswordConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className={inputClass}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs text-rcn-muted mb-1">Dial code</label>
            <input
              value={dialCode}
              onChange={(e) => setDialCode(e.target.value)}
              placeholder="1"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted mb-1">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted mb-1">Fax number</label>
            <input
              value={faxNumber}
              onChange={(e) => setFaxNumber(e.target.value)}
              placeholder="0112233445"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            >
              <option value="User">User</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-rcn-muted mb-1.5">Access</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="rounded border-rcn-border"
              />
              <span className="text-sm">Admin capabilities</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-rcn-border"
              />
              <span className="text-sm">Active user</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-rcn-muted mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes"
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>

        <div className="border-t border-rcn-border mt-6 pt-6">
          <h2 className="font-bold text-sm m-0 mb-2">Assign Branch & Department</h2>
          <p className="text-xs text-rcn-muted m-0 mb-3">Select branches and departments for this user.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Branches</label>
              <div className="border border-rcn-border rounded-xl p-3 max-h-40 overflow-auto space-y-1">
                {branches.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={branchIds.has(b.id)}
                      onChange={() => toggleBranch(b.id)}
                      className="rounded border-rcn-border"
                    />
                    <span className="text-sm">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Departments (by branch)</label>
              <div className="border border-rcn-border rounded-xl p-3 max-h-40 overflow-auto space-y-2">
                {showBranchIds.map((brId) => {
                  const br = findBranch(brId);
                  if (!br) return null;
                  return (
                    <div key={br.id}>
                      <p className="text-xs font-bold text-rcn-accent m-0 mb-1">{br.name}</p>
                      {(br.departments ?? []).map((d) => (
                        <label key={d.id} className="flex items-center gap-2 py-0.5 ml-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={deptIds.has(d.id)}
                            onChange={() => toggleDept(d.id)}
                            className="rounded border-rcn-border"
                          />
                          <span className="text-sm">{d.name}</span>
                        </label>
                      ))}
                    </div>
                  );
                })}
                {!showBranchIds.length && (
                  <p className="text-xs text-rcn-muted m-0">Select branches to see departments.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-6 pt-6 border-t border-rcn-border justify-between">
          {isEdit && onToggleActive && onRemoveFromOrg && onDelete && user && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={onToggleActive}>
                {user.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onRemoveFromOrg}
                disabled={!user.orgAssigned}
              >
                Remove from Org
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete}>
                Delete
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
            <CustomNextLink href="/org-portal/users" variant="secondary" size="sm">
              Cancel
            </CustomNextLink>
          </div>
        </div>
      </div>
    </div>
  );
}
