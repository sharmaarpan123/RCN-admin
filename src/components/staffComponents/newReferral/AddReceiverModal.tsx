"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { Modal, Button, PhoneInputField, CustomReactSelect } from "@/components";
import type { GuestOrganization, OrgBranchDeptOption } from "./types";
import {
  guestOrganizationItemSchema,
  type GuestOrganizationFormValues,
} from "./referralFormSchema";
import { getStatesApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultAdminQueryKeys from "@/utils/adminQueryKeys";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

const inputErrorClass =
  "w-full px-3 py-2.5 rounded-xl border border-red-500 bg-white outline-none text-sm font-normal focus:border-red-500 focus:ring-2 focus:ring-red-500/12";

interface AddReceiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (guest: GuestOrganization) => void;
  defaultState?: string;
}

const defaultFormValues: GuestOrganizationFormValues = {
  company_name: "",
  email: "",
  phone_number: "",
  dial_code: "+1",
  fax_number: "",
  address: "",
  state: "",
};

export function AddReceiverModal({
  isOpen,
  onClose,
  onAdd,
  defaultState = "",
}: AddReceiverModalProps) {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestOrganizationFormValues>({
    resolver: yupResolver(guestOrganizationItemSchema),
    defaultValues: {
      ...defaultFormValues,
      state: defaultState === "ALL" ? "" : defaultState,
    },
  });

  const { data: stateOptionsFromApi = [] } = useQuery({
    queryKey: [...defaultAdminQueryKeys.statesList],
    queryFn: async () => {
      const res = await getStatesApi();
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      const list = Array.isArray(data) ? data : [];
      return list
        .map((item: { name?: string; abbreviation?: string }) => {
          const value = item.abbreviation;
          const label = item.name;
          return value != null && label != null
            ? { value: String(value), label: String(label) }
            : null;
        })
        .filter((x): x is OrgBranchDeptOption => x != null);
    },
  });

  const stateSelectOptions = stateOptionsFromApi;

  useEffect(() => {
    if (isOpen) {
      reset({
        ...defaultFormValues,
        state: defaultState === "ALL" ? "" : defaultState,
      });
    }
  }, [isOpen, defaultState, reset]);

  const handleClose = () => {
    reset(defaultFormValues);
    onClose();
  };

  const dial_code = watch("dial_code") ?? "";
  const phone_number = watch("phone_number") ?? "";
  const phoneValue = dial_code + String(phone_number).replace(/\D/g, "");

  const handlePhoneChange = (value: string, country: { dialCode: string }) => {
    const code = country?.dialCode ?? "+1";
    setValue("dial_code", code, { shouldValidate: true });
    setValue(
      "phone_number",
      value.slice(code.length).replace(/\D/g, "") || "",
      { shouldValidate: true }
    );
  };

  const onSubmit = (values: GuestOrganizationFormValues) => {
    onAdd({
      company_name: values.company_name.trim(),
      email: values.email.trim(),
      phone_number: values.phone_number.trim(),
      dial_code: values.dial_code || "+1",
      fax_number: values.fax_number.trim(),
      address: values.address.trim(),
      state: values.state.trim(),
    });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="760px">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <h3 id="receiverModalTitle" className="m-0 text-lg font-semibold">
            Add Referral Receiver (if not listed)
          </h3>
          <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">
            All fields are required for guest organizations.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClose}
          aria-label="Close"
        >
          ✕
        </Button>
      </div>

      <form noValidate className="max-w-[760px] ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              Company Name <span className="text-rcn-danger font-black">*</span>
            </label>
            <input
              type="text"
              {...register("company_name")}
              placeholder="Company name"
              className={errors.company_name ? inputErrorClass : inputClass}
            />
            {errors.company_name && (
              <p className="text-xs text-red-600 mt-1 m-0" role="alert">
                {errors.company_name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              Email <span className="text-rcn-danger font-black">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="email@example.com"
              className={errors.email ? inputErrorClass : inputClass}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 m-0" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              Phone Number <span className="text-rcn-danger font-black">*</span>
            </label>
            <PhoneInputField
              value={phoneValue}
              onChange={handlePhoneChange}
              placeholder="Phone number"
            />
            {errors.phone_number && (
              <p className="text-xs text-red-600 mt-1 m-0" role="alert">
                {errors.phone_number.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              State (business location) <span className="text-rcn-danger font-black">*</span>
            </label>

            <CustomReactSelect options={stateSelectOptions} value={watch("state")} onChange={(value) => setValue("state", value)} />
            {errors.state && (
              <p className="text-xs text-red-600 mt-1 m-0" role="alert">
                {errors.state.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              Fax Number <span className="text-rcn-danger font-black">*</span>
            </label>
            <input
              type="tel"
              {...register("fax_number")}
              placeholder="(xxx) xxx-xxxx"
              className={errors.fax_number ? inputErrorClass : inputClass}
            />
            {errors.fax_number && (
              <p className="text-xs text-red-600 mt-1 m-0" role="alert">
                {errors.fax_number.message}
              </p>
            )}
          </div>
          <div className="">
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              Address <span className="text-rcn-danger font-black">*</span>
            </label>
            <input
              type="text"
              {...register("address")}
              placeholder="Street, City, State, ZIP"
              className={errors.address ? inputErrorClass : inputClass}
            />
            {errors.address && (
              <p className="text-xs text-red-600 mt-1 m-0" role="alert">
                {errors.address.message}
              </p>
            )}
          </div>

        </div>

        <div className="flex gap-2.5 justify-end mt-4">
          <Button type="button" variant="secondary" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit(onSubmit)} variant="primary" size="md">
            Add receiver
          </Button>
        </div>
      </form>
    </Modal>
  );
}
