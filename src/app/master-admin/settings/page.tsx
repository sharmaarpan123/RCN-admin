"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAuthProfileApi, updateAdminProfileApi, changePasswordApi } from "@/apis/ApiCalls";
import { Button, PhoneInputField } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { toastError } from "@/utils/toast";
import { AdminProfileData } from "../types/profile";

const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";

const DEFAULT_DIAL_CODE = "1";

const profileSchema = yup.object({
  firstName: yup.string().trim().required("First name is required."),
  lastName: yup.string().trim().required("Last name is required."),
  email: yup
    .string()
    .trim()
    .required("Email is required.")
    .email("Please enter a valid email."),
  dialCode: yup.string().trim().optional().default(DEFAULT_DIAL_CODE),
  phone_number: yup.string().trim().default("").test("min-length", "Invalid number", (val) =>val.length >= 7),

});

type ProfileFormValues = yup.InferType<typeof profileSchema>;

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

function profileToFormValues(p: AdminProfileData | null): ProfileFormValues {
  if (!p) {
    return { firstName: "", lastName: "", email: "", dialCode: DEFAULT_DIAL_CODE, phone_number: "", };
  }
  const raw = p as AdminProfileData & { phone?: string; dial_code?: string; phone_number?: string; notes?: string };
  const rawDial = (raw.dial_code ?? "").toString().replace(/\D/g, "");
  const dialCode = rawDial || DEFAULT_DIAL_CODE;
  const phone_number =
    (raw.phone_number ?? "").toString().replace(/\D/g, "") ||
    (raw.phone ?? "").replace(/\D/g, "").replace(/^1(?=\d{10})/, "").trim();
  return {
    firstName: raw.first_name ?? "",
    lastName: raw.last_name ?? "",
    email: raw.email ?? "",
    dialCode,
    phone_number,

  };
}

