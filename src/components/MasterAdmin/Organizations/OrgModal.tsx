"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminOrganizationApi,
  getAdminOrganizationApi,
  getStatesApi,
  updateAdminOrganizationApi,
} from "@/apis/ApiCalls";
import { Button, PhoneInputField, Autocomplete, Modal } from "@/components";
import CustomReactSelect from "@/components/CustomReactSelect";
import type { AddressResult } from "@/components";
import type { RcnSelectOption } from "@/components/CustomReactSelect";
import { catchAsync, checkResponse, isValidEmail } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/adminQueryKeys";

const DEFAULT_DIAL_CODE = "1";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30";

/** Form shape aligned with organization-settings: nested address and contact. */
type OrgFormValues = {
  name: string;
  email: string;
  phone: string;
  ein_number: string;
  password: string;
  enabled: "false" | "true";
  address: {
    street: string;
    suite: string;
    city: string;
    state: string;
    zip_code: string;
    latitude: number | null;
    longitude: number | null;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    tel: string;
    fax: string;
  };
};

const addressSchema = {
  street: yup.string().trim().optional().default(""),
  suite: yup.string().trim().optional().default(""),
  city: yup.string().trim().optional().default(""),
  state: yup.string().trim().required("State is required."),
  zip_code: yup.string().trim().required("Zip is required."),
  latitude: yup.number().nullable().optional(),
  longitude: yup.number().nullable().optional(),
};

const createSchema = yup.object({
  name: yup.string().trim().required("Organization Name is required."),
  email: yup.string().optional().default(""),
  phone: yup.string().trim().required("Organization Phone is required."),
  ein_number: yup.string().trim().optional().default(""),
  password: yup
    .string()
    .required("Password is required.")
    .min(8, "Password must be at least 8 characters."),
  enabled: yup.string().optional().default("true"),
  address: yup.object({
    ...addressSchema,
    latitude: yup.number().nullable().required("Please select an address."),
    longitude: yup.number().nullable().required("Please select an address."),
  }),
  contact: yup.object({
    firstName: yup.string().trim().optional().default(""),
    lastName: yup.string().trim().optional().default(""),
    email: yup
      .string()
      .trim()
      .optional()
      .default("")
      .test(
        "email",
        "Please enter a valid contact email.",
        (v) => !v || isValidEmail((v ?? "") as string),
      ),
    tel: yup.string().trim().optional().default(""),
    fax: yup.string().trim().optional().default(""),
  }),
}) as yup.ObjectSchema<OrgFormValues>;

const updateSchema = yup.object({
  name: yup.string().trim().required("Organization Name is required."),
  email: yup
    .string()
    .trim()
    .required("Organization Email is required.")
    .email("Please enter a valid email."),
  phone: yup.string().trim().required("Organization Phone is required."),
  ein_number: yup.string().trim().optional().default(""),
  password: yup.string().optional(),
  enabled: yup.string().optional().default("true"),
  address: yup.object(addressSchema),
  contact: yup.object({
    firstName: yup.string().trim().optional().default(""),
    lastName: yup.string().trim().optional().default(""),
    email: yup
      .string()
      .trim()
      .optional()
      .default("")
      .test(
        "email",
        "Please enter a valid contact email.",
        (v) => !v || isValidEmail((v ?? "") as string),
      ),
    tel: yup.string().trim().optional().default(""),
    fax: yup.string().trim().optional().default(""),
  }),
}) as yup.ObjectSchema<OrgFormValues>;

const defaultAddress = {
  street: "",
  suite: "",
  city: "",
  state: "",
  zip_code: "",
  latitude: null as number | null,
  longitude: null as number | null,
};

const defaultContact = {
  firstName: "",
  lastName: "",
  email: "",
  tel: "",
  fax: "",
};

const defaultCreateValues: OrgFormValues = {
  name: "",
  email: "",
  phone: "",
  ein_number: "",
  password: "",
  enabled: "true",
  address: { ...defaultAddress },
  contact: { ...defaultContact },
};

