"use client";

import { getAuthProfileApi } from "@/apis/ApiCalls";
import type { AddressResult } from "@/components";
import { Autocomplete, Button, PhoneInputField } from "@/components";
import { checkResponse, isValidEmail } from "@/utils/commonFunc";
import { toastSuccess } from "@/utils/toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import type { AuthProfileData } from "../types/profile";

/** Organization address (form + API shape for this page). */
export interface OrgAddress {
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
}

/** Organization contact person (form shape for this page). */
export interface OrgContact {
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
  fax: string;
}

/** Organization (form + mapped profile shape for this page). */
export interface Org {
  id: string;
  name: string;
  phone: string;
  email: string;
  ein: string;
  address: OrgAddress;
  contact: OrgContact;
}

const DEF_ADDR: OrgAddress = { street: "", apt: "", city: "", state: "", zip: "" };
const DEF_CONTACT: OrgContact = { firstName: "", lastName: "", email: "", tel: "", fax: "" };

const orgSettingsSchema = yup.object({
  name: yup.string().trim().default(""),
  phone: yup.string().trim().required("Organization Phone is required."),
  email: yup
    .string()
    .trim()
    .required("Organization Email is required.")
    .email("Please enter a valid Organization Email."),
  ein: yup.string().trim().default(""),
  address: yup.object({
    street: yup.string().trim().required("Street is required."),
    apt: yup.string().trim().default(""),
    city: yup.string().trim().required("City is required."),
    state: yup.string().trim().required("State is required."),
    zip: yup
      .string()
      .trim()
      .required("Zip is required."),
    lat: yup.number().required("Please select an address from the suggested dropdown."),
    lng: yup.number().required("Please select an address from the suggested dropdown."),
  }),
  contact: yup.object({
    firstName: yup.string().trim().default(""),
    lastName: yup.string().trim().default(""),
    email: yup
      .string()
      .trim()
      .default("")
      .test("email", "Please enter a valid Contact Person Email (or leave blank).", (v) => !v || isValidEmail(v)),
    tel: yup.string().trim().default(""),
    fax: yup.string().trim().default(""),
  }),
});

type OrgSettingsFormValues = yup.InferType<typeof orgSettingsSchema>;

const DEFAULT_ORG: Org = {
  id: "",
  name: "",
  phone: "",
  email: "",
  ein: "",
  address: { ...DEF_ADDR },
  contact: { ...DEF_CONTACT },
};

/** Maps GET /api/auth/profile response (data = user + organization) to Org shape. */
function mapProfileToOrg(payload: AuthProfileData | null | undefined): Org {
  if (!payload?.organization) return DEFAULT_ORG;
  const org = payload.organization;
  const user = payload;
  const str = (v: unknown) => ((v ?? "") as string).toString().trim();
  const coords = org.location?.coordinates;
  const lat = coords != null && coords[1] != null ? Number(coords[1]) : null;
  const lng = coords != null && coords[0] != null ? Number(coords[0]) : null;
  const orgPhone = [org.dial_code, org.phone_number].filter(Boolean).map(String).join(" ").trim() || str(org.phone_number);

  return {
    id: str(org._id),
    name: str(org.name),
    phone: orgPhone,
    email: str(org.email),
    ein: str(org.ein_number),
    address: {
      street: str(org.street),
      apt: str(org.apt ?? org.suite),
      city: str(org.city),
      state: str(org.state),
      zip: str(org.zip_code),
      lat: lat ?? undefined,
      lng: lng ?? undefined,
    },
    contact: {
      firstName: str(user.first_name),
      lastName: str(user.last_name),
      email: str(user.email),
      tel: [user.dial_code, user.phone_number].filter(Boolean).map(String).join(" ").trim() || str(user.phone_number),
      fax: str(user.fax_number),
    },
  };
}

