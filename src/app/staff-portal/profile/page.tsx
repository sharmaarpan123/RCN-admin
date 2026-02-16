"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toastSuccess, toastError } from "@/utils/toast";
import { getAuthProfileApi, putUserProfileApi, changePasswordApi } from "@/apis/ApiCalls";
import { checkResponse, catchAsync } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { Button } from "@/components";

/** API profile shape (snake_case from GET /api/auth/profile) */
interface ApiProfile {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture?: string;
  phone?: string;
  fax?: string;
  address?: string;
  role?: string;
  notes?: string;
}

const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10";

const changePasswordSchema = yup.object({
  password: yup
    .string()
    .required("New password is required.")
    .min(8, "Password must be at least 8 characters."),
  confirmPassword: yup
    .string()
    .required("Please confirm your password.")
    .oneOf([yup.ref("password")], "Passwords do not match."),
});

type ChangePasswordFormValues = yup.InferType<typeof changePasswordSchema>;

export default function StaffProfilePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    fax: "",
    address: "",
    role: "",
    notes: "",
    profilePicture: "",
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: defaultQueryKeys.profile,
    queryFn: async () => {
      const res = await getAuthProfileApi();
      if (!checkResponse({ res })) return null;
      const raw = res.data as { data?: ApiProfile; user?: ApiProfile };
      const profile = raw?.data ?? raw?.user ?? null;
      return profile && typeof profile === "object" ? profile : null;
    },
  });

  const initialFormData = useMemo(() => {
    const p = profileData;
    if (!p) return null;
    return {
      firstName: p.first_name ?? "",
      lastName: p.last_name ?? "",
      email: p.email ?? "",
      phone: p.phone ?? "",
      fax: p.fax ?? "",
      address: p.address ?? "",
      role: p.role ?? "",
      notes: p.notes ?? "",
      profilePicture: p.profile_picture ?? "",
    };
  }, [profileData]);

  React.useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);
    }
  }, [initialFormData]);

  const { isPending: isSavePending, mutate: saveProfile } = useMutation({
    mutationFn: catchAsync(async () => {
      const first_name = formData.firstName.trim();
      const last_name = formData.lastName.trim();
      const email = formData.email.trim().toLowerCase();
      if (!first_name) {
        toastError("First name is required.");
        return;
      }
      if (!last_name) {
        toastError("Last name is required.");
        return;
      }
      if (!email) {
        toastError("Email is required.");
        return;
      }
      if (!email.includes("@")) {
        toastError("Please enter a valid email address.");
        return;
      }
      const body: Parameters<typeof putUserProfileApi>[0] = {
        first_name,
        last_name,
        email: email || undefined,
        phone: formData.phone.trim() || undefined,
        fax: formData.fax.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };
      if (formData.profilePicture) {
        body.profile_picture = formData.profilePicture;
      }
      const res = await putUserProfileApi(body);
      if (!checkResponse({ res, showSuccess: true })) return;
      queryClient.invalidateQueries({ queryKey: defaultQueryKeys.profile });
    }),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: yupResolver(changePasswordSchema),
  });

  const { isPending: isPasswordPending, mutate: changePassword } = useMutation({
    mutationFn: catchAsync(async (data: ChangePasswordFormValues) => {
      const res = await changePasswordApi({ password: data.password });
      if (!checkResponse({ res, showSuccess: true })) return;
      resetPasswordForm();
    }),
  });

  const handleReset = () => {
    if (initialFormData) {
      setFormData(initialFormData);
      toastSuccess("Form reset to saved values.");
    }
  };

  const handleSaveProfile = () => {
    saveProfile();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-10">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold m-0 mb-2">Staff Profile</h1>
        <p className="text-rcn-muted text-sm m-0">Manage your contact information and profile preferences.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <Button
              type="button"
              variant="tab"
              size="md"
              onClick={() => setActiveTab("profile")}
              className={activeTab === "profile" ? "bg-white shadow border-slate-200" : ""}
            >
              Profile
            </Button>
            <Button
              type="button"
              variant="tab"
              size="md"
              onClick={() => setActiveTab("password")}
              className={activeTab === "password" ? "bg-white shadow border-slate-200" : ""}
            >
              Manage password
            </Button>
          </div>

        </div>
      </div>

      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-xs font-black text-rcn-muted mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className={INPUT_CLASS}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-xs font-black text-rcn-muted mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={INPUT_CLASS}
                placeholder="Enter last name"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-xs font-black text-rcn-muted mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={INPUT_CLASS}
                placeholder="Enter email address"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-xs font-black text-rcn-muted mb-1.5">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={INPUT_CLASS}
                placeholder="Enter address"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-black text-rcn-muted mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={INPUT_CLASS}
                placeholder="(312) 555-0100"
              />
            </div>
            <div>
              <label htmlFor="fax" className="block text-xs font-black text-rcn-muted mb-1.5">
                Fax Number
              </label>
              <input
                id="fax"
                type="tel"
                value={formData.fax}
                onChange={(e) => handleChange("fax", e.target.value)}
                className={INPUT_CLASS}
                placeholder="(312) 555-0199"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-xs font-black text-rcn-muted mb-1.5">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={4}
                className={`${INPUT_CLASS} resize-none`}
                placeholder="Additional notes or information"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!initialFormData || isSavePending}
              className="border border-slate-200"
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveProfile}
              disabled={isSavePending}
            >
              {isSavePending ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "password" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6">
          <h2 className="text-lg font-semibold m-0 mb-4">Change password</h2>
          <p className="text-rcn-muted text-sm m-0 mb-4">Set a new password for your account. Use at least 8 characters.</p>
          <form onSubmit={handleSubmitPassword((data) => changePassword(data))} className="max-w-md space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-black text-rcn-muted mb-1.5">
                New password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                {...registerPassword("password")}
                className={INPUT_CLASS}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              {passwordErrors.password && (
                <p className="text-red-600 text-xs mt-1 m-0" role="alert">{passwordErrors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-black text-rcn-muted mb-1.5">
                Confirm new password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...registerPassword("confirmPassword")}
                className={INPUT_CLASS}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1 m-0" role="alert">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm" disabled={isPasswordPending}>
                {isPasswordPending ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