/** Parse full phone string (from PhoneInputField) to dial_code + number for API. */
function parsePhone(phone: string): { dial_code: string; number: string } {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length >= 11 && digits.startsWith("1")) {
    return { dial_code: "1", number: digits.slice(1) };
  }
  if (digits.length >= 10) {
    return { dial_code: "1", number: digits.slice(-10) };
  }
  return { dial_code: DEFAULT_DIAL_CODE, number: digits };
}

function buildCreatePayload(data: OrgFormValues): unknown {
  const s = (v: string | undefined) => (v ?? "").trim() || undefined;
  const orgPhone = parsePhone(data.phone ?? "");
  const contactPhone = parsePhone(data.contact?.tel ?? "");
  return {
    name: data.name,
    email: data?.contact?.email,
    password: data.password ?? "",
    dial_code: orgPhone.dial_code,
    phone_number:
      (data.phone ?? "").replace(/\D/g, "").slice(0, 15) || orgPhone.number,
    ein_number: s(data.ein_number),
    street: s(data.address?.street),
    suite: s(data.address?.suite),
    latitude: data.address?.latitude ?? 0,
    longitude: data.address?.longitude ?? 0,
    city: s(data.address?.city),
    state: data.address?.state ?? "",
    country: "USA",
    zip_code: data.address?.zip_code ?? "",
    user_first_name: s(data.contact?.firstName),
    user_last_name: s(data.contact?.lastName),
    user_email: s(data.contact?.email),
    user_dial_code: contactPhone.dial_code,
    user_phone_number:
      (data.contact?.tel ?? "").replace(/\D/g, "").slice(0, 15) ||
      contactPhone.number,
    user_fax_number: s(data.contact?.fax),
  };
}

function buildUpdatePayload(data: OrgFormValues): unknown {
  const s = (v: string | undefined) => (v ?? "").trim() || undefined;
  const orgPhone = parsePhone(data.phone ?? "");
  const contactPhone = parsePhone(data.contact?.tel ?? "");
  const payload: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    dial_code: orgPhone.dial_code,
    phone_number:
      (data.phone ?? "").replace(/\D/g, "").slice(0, 15) || orgPhone.number,
    ein_number: s(data.ein_number),
    street: s(data.address?.street),
    suite: s(data.address?.suite),
    city: s(data.address?.city),
    state: data.address?.state ?? "",
    country: "USA",
    zip_code: data.address?.zip_code ?? "",
    user_first_name: s(data.contact?.firstName),
    user_last_name: s(data.contact?.lastName),
    user_email: s(data.contact?.email),
    user_dial_code: contactPhone.dial_code,
    user_phone_number:
      (data.contact?.tel ?? "").replace(/\D/g, "").slice(0, 15) ||
      contactPhone.number,
    user_fax_number: s(data.contact?.fax),
    status:
      data.enabled === "true" ? 1 : 2,
  };
  if (data.address?.latitude != null && data.address?.longitude != null) {
    payload.latitude = data.address.latitude;
    payload.longitude = data.address.longitude;
  }
  return payload;
}

