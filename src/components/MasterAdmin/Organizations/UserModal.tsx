"use client";

import { Button, Modal, PhoneInputField } from "@/components";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { INPUT_CLASS } from "./types";
import { checkResponse } from "@/utils/commonFunc";
import { getOrganizationUserApi } from "@/apis/ApiCalls";
import { useQuery } from "@tanstack/react-query";
import defaultQueryKeys from "@/utils/adminQueryKeys";

/** Form shape matches API user detail (use as-is, no shaping). */
const userModalSchema = yup.object({
  first_name: yup.string().trim().required("First name is required."),
  last_name: yup.string().trim().required("Last name is required."),
  email: yup
    .string()
    .trim()
    .required("Email is required.")
    .email("Please enter a valid email."),
  dial_code: yup.string().trim().optional().default(""),
  phone_number: yup.string().trim().optional().default(""),
  fax_number: yup.string().trim().optional().default(""),

  organization_id: yup.string().trim().optional().default(""),
  status: yup.number().oneOf([0, 1]).required().default(1),
  notes: yup.string().trim().optional().default(""),

});

export type UserModalFormValues = yup.InferType<typeof userModalSchema>;

/** API user detail response (same shape as form). */
type ApiUserDetail = {
  _id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  dial_code?: string;
  phone_number?: string;
  fax_number?: string;
  organization_id?: string;
  status?: number;
  notes?: string;
  [key: string]: unknown;
};

interface UserModalContentProps {
  targetOrgId: string;
  presetOrgId?: string;
  isOpen: boolean;
  userId?: string | null;
  mode: "edit" | "create";
  onClose: () => void;
  onSave: (data: UserModalFormValues) => void;
  isPending: boolean;
}

const defaultValues: UserModalFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  dial_code: "",
  phone_number: "",
  fax_number: "",

  organization_id: "",
  status: 1,
  notes: "",

};

export function UserModalContent({
  userId,
  mode,
  isOpen,
  targetOrgId,
  onClose,
  onSave,
  isPending,
}: UserModalContentProps) {

  const { data: apiUser, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.organizationUser, userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await getOrganizationUserApi(userId);
      if (!checkResponse({ res })) return null;
      const data = (res.data as { data?: ApiUserDetail[] })?.data;
      return Array.isArray(data) && data[0] ? (data[0] as ApiUserDetail) : null;
    },
    enabled: !!userId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserModalFormValues>({
    defaultValues,
    resolver: yupResolver(userModalSchema),
    values: apiUser ? { ...defaultValues, ...apiUser } : { ...defaultValues, organization_id: targetOrgId },
  });

  const dialCode = watch("dial_code");
  const phoneNumber = watch("phone_number");
  const phoneValue = (dialCode ?? "") + (phoneNumber ?? "").replace(/\D/g, "");

  const handlePhoneChange = (value: string, country: { dialCode: string }) => {
    const code = String(country?.dialCode ?? "1");
    setValue("dial_code", code, { shouldValidate: true });
    setValue("phone_number", value.slice(code.length) || "", { shouldValidate: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold m-0">
            {mode === "edit" ? "Edit" : "New"} User
          </h3>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="h-px bg-rcn-border my-4"></div>

        <form
          onSubmit={handleSubmit(onSave)}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">
                  First Name
                </label>
                <input
                  {...register("first_name")}
                  className={INPUT_CLASS}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-rcn-muted block mb-1.5">
                  Last Name
                </label>
                <input
                  {...register("last_name")}
                  className={INPUT_CLASS}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                className={INPUT_CLASS}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">Phone (optional)</label>
              <PhoneInputField
                value={phoneValue}
                onChange={handlePhoneChange}
                hasError={!!errors.phone_number}
                placeholder="(optional)"
              />
              {errors.phone_number && (
                <p className="text-xs text-red-600 mt-1">{errors.phone_number.message}</p>
              )}
            </div>
            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">
                Fax (optional)
              </label>
              <input
                {...register("fax_number")}
                placeholder="(optional)"
                className={INPUT_CLASS}
              />
            </div>


          </div>

          <div>

            <div className="mb-3">
              <label className="text-xs text-rcn-muted block mb-1.5">
                Active user status
              </label>
              <select
                {...register("status", { setValueAs: (v) => Number(v) })}
                className={INPUT_CLASS}
              >
                <option value={1}>Active</option>
                <option value={0}>Disabled</option>
              </select>
            </div>


            <div className="mb-0">
              <label className="text-xs text-rcn-muted block mb-1.5">
                Notes (optional)
              </label>
              <textarea
                {...register("notes")}
                placeholder="Optional notes..."
                className={INPUT_CLASS}
                rows={3}
              />
            </div>
          </div>

          <div className="col-span-2 h-px bg-rcn-border my-4"></div>

          <div className="col-span-2 flex justify-between items-center">
            <div className="text-xs text-rcn-muted">Changes apply immediately.</div>
            <div className="flex gap-2">
              <Button variant="primary" type="submit" disabled={isPending || isLoading}>
                {isPending ? "Saving…" : isLoading ? "Loading..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
