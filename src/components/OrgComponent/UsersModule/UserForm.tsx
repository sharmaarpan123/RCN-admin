"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import {
  getOrganizationUserApi,
  createOrganizationUserApi,
  updateOrganizationUserApi,
} from "@/apis/ApiCalls";
import { Button, CustomNextLink, PhoneInputField } from "@/components";
import { UserBranchDepartmentAssign } from "./UserBranchDepartmentAssign";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { toastError, toastSuccess } from "@/utils/toast";

const DEFAULT_DIAL_CODE = "1";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30";

const userFormSchema = yup.object({
  firstName: yup.string().trim().required("First name is required."),
  lastName: yup.string().trim().required("Last name is required."),
  email: yup
    .string()
    .trim()
    .required("Email is required.")
    .email("Please enter a valid email."),
  dialCode: yup.string().trim().optional().default(DEFAULT_DIAL_CODE),
  phone_number: yup.string().trim().default(""),
  faxNumber: yup.string().trim().default(""),


  isActive: yup.boolean().default(true),
  notes: yup.string().trim().default(""),
  password: yup.string().default(""),
  confirmPassword: yup
    .string()
    .default("")
    .oneOf([yup.ref("password")], "Passwords must match."),
});

type UserFormValues = yup.InferType<typeof userFormSchema>;

export type BranchWithDepts = {
  _id: string;
  name: string;
  departments: { _id: string; name: string }[];
};

export type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  dialCode: string;
  phone_number: string;
  faxNumber: string;
  isActive: boolean;
  notes: string;
};

type UserFormProps = {
  mode: "add" | "edit";
  userId?: string;
  branches: BranchWithDepts[];
  onSave: () => void;
  onToggleActive?: () => void;
  onRemoveFromOrg?: () => void;
  onDelete?: () => void;
};