export type OrgModalOrg = {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  ein?: string;
  enabled?: "false" | "true";
  status?: number;
  address?: {
    street?: string;
    suite?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  contact?: {
    first?: string;
    last?: string;
    email?: string;
    tel?: string;
    fax?: string;
  };
};

export interface OrgModalContentProps {
  isOpen: boolean;
  orgId?: string;
  onClose: () => void;
  onDelete?: () => void;
}

/** Map GET /api/admin/organization/:id response to OrgModalOrg. */
function mapApiResponseToOrgModalOrg(
  raw: Record<string, unknown>,
): OrgModalOrg {
  console.log(raw, "raw")
  const str = (v: unknown) => (v ?? "").toString().trim();
  const org = (raw.organization ?? raw) as Record<string, unknown>;
  const contact = raw.organization
    ? (raw as {
      first_name?: unknown;
      last_name?: unknown;
      email?: unknown;
      dial_code?: unknown;
      phone_number?: unknown;
      fax_number?: unknown;
    })
    : null;
  const phone =
    [org.dial_code, org.phone_number]
      .filter(Boolean)
      .map(String)
      .join(" ")
      .trim() || str(org.phone_number);
  const contactTel = contact
    ? [contact.dial_code, contact.phone_number]
      .filter(Boolean)
      .map(String)
      .join(" ")
      .trim() || str(contact.phone_number)
    : "";
  return {
    _id: str(org._id),
    name: str(org.name),
    email: str(org.email),
    phone: phone || str(org.phone),
    ein: str(org.ein_number ?? org.ein),
    enabled: raw.status == 1 ? "true" : "false",
    address: {
      street: str(org.street),
      suite: str(org.suite ?? org.apt),
      city: str(org.city),
      state: str(org.state),
      zip: str(org.zip_code ?? org.zip),
    },
    contact: {
      first: contact ? str(contact.first_name) : "",
      last: contact ? str(contact.last_name) : "",
      email: contact ? str(contact.email) : "",
      tel: contactTel,
      fax: contact ? str((contact as { fax_number?: unknown }).fax_number) : "",
    },
  };
}

function orgToFormValues(org: OrgModalOrg | null): OrgFormValues {
  if (!org) return defaultCreateValues;
  return {
    name: org.name ?? "",
    email: org.email ?? "",
    phone: org.phone ?? "",
    ein_number: org.ein ?? "",
    password: "",
    enabled: org.enabled ?? "true",
    address: {
      street: org.address?.street ?? "",
      suite: org.address?.suite ?? "",
      city: org.address?.city ?? "",
      state: org.address?.state ?? "",
      zip_code: org.address?.zip ?? "",
      latitude: null,
      longitude: null,
    },
    contact: {
      firstName: org.contact?.first ?? "",
      lastName: org.contact?.last ?? "",
      email: org.contact?.email ?? "",
      tel: org.contact?.tel ?? "",
      fax: org.contact?.fax ?? "",
    },
  };
}

export function OrgModalContent({
  orgId,
  isOpen,
  onClose,

  onDelete,
}: OrgModalContentProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(orgId);
  const [showPassword, setShowPassword] = useState<{ password: boolean }>({ password: false });

  // api is not working, so we are using the org from the props till it is fixed
  const {
    data: orgResponse,
    isLoading: orgLoading,
    error: orgError
  } = useQuery({
    queryKey: [...defaultQueryKeys.organizationDetail, orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const res = await getAdminOrganizationApi(orgId);
      if (!checkResponse({ res })) return null;
      const payload = res.data;
      const raw = payload?.data ?? res.data;
      return raw as OrgModalOrg;
    },

    enabled: isEdit && !!orgId,
  });




  const fetchedOrg = useMemo((): OrgModalOrg | null => {
    if (!isEdit || !orgResponse) return null;
    return mapApiResponseToOrgModalOrg(orgResponse);
  }, [isEdit, orgResponse]);

  const formValues = useMemo(
    () => (isEdit ? orgToFormValues(fetchedOrg) : defaultCreateValues),
    [isEdit, fetchedOrg, isOpen],
  );

  console.log(fetchedOrg, orgResponse, "formValues")



  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrgFormValues>({
    defaultValues: formValues,
    mode: "onChange",
    resolver: yupResolver(isEdit ? updateSchema : createSchema),
    values: formValues,
  });

  const handleAddressSelect = (address: AddressResult) => {
    setValue("address.street", address.formatted_address, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("address.suite", address.suite, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("address.city", address.city, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("address.zip_code", address.zip_code, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (address.latitude != null) {
      setValue("address.latitude", address.latitude, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.longitude != null) {
      setValue("address.longitude", address.longitude, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: catchAsync(async (payload: unknown) => {
      const res = await createAdminOrganizationApi(payload);
      if (checkResponse({ res, showSuccess: true })) {
        queryClient.invalidateQueries({
          queryKey: [...defaultQueryKeys.organizationsList],
        });
        onClose();
      }
    }),
  });

  const updateMutation = useMutation({
    mutationFn: catchAsync(
      async (vars: { organizationId: string; payload: unknown }) => {
        const res = await updateAdminOrganizationApi(
          vars.organizationId,
          vars.payload,
        );
        if (checkResponse({ res, showSuccess: true })) {
          queryClient.invalidateQueries({
            queryKey: [...defaultQueryKeys.organizationsList],
          });
          onClose();
        }
      },
    ),
  });

  const onSubmit = (data: OrgFormValues) => {
    if (isEdit && orgId) {
      updateMutation.mutate({
        organizationId: orgResponse?._id ?? "",
        payload: buildUpdatePayload(data),
      });
    } else {
      createMutation.mutate(buildCreatePayload(data));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const inputCn = (hasError?: boolean) =>
    `${inputClass} ${hasError ? "border-red-500" : ""}`.trim();

  const { data: stateOptions = [] } = useQuery({
    queryKey: [...defaultQueryKeys.statesList],
    queryFn: async () => {
      const res = await getStatesApi();
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      const list = Array.isArray(data) ? data : [];
      return list
        .map((item: { name?: string; abbreviation?: string }) => {
          const value = item.name;
          const label = item.name;
          return value != null && label != null
            ? { value: String(value), label: String(label) }
            : null;
        })
        .filter((x): x is RcnSelectOption => x != null);
    },
  });
  console.log(watch("enabled"), "enabled")

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isEdit && orgLoading && (
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-4 text-sm text-rcn-muted">
          Loading organization…
        </div>
      )}
      {isEdit && orgError && (
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-4 text-sm text-red-600">
          Failed to load organization. Please try again.
        </div>
      )}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold m-0">
            {isEdit ? "Edit" : "New"} Organization
          </h3>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="h-px bg-rcn-border my-4" />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <div className="mb-4">
                <label className="text-xs text-rcn-muted block mb-1.5">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className={inputCn(!!errors.name)}
                  placeholder="e.g. Northlake Medical Center"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1 m-0">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="text-xs text-rcn-muted block mb-1.5">
                  Organization Phone <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInputField
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      country="us"
                      placeholder="(312) 555-0100"
                      hasError={!!errors.phone}
                      inputProps={{ required: true }}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1 m-0">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="text-xs text-rcn-muted block mb-1.5">
                  Organization EIN (Optional)
                </label>
                <input
                  {...register("ein_number")}
                  className={inputCn(!!errors.ein_number)}
                  placeholder="12-3456789"
                />
              </div>
              {isEdit && (
                <div className="mb-4">
                  <label className="text-xs text-rcn-muted block mb-1.5">
                    Enabled
                  </label>
                  <select
                    {...register("enabled")}
                    className={inputCn(false)}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              )}
              {!isEdit && (
                <div className="mb-4">
                  <label className="text-xs text-rcn-muted block mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">

                    <input
                      {...register("password")}
                      type={showPassword.password ? "text" : "password"}
                      className={inputCn(!!errors.password)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => ({ ...prev, password: !prev.password }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-rcn-muted hover:text-rcn-dark-text transition-colors cursor-pointer p-0 border-0 bg-transparent"
                      tabIndex={-1}
                    >
                      {!showPassword.password ? (<svg
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
                  {errors.password && (
                      <p className="text-xs text-red-500 mt-1 m-0">
                        {errors.password.message}
                      </p>
                    )}
                </div>
              )}
            </div>

            <div className="col-span-1">
              <div className="bg-white border border-rcn-border rounded-2xl p-4 mb-4">
                <h3 className="text-sm font-semibold m-0 mb-3">
                  Organization Address
                </h3>

                <div className="mb-3">
                  <label className="text-xs text-rcn-muted block mb-1.5">
                    Street
                  </label>
                  <Autocomplete
                    onPlaceSelect={handleAddressSelect}
                    placeholder="Start typing an address..."
                    countryRestriction="us"
                    className="mb-1"
                    value={watch("address.street")}
                    onChange={(value) => setValue("address.street", value)}
                  />
                  <p className="text-xs text-rcn-muted mt-0.5 m-0">
                    Select a suggestion to fill the fields below.
                  </p>
                  {(errors.address?.latitude ?? errors.address?.longitude) && (
                    <p className="text-xs text-red-500 mt-1 m-0">
                      {errors.address?.latitude?.message ??
                        errors.address?.longitude?.message}
                    </p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="text-xs text-rcn-muted block mb-1.5">
                    Apt/Suite
                  </label>
                  <Controller
                    name="address.suite"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value ?? ""}
                        className={inputCn(false)}
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      City
                    </label>
                    <Controller
                      name="address.city"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          value={field.value ?? ""}
                          className={inputCn(!!errors.address?.city)}
                        />
                      )}
                    />
                    {errors.address?.city && (
                      <p className="text-xs text-red-500 mt-1 m-0">
                        {errors.address.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="address.state"
                      control={control}
                      render={({ field }) => (
                        <CustomReactSelect
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(value ?? "")}
                          options={stateOptions}
                          placeholder="Select state..."
                          aria-label="State"
                          isClearable
                          maxMenuHeight={280}
                          controlClassName={
                            errors.address?.state
                              ? "!border-red-500"
                              : undefined
                          }
                        />
                      )}
                    />
                    {errors.address?.state && (
                      <p className="text-xs text-red-500 mt-1 m-0">
                        {errors.address.state.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-0">
                  <label className="text-xs text-rcn-muted block mb-1.5">
                    Zip <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="address.zip_code"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value ?? ""}
                        className={inputCn(!!errors.address?.zip_code)}
                      />
                    )}
                  />
                  {errors.address?.zip_code && (
                    <p className="text-xs text-red-500 mt-1 m-0">
                      {errors.address.zip_code.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-rcn-border rounded-2xl p-4">
                <h3 className="text-sm font-semibold m-0 mb-3">
                  Organization Contact Person
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      First Name
                    </label>
                    <input
                      {...register("contact.firstName")}
                      className={inputCn(!!errors.contact?.firstName)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      Last Name
                    </label>
                    <input
                      {...register("contact.lastName")}
                      className={inputCn(!!errors.contact?.lastName)}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-rcn-muted block mb-1.5">
                    Email
                  </label>
                  <input
                    {...register("contact.email")}
                    type="email"
                    className={inputCn(!!errors.contact?.email)}
                  />
                  {errors.contact?.email && (
                    <p className="text-xs text-red-500 mt-1 m-0">
                      {errors.contact.email.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-0">
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      Telephone
                    </label>
                    <Controller
                      name="contact.tel"
                      control={control}
                      render={({ field }) => (
                        <PhoneInputField
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          country="us"
                          placeholder="(312) 555-0102"
                          hasError={!!errors.contact?.tel}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      Fax
                    </label>
                    <input
                      {...register("contact.fax")}
                      className={inputCn(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-rcn-border my-4" />

          <div className="flex justify-between items-center">
            <div className="text-xs text-rcn-muted">
              {isEdit
                ? "Changes apply immediately to dropdown searches and inboxes."
                : "Create a new organization for sender/receiver selection."}
            </div>
            <div className="flex gap-2">
              {isEdit && onDelete && (
                <Button type="button" variant="danger" onClick={onDelete}>
                  Delete
                </Button>
              )}
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
