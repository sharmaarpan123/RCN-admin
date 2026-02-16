"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";

import { changePasswordApi } from "@/apis/ApiCalls";
import { Button } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastError, toastSuccess } from "@/utils/toast";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Mock current user
  const currentUser = {
    id: "u_sysadmin",
    email: "sysadmin@rcn.local",
    firstName: "System",
    lastName: "Admin",
    phone: "",
    notes: "",
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";

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

  const { isPending: isSavingPassword, mutate: mutateChangePassword } = useMutation({
    mutationFn: catchAsync(async (data: ChangePasswordFormValues) => {
      const res = await changePasswordApi({ password: data.password });
      if (checkResponse({ res, showSuccess: true })) {
        resetPasswordForm();
      }
    }),
  });

  const handleSaveProfile = () => {
    const firstName = (document.getElementById("admin_first") as HTMLInputElement)?.value.trim();
    const lastName = (document.getElementById("admin_last") as HTMLInputElement)?.value.trim();
    const email = (document.getElementById("admin_email") as HTMLInputElement)?.value.trim().toLowerCase();

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

    toastSuccess("Profile updated (will be persisted via API).");
  };

  const handleSavePassword = (values: ChangePasswordFormValues) => {
    mutateChangePassword(values);
  };

  return (
    <>
      {/* Admin Profile & Password Management */}
      {currentUser && (
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
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted font-semibold">First Name</label>
                  <input 
                    id="admin_first" 
                    type="text" 
                    defaultValue={currentUser.firstName || ''} 
                    className={inputClass} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted font-semibold">Last Name</label>
                  <input 
                    id="admin_last" 
                    type="text" 
                    defaultValue={currentUser.lastName || ''} 
                    className={inputClass} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted font-semibold">Email</label>
                  <input 
                    id="admin_email" 
                    type="email" 
                    defaultValue={currentUser.email || ''} 
                    className={inputClass} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted font-semibold">Phone</label>
                  <input 
                    id="admin_phone" 
                    type="tel" 
                    defaultValue={currentUser.phone || ''} 
                    className={inputClass} 
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

             

             

              <div className="border-t border-rcn-border my-4"></div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                  Save Profile
                </Button>
              </div>
            </div>
          )}

          {/* Manage Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handleSubmitPassword(handleSavePassword)} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="text-xs text-rcn-muted font-semibold">New Password</label>
                    <input 
                      {...registerPassword("password")}
                      type="password" 
                      placeholder="Enter new password" 
                      className={inputClass} 
                    />
                    {passwordErrors.password && (
                      <p className="text-red-500 text-xs mt-0.5 mb-0">
                        {passwordErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="text-xs text-rcn-muted font-semibold">Confirm Password</label>
                    <input 
                      {...registerPassword("confirmPassword")}
                      type="password" 
                      placeholder="Re-enter new password" 
                      className={inputClass} 
                    />
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
      )}

    </>
  );
};

export default Settings;