const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [showPassword, setShowPassword] = useState({ newPassword: false, confirmPassword: false });

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: defaultQueryKeys.profile,
    queryFn: async () => {
      const res = await getAuthProfileApi();
      if (!checkResponse({ res })) return null;
      const raw = res.data as { data?: AdminProfileData; success?: boolean };
      const profile = raw?.data ?? null;
      return profile && typeof profile === "object" ? profile : null;
    },
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    watch: watchProfile,
    setValue: setProfileValue,
  } = useForm<ProfileFormValues>({
    defaultValues: profileToFormValues(null),
    values: profileToFormValues(profileData ?? null),
    resolver: yupResolver(profileSchema),
  });

  const dialCode = watchProfile("dialCode");
  const phoneNumber = watchProfile("phone_number");
  const phoneValue = (dialCode ?? "") + (phoneNumber ?? "").replace(/\D/g, "");

  const handlePhoneChange = (value: string, country: { dialCode: string }) => {
    const code = String(country?.dialCode ?? DEFAULT_DIAL_CODE);
    setProfileValue("dialCode", code, { shouldValidate: true });
    setProfileValue("phone_number", value.slice(code.length) || "", { shouldValidate: true });
  };

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(changePasswordSchema),
  });

  const { isPending: isSavingProfile, mutate: mutateUpdateProfile } = useMutation({
    mutationFn: catchAsync(async (values: ProfileFormValues) => {
      if (!profileData?._id) {
        toastError("Profile not loaded.");
        return;
      }
      const res = await updateAdminProfileApi({
        _id: profileData._id,
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        dial_code: values.dialCode?.trim() || undefined,
        phone_number: (values.phone_number ?? "").replace(/\D/g, "").trim() || undefined,

      });
      if (checkResponse({ res, showSuccess: true })) {
        queryClient.invalidateQueries({ queryKey: defaultQueryKeys.profile });
      }
    }),
  });

  const { isPending: isSavingPassword, mutate: mutateChangePassword } = useMutation({
    mutationFn: catchAsync(async (data: ChangePasswordFormValues) => {
      const res = await changePasswordApi({ password: data.password });
      if (checkResponse({ res, showSuccess: true })) {
        resetPasswordForm();
      }
    }),
  });

  const handleSaveProfile = (values: ProfileFormValues) => {
    mutateUpdateProfile(values);
  };

  const handleSavePassword = (values: ChangePasswordFormValues) => {
    mutateChangePassword(values);
  };

  return (
    <>
      {/* Admin Profile & Password Management */}
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <h3 className="text-sm font-semibold m-0 mb-2.5">Admin Profile & Password</h3>
        <p className="text-xs text-rcn-muted m-0 mb-3.5">Update your profile information and manage your password settings.</p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="tab"
            size="sm"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          >
            Admin Profile
          </Button>
          <Button
            variant="tab"
            size="sm"
            active={activeTab === "password"}
            onClick={() => setActiveTab("password")}
          >
            Manage Password
          </Button>
        </div>

        <div className="h-px bg-rcn-border mb-4"></div>

        {/* Admin Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmitProfile(handleSaveProfile)} noValidate>
            {isLoadingProfile && (
              <p className="text-rcn-muted text-sm mb-3">Loading profile…</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted font-semibold">First Name <span className="text-red-500">*</span></label>
                <input
                  {...registerProfile("firstName")}
                  type="text"
                  placeholder="First name"
                  className={inputClass}
                  disabled={isLoadingProfile}
                />
                {profileErrors.firstName && (
                  <p className="text-red-500 text-xs mt-0.5">{profileErrors.firstName.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted font-semibold">Last Name <span className="text-red-500">*</span></label>
                <input
                  {...registerProfile("lastName")}
                  type="text"
                  placeholder="Last name"
                  className={inputClass}
                  disabled={isLoadingProfile}
                />
                {profileErrors.lastName && (
                  <p className="text-red-500 text-xs mt-0.5">{profileErrors.lastName.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted font-semibold">Email <span className="text-red-500">*</span></label>
                <input
                  {...registerProfile("email")}
                  type="email"
                  placeholder="email@example.com"
                  className={inputClass}
                  disabled={isLoadingProfile}
                />
                {profileErrors.email && (
                  <p className="text-red-500 text-xs mt-0.5">{profileErrors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted font-semibold">Phone</label>
                <PhoneInputField
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  hasError={!!profileErrors.phone_number}
                  inputProps={{ disabled: isLoadingProfile }}
                />
                {profileErrors.phone_number && (
                  <p className="text-red-500 text-xs mt-0.5">{profileErrors.phone_number.message}</p>
                )}
              </div>


            </div>

            <div className="border-t border-rcn-border my-4"></div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" disabled={isSavingProfile || isLoadingProfile}>
                {isSavingProfile ? "Saving…" : "Save Profile"}
              </Button>
            </div>
          </form>
        )}

        {/* Manage Password Tab */}
        {activeTab === "password" && (
          <form onSubmit={handleSubmitPassword(handleSavePassword)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex flex-col gap-1.5 mb-3 ">
                  <label className="text-xs text-rcn-muted font-semibold">New Password</label>
                  <div className="relative">
                    <input
                      {...registerPassword("password")}
                      type="password"
                      placeholder="Enter new password"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, newPassword: !showPassword.newPassword })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-rcn-muted hover:text-rcn-dark-text transition-colors cursor-pointer p-0 border-0 bg-transparent"
                      tabIndex={-1}
                    >
                      {!showPassword.newPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="pointer-events-none"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="pointer-events-none"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>

                  </div>
                  {passwordErrors.password && (
                    <p className="text-red-500 text-xs mt-0.5 mb-0">
                      {passwordErrors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="text-xs text-rcn-muted font-semibold">Confirm Password</label>
                  <div className="relative">
                    <input
                      {...registerPassword("confirmPassword")}
                      type="password"
                      placeholder="Re-enter new password"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, confirmPassword: !showPassword.newPassword })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-rcn-muted hover:text-rcn-dark-text transition-colors cursor-pointer p-0 border-0 bg-transparent"
                      tabIndex={-1}
                    >
                      {!showPassword.confirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="pointer-events-none"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="pointer-events-none"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-0.5 mb-0">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

              </div>
            </div>

            <div className="border-t border-rcn-border my-4"></div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" disabled={isSavingPassword}>
                {isSavingPassword ? "Saving..." : "Save Password Settings"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default Settings;
