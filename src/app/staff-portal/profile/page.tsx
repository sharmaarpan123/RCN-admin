"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toastSuccess } from "@/utils/toast";
import { getAuthProfileApi, putUserProfileApi, changePasswordApi } from "@/apis/ApiCalls";
import { checkResponse, catchAsync } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { Button, PhoneInputField } from "@/components";

/** API profile shape (snake_case from GET /api/auth/profile) */
interface ApiProfile {
  id?: string;
  _id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture?: string;
  /** Legacy: single phone string; prefer dial_code + phone_number */
  phone?: string;
  dial_code?: string;
  phone_number?: string;
  fax_number?: string;
  address?: string;
  role?: string;
  role_id?: number;
  notes?: string;
}

const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10";

const FAX_MAX_LENGTH = 30;

const profileSchema = yup.object({
  firstName: yup.string().trim().required("First name is required."),
  lastName: yup.string().trim().required("Last name is required."),
  email: yup
    .string()
    .trim()
    .required("Email is required.")
    .email("Please enter a valid email address."),
  address: yup.string().trim().optional().default(""),
  dial_code: yup.string().trim().optional().default("+1"),
  phone_number: yup.string().trim().optional().default(""),
  fax: yup
    .string()
    .trim()
    .optional()
    .default("")
    .max(FAX_MAX_LENGTH, `Fax cannot exceed ${FAX_MAX_LENGTH} characters.`),
  notes: yup.string().trim().optional().default(""),
  profilePicture: yup.string().trim().optional().default(""),
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

function getProfileDefaultValues(p: ApiProfile | null): ProfileFormValues | null {
  if (!p) return null;
  // API returns dial_code + phone_number; normalize dial_code to include "+"
  const rawDial = (p.dial_code ?? "").toString().replace(/\D/g, "");
  const dial_code = rawDial ? `+${rawDial}` : "+1";
  const phone_number =
    (p.phone_number ?? "").toString().replace(/\D/g, "") ||
    (p.phone ?? "").replace(/\D/g, "").replace(/^1(?=\d{10})/, ""); // fallback: strip leading 1 if 11 digits
  return {
    firstName: p.first_name ?? "",
    lastName: p.last_name ?? "",
    email: p.email ?? "",
    address: p.address ?? "",
    dial_code,
    phone_number,
    fax: p.fax_number ?? "",
    notes: p.notes ?? "",
    profilePicture: p.profile_picture ?? "",
  };
}

export default function StaffProfilePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [showPassword, setShowPassword] = useState({ newPassword: false, confirmPassword: false });

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

  const defaultProfileValues: ProfileFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    dial_code: "+1",
    phone_number: "",
    fax: "",
    notes: "",
    profilePicture: "",
  };

  const {
    register,
    handleSubmit: handleSubmitProfile,
    formState: { errors },
    reset: resetProfile,
    watch,
    setValue,
    getValues,
  } = useForm<ProfileFormValues>({
    defaultValues: defaultProfileValues,
    resolver: yupResolver(profileSchema),
  });

  useEffect(() => {
    const initial = getProfileDefaultValues(profileData ?? null);
    if (initial) resetProfile(initial);
  }, [profileData, resetProfile]);

  const dial_code = watch("dial_code") ?? "";
  const phone_number = watch("phone_number") ?? "";
  const phoneValue = (dial_code ?? "") + String(phone_number ?? "").replace(/\D/g, "");

  const handlePhoneChange = (value: string, country: { dialCode: string }) => {
    const codeDigits = String(country?.dialCode ?? "");
    const dial_code = codeDigits ? `+${codeDigits}` : "+1";
    setValue("dial_code", dial_code, { shouldValidate: true });
    setValue("phone_number", value.slice(codeDigits.length).replace(/\D/g, "") || "", { shouldValidate: true });
  };

  const { isPending: isSavePending, mutate: saveProfile } = useMutation({
    mutationFn: catchAsync(async () => {
      const values = getValues();
      const first_name = values.firstName.trim();
      const last_name = values.lastName.trim();
      const email = values.email.trim().toLowerCase();
      const phone = `${values.dial_code ?? ""}${(values.phone_number ?? "").replace(/\D/g, "")}`.trim() || undefined;
      const body: Parameters<typeof putUserProfileApi>[0] = {
        first_name,
        last_name,
        email: email || undefined,
        phone,
        fax: (values.fax ?? "").trim() || undefined,
        address: values.address.trim() || undefined,
        notes: values.notes.trim() || undefined,
      };
      if (values.profilePicture) body.profile_picture = values.profilePicture;
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
        <form
          onSubmit={handleSubmitProfile(() => saveProfile())}
          className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-xs font-black text-rcn-muted mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                {...register("firstName")}
                className={INPUT_CLASS}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1 m-0" role="alert">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-xs font-black text-rcn-muted mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                {...register("lastName")}
                className={INPUT_CLASS}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1 m-0" role="alert">{errors.lastName.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-xs font-black text-rcn-muted mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={INPUT_CLASS}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1 m-0" role="alert">{errors.email.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-xs font-black text-rcn-muted mb-1.5">
                Address
              </label>
              <input
                id="address"
                type="text"
                {...register("address")}
                className={INPUT_CLASS}
                placeholder="Enter address"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-xs font-black text-rcn-muted mb-1.5">
                Phone Number
              </label>
              <PhoneInputField
                value={phoneValue}
                onChange={handlePhoneChange}
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
                {...register("fax")}
                className={INPUT_CLASS}
                placeholder="(312) 555-0199"
                maxLength={FAX_MAX_LENGTH}
              />
              {errors.fax && (
                <p className="text-red-600 text-xs mt-1 m-0" role="alert">{errors.fax.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-xs font-black text-rcn-muted mb-1.5">
                Notes
              </label>
              <textarea
                id="notes"
                {...register("notes")}
                rows={4}
                className={`${INPUT_CLASS} resize-none`}
                placeholder="Additional notes or information"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavePending}
            >
              {isSavePending ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </form>
      )}

      {activeTab === "password" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6">
          <h2 className="text-lg font-semibold m-0 mb-4">Change password</h2>
         <form onSubmit={handleSubmitPassword((data) => changePassword(data))} className="max-w-md space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-black text-rcn-muted mb-1.5">
                New password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword.newPassword ? "text" : "password"}
                  {...registerPassword("password")}
                  className={INPUT_CLASS}
                  placeholder="Enter new password"
                  autoComplete="new-password"
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
                <p className="text-red-600 text-xs mt-1 m-0" role="alert">{passwordErrors.password.message}</p>
              )}
            </div>
            <div >
              <label htmlFor="confirmPassword" className="block text-xs font-black text-rcn-muted mb-1.5">
                Confirm new password <span className="text-red-500">*</span>
              </label>
              <div className="relative">

                <input
                  id="confirmPassword"
                  type={showPassword.confirmPassword ? "text" : "password"}
                  {...registerPassword("confirmPassword")}
                  className={INPUT_CLASS}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirmPassword: !showPassword.confirmPassword })}
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