export function UserForm({
  mode,
  userId,
  branches: _branches,
  onSave
}: UserFormProps) {
  const isEdit = mode === "edit";



  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: [...defaultQueryKeys.user, userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await getOrganizationUserApi(userId);
      if (!checkResponse({ res })) return null;
      const raw = res.data as { data?: unknown };
      const data = raw?.data;
      if (Array.isArray(data) && data.length > 0) return data[0] as Record<string, unknown>;
      if (data && typeof data === "object") return data as Record<string, unknown>;
      return null;
    },
    enabled: !!userId,
  });






  const apiUser = userData && typeof userData === "object" ? (userData as Record<string, unknown>) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dialCode: DEFAULT_DIAL_CODE,
      phone_number: "",
      faxNumber: "",
      isActive: true,
      notes: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(userFormSchema),
    values: {
      firstName: (userData?.first_name as string) ?? "",
      lastName: (userData?.last_name as string) ?? "",
      email: (userData?.email as string) ?? "",
      dialCode: (userData?.dial_code as string) ?? DEFAULT_DIAL_CODE,
      phone_number: userData?.phone_number ? ((userData?.phone_number as string) ?? "").replace(/\D/g, "").trim() : "",
      faxNumber: (userData?.fax_number as string) ?? "",
      isActive: typeof userData?.is_active === "boolean" ? userData.is_active : (userData?.status !== undefined ? userData?.status === 1 : true),
      notes: (userData?.notes as string) ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const dialCode = watch("dialCode");
  const phoneNumber = watch("phone_number");
  const phoneValue = (dialCode ?? "") + (phoneNumber ?? "").replace(/\D/g, "");

  const handlePhoneChange = (value: string, country: { dialCode: string }) => {
    const code = String(country?.dialCode ?? DEFAULT_DIAL_CODE);
    setValue("dialCode", code, { shouldValidate: true });
    setValue("phone_number", value.slice(code.length) || "", { shouldValidate: true });
  };

  const { isPending, mutate } = useMutation({
    mutationFn: catchAsync(
      async (vars: {
        mode: "add" | "edit";
        userId?: string;
        payload: Record<string, unknown>;
      }) => {
        if (vars.mode === "add") {
          const res = await createOrganizationUserApi(vars.payload);
          if (checkResponse({ res, showSuccess: true })) {
            onSave();
          }
        } else if (vars.mode === "edit" && vars.userId) {
          const res = await updateOrganizationUserApi(vars.userId, vars.payload);
          if (checkResponse({ res, showSuccess: true })) {
            onSave();
          }
        }
      }
    ),
  });

  const onSubmit = (values: UserFormValues) => {
    if (mode === "add") {
      if (!(values.password && values.password.length >= 8)) {
        toastError("Password must be at least 8 characters.");
        return;
      }
      if (values.password !== values.confirmPassword) {
        toastError("Password and confirm password do not match.");
        return;
      }
    }
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim().toLowerCase();
    const dialCode = values.dialCode?.trim() || DEFAULT_DIAL_CODE;
    const phone_number = (values.phone_number ?? "").trim().replace(/\D/g, "");
    const faxNumber = (values.faxNumber ?? "").trim();
    const notes = (values.notes ?? "").trim();

    if (mode === "add") {
      mutate({
        mode: "add",
        payload: {
          first_name: firstName,
          last_name: lastName,
          email,
          dial_code: dialCode,
          password: values.password,
          phone_number: phone_number,
          fax_number: faxNumber || undefined,
          notes: notes || undefined,
        },
      });
    } else if (userId) {
      mutate({
        mode: "edit",
        userId,
        payload: {
          first_name: firstName,
          last_name: lastName,
          dial_code: dialCode,
          phone_number: phone_number,
          fax_number: faxNumber || undefined,
          notes: notes || undefined,
        },
      });
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  const handlePassword = () => {
    if (p1.length < 8) return;
    if (p1 !== p2) return;
    toastSuccess("Password reset prepared (demo).");
    setP1("");
    setP2("");
    setShowPassword(false);
  };

  const isLoading = isEdit && isLoadingUser;

  const initialBranchIds = useMemo(() => {
    const b = apiUser?.branches;
    if (!Array.isArray(b)) return [];
    return b.map((x: { _id?: string }) => x._id).filter(Boolean) as string[];
  }, [apiUser?.branches]);

  const initialDeptIds = useMemo(() => {
    const d = apiUser?.departments;
    if (!Array.isArray(d)) return [];
    return d.map((x: { _id?: string }) => x._id).filter(Boolean) as string[];
  }, [apiUser?.departments]);
  const canSubmit = !isEdit || (isEdit);

  return (
    <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold m-0">
              {isEdit ? "Edit User detail" : "Add User"}
            </h1>
            <p className="text-sm text-rcn-muted m-0 mt-1">
              {isEdit
                ? `${apiUser?.first_name} ${apiUser?.last_name}`
                : "Create a new user and assign branches & departments."}
            </p>
          </div>
        </div>

        {isEdit && canSubmit && (
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

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-xs text-rcn-muted mb-1">First Name</label>
              <input {...register("firstName")} placeholder="First" className={inputClass} disabled={isLoading} />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-0.5">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1">Last Name</label>
              <input {...register("lastName")} placeholder="Last" className={inputClass} disabled={isLoading} />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-0.5">{errors.lastName.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-rcn-muted mb-1">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="email@example.com"
                className={inputClass}
                readOnly={isEdit}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>
              )}
            </div>
            {!isEdit && (
              <>
                <div>
                  <label className="block text-xs text-rcn-muted mb-1">Password</label>
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="Min 8 characters"
                    className={inputClass}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-rcn-muted mb-1">Confirm Password</label>
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="Confirm password"
                    className={inputClass}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}
            <div>
              <label className="block text-xs text-rcn-muted mb-1">Phone number</label>
              <PhoneInputField
                value={phoneValue}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                hasError={!!errors.phone_number}
                inputProps={{ disabled: isLoading }}
              />
              {errors.phone_number && (
                <p className="text-red-500 text-xs mt-0.5">{errors.phone_number.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1">Fax number</label>
              <input {...register("faxNumber")} placeholder="0112233445" className={inputClass} disabled={isLoading} />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" {...register("isActive")} className="rounded border-rcn-border" disabled={isLoading} />
                <span className="text-sm">Active user</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-rcn-muted mb-1">Notes</label>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="Optional notes"
                className={`${inputClass} resize-y`}
                disabled={isLoading}
              />
            </div>
          </div>

          {isEdit && isLoadingUser && (
            <p className="text-rcn-muted text-sm mt-4">Loading user…</p>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-6 pt-6 border-rcn-border justify-between">
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="primary" size="sm" disabled={isPending || isLoading}>
                {isPending ? "Saving…" : "Save"}
              </Button>
              <CustomNextLink href="/org-portal/users" variant="secondary" size="sm">
                Cancel
              </CustomNextLink>
            </div>
          </div>

          {isEdit && userId && (
            <UserBranchDepartmentAssign
              key={apiUser ? `${userId}-loaded` : `${userId}-loading`}
              userId={userId}
              initialBranchIds={initialBranchIds}
              initialDeptIds={initialDeptIds}
              onSave={onSave}
              disabled={isLoading}
            />
          )}
        </form>
      </div>
    </div>
  );
}