export default function OrgPortalOrganizationSettingsPage() {
  const { data: profileResponse, isLoading: profileLoading } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      const res = await getAuthProfileApi();
      if (!checkResponse({ res })) return null;
      return res.data;
    },
  });

  const profileData: AuthProfileData | undefined =
    profileResponse?.data ?? (profileResponse as unknown as AuthProfileData | undefined);
  const initialOrg = useMemo(() => mapProfileToOrg(profileData), [profileData]);
  const formKey = profileData != null ? "profile-loaded" : "profile-loading";

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold m-0">Organization Settings</h1>
        <p className="text-sm text-rcn-muted m-0 mt-0.5">Manage profile of your organization.</p>
      </div>
      <OrganizationSettingsForm key={formKey} initialOrg={initialOrg} profileLoading={profileLoading} />
    </div>
  );
}

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30";

function orgToFormValues(org: Org): OrgSettingsFormValues {
  return {
    name: org.name ?? "",
    phone: org.phone ?? "",
    email: org.email ?? "",
    ein: org.ein ?? "",
    address: {
      street: org.address?.street ?? "",
      apt: org.address?.apt ?? "",
      city: org.address?.city ?? "",
      state: org.address?.state ?? "",
      zip: org.address?.zip ?? "",
      lat: org.address?.lat ? Number(org.address.lat) : 0,
      lng: org.address?.lng ? Number(org.address.lng) : 0,
    },
    contact: {
      firstName: org.contact?.firstName ?? "",
      lastName: org.contact?.lastName ?? "",
      email: org.contact?.email ?? "",
      tel: org.contact?.tel ?? "",
      fax: org.contact?.fax ?? "",
    },
  };
}

function OrganizationSettingsForm({
  initialOrg,
  profileLoading,
}: {
  initialOrg: Org;
  profileLoading: boolean;
}) {
  const formValues = useMemo(() => orgToFormValues(initialOrg), [initialOrg]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm<OrgSettingsFormValues>({
    defaultValues: formValues,

    resolver: yupResolver(orgSettingsSchema),
    values: formValues,
  });

  const handleAddressSelect = (address: AddressResult) => {
    setValue("address.street", address.formatted_address, { shouldValidate: true, shouldDirty: true });
    setValue("address.city", address.city, { shouldValidate: true, shouldDirty: true });
    setValue("address.state", address.state, { shouldValidate: true, shouldDirty: true });
    setValue("address.zip", address.zip_code, { shouldValidate: true, shouldDirty: true });
    setValue("address.lat", address.latitude ? Number(address.latitude) : 0, { shouldValidate: true, shouldDirty: true });
    setValue("address.lng", address.longitude ? Number(address.longitude) : 0, { shouldValidate: true, shouldDirty: true });
  };



  const onSubmit = (values: OrgSettingsFormValues) => {
    const updatedOrg: Org = {
      ...initialOrg,
      name: (values.name || "").trim() || "Main Organization",
      phone: (values.phone ?? "").trim(),
      email: (values.email ?? "").trim(),
      ein: (values.ein ?? "").trim(),
      address: {
        street: (values.address?.street ?? "").trim(),
        apt: (values.address?.apt ?? "").trim(),
        city: (values.address?.city ?? "").trim(),
        state: (values.address?.state ?? "").trim(),
        zip: (values.address?.zip ?? "").trim(),
      },
      contact: {
        firstName: (values.contact?.firstName ?? "").trim(),
        lastName: (values.contact?.lastName ?? "").trim(),
        email: (values.contact?.email ?? "").trim(),
        tel: (values.contact?.tel ?? "").trim(),
        fax: (values.contact?.fax ?? "").trim(),
      },
    };
    reset(orgToFormValues(updatedOrg));
    toastSuccess("Need api !");
  };

  return (
    <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
      <div className="px-4 py-3 border-b border-rcn-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-sm m-0">Organization Profile</h3>
          <p className="text-xs text-rcn-muted m-0 mt-0.5">Update required organization profile details and optional contacts.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="p-4 space-y-4">
          {profileLoading && (
            <p className="text-sm text-rcn-muted m-0">Loading organization profile…</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Organization Name</label>
              <input {...register("name")} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Organization EIN (Optional)</label>
              <input {...register("ein")} placeholder="e.g., 12-3456789" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Organization Phone <span className="text-rcn-danger">*</span></label>
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
                  />
                )}
              />
              {errors.phone && <p className="text-xs text-rcn-danger mt-1 m-0">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Organization Email <span className="text-rcn-danger">*</span></label>
              <input {...register("email")} type="email" placeholder="e.g., admin@organization.com" className={inputClass} />
              {errors.email && <p className="text-xs text-rcn-danger mt-1 m-0">{errors.email.message}</p>}
            </div>
          </div>

          <div className="border-t border-rcn-border pt-3">
            <h4 className="font-bold text-sm m-0 mb-2">Organization Address <span className="text-rcn-danger">*</span></h4>
            <div className="mb-3">
              <label className="block text-xs text-rcn-muted mb-1.5">Search address</label>
              <Autocomplete
                onPlaceSelect={handleAddressSelect}
                placeholder="Start typing an address..."
                countryRestriction="us"
                inputClassName={inputClass}
                hasError={!!(errors.address?.street ?? errors.address?.city ?? errors.address?.state ?? errors.address?.zip)}
              />
              <p className="text-xs text-rcn-muted mt-0.5 m-0">Select a suggestion to fill the fields below.</p>
              {errors?.address?.lat && <p className="text-xs text-rcn-danger mt-1 m-0">{errors?.address?.lat?.message}</p>}

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Street <span className="text-rcn-danger">*</span></label>
                <Controller
                  name="address.street"
                  control={control}
                  render={({ field }) => (
                    <input {...field} value={field.value ?? ""} placeholder="e.g., 123 Main St" className={inputClass} />
                  )}
                />
                {errors.address?.street && <p className="text-xs text-rcn-danger mt-1 m-0">{errors.address.street.message}</p>}
              </div>

              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">City <span className="text-rcn-danger">*</span></label>
                <Controller
                  name="address.city"
                  control={control}
                  render={({ field }) => (
                    <input {...field} value={field.value ?? ""} placeholder="e.g., Chicago" className={inputClass} />
                  )}
                />
                {errors.address?.city && <p className="text-xs text-rcn-danger mt-1 m-0">{errors.address.city.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">State <span className="text-rcn-danger">*</span></label>
                <Controller
                  name="address.state"
                  control={control}
                  render={({ field }) => (
                    <input {...field} value={field.value ?? ""} placeholder="e.g., Chicago" className={inputClass} />
                  )}
                />
                {errors.address?.state && <p className="text-xs text-rcn-danger mt-1 m-0">{errors.address.state.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Zip <span className="text-rcn-danger">*</span></label>
                <Controller
                  name="address.zip"
                  control={control}
                  render={({ field }) => (
                    <input {...field} value={field.value ?? ""} placeholder="e.g., 60601" inputMode="numeric" className={inputClass} />
                  )}
                />
                {errors.address?.zip && <p className="text-xs text-rcn-danger mt-1 m-0">{errors.address.zip.message}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-rcn-border pt-3">
            <h4 className="font-bold text-sm m-0 mb-2">Organization Contact Person</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Last Name</label>
                <input {...register("contact.lastName")} placeholder="e.g., Smith" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">First Name</label>
                <input {...register("contact.firstName")} placeholder="e.g., Jane" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Email</label>
                <input {...register("contact.email")} type="email" placeholder="e.g., jane.smith@organization.com" className={inputClass} />
                {errors.contact?.email && <p className="text-xs text-rcn-danger mt-1 m-0">{errors.contact.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Tel</label>
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
              <div className="md:col-span-2">
                <label className="block text-xs text-rcn-muted mb-1.5">Fax</label>
                <input {...register("contact.fax")} type="tel" placeholder="e.g., (312) 555-0199" className={inputClass} />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-end">
          <Button type="submit" variant="primary" size="sm" className="w-full sm:w-auto shrink-0">Save Organization</Button>
        </div>
      </form>
    </div>
  );
}
