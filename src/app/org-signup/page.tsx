"use client";
import { organizationSignupApi } from "@/apis/ApiCalls";
import type { AddressResult } from "@/components";
import { Autocomplete, PhoneInputField } from "@/components";
import Button from "@/components/Button";
import CustomNextLink from "@/components/CustomNextLink";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";



const DEFAULT_DIAL_CODE = "1";

const orgSignupSchema = yup.object({
  name: yup.string().trim().required("Organization Name is required."),
  email: yup.string().trim().required("Organization Email is required.").email("Please enter a valid email."),
  password: yup.string().required("Password is required.").min(8, "Password must be at least 8 characters."),
  confirm_password: yup.string().required("Confirm password is required.").oneOf([yup.ref("password")], "Passwords must match."),
  dial_code: yup.string().trim().optional().default(DEFAULT_DIAL_CODE),
  phone_number: yup.string().trim().required("Organization Phone is required."),
  ein_number: yup.string().trim().optional().default(""),
  street: yup.string().trim().optional().default(""),
  suite: yup.string().trim().optional().default(""),
  latitude: yup.number().required("Please select an address."),
  longitude: yup.number().required("Please select an address."),
  city: yup.string().trim().optional().default(""),
  state: yup.string().trim().required("State is required."),
  country: yup.string().trim().optional().default("USA"),
  zip_code: yup.string().trim().required("Zip is required."),
  user_first_name: yup.string().trim().optional().default(""),
  user_last_name: yup.string().trim().optional().default(""),
  user_email: yup.string().trim().optional().default("").test("email", "Please enter a valid contact email.", (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)),
  user_dial_code: yup.string().trim().optional().default(DEFAULT_DIAL_CODE),
  user_phone_number: yup.string().trim().optional().default(""),
  user_fax_number: yup.string().trim().optional().default(""),
});

type OrgSignupFormValues = yup.InferType<typeof orgSignupSchema>;

const defaultValues: Omit<OrgSignupFormValues, "latitude" | "longitude"> & { latitude?: number | null; longitude?: number | null } = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
  dial_code: DEFAULT_DIAL_CODE,
  phone_number: "",
  ein_number: "",
  street: "",
  suite: "",
  latitude: null,
  longitude: null,
  city: "",
  state: "",
  country: "USA",
  zip_code: "",
  user_first_name: "",
  user_last_name: "",
  user_email: "",
  user_dial_code: DEFAULT_DIAL_CODE,
  user_phone_number: "",
  user_fax_number: "",
};

function buildPayload(data: OrgSignupFormValues): unknown {
  const s = (v: string | undefined) => (v ?? "").trim() || undefined;
  const digits = (v: string | undefined, max = 15) => (v ?? "").replace(/\D/g, "").slice(0, max) || undefined;
  return {
    name: data.name,
    email: data.email,
    password: data.password ?? "",
    dial_code: data.dial_code ?? DEFAULT_DIAL_CODE,
    phone_number: ((data.phone_number ?? "").replace(/\D/g, "").slice(0, 15)) || (data.phone_number ?? ""),
    ein_number: s(data.ein_number),
    street: s(data.street),
    suite: s(data.suite),
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    city: s(data.city),
    state: s(data.state),
    country: data.country ?? "USA",
    zip_code: data.zip_code ?? "",
    user_first_name: s(data.user_first_name),
    user_last_name: s(data.user_last_name),
    user_email: s(data.user_email),
    user_dial_code: data.user_dial_code ?? DEFAULT_DIAL_CODE,
    user_phone_number: digits(data.user_phone_number) ?? s(data.user_phone_number),
    user_fax_number: s(data.user_fax_number),
  };
}

const OrgSignup: React.FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrgSignupFormValues>({
    defaultValues: defaultValues as OrgSignupFormValues,
    resolver: yupResolver(orgSignupSchema),
  });

  const dialCode = watch("dial_code");
  const phoneNumber = watch("phone_number");
  const userDialCode = watch("user_dial_code");
  const userPhoneNumber = watch("user_phone_number");

  const orgPhoneValue = (dialCode ?? "") + (phoneNumber ?? "").replace(/\D/g, "");
  const userPhoneValue = (userDialCode ?? "") + (userPhoneNumber ?? "").replace(/\D/g, "");

  const handleOrgPhoneChange = (value: string, country: { dialCode: string }) => {
    const code = String(country?.dialCode ?? "1");
    setValue("dial_code", code, { shouldValidate: true });
    setValue("phone_number", value.slice(code.length) || "", { shouldValidate: true });
  };

  const handleUserPhoneChange = (value: string, country: { dialCode: string }) => {
    const code = String(country?.dialCode ?? "1");
    setValue("user_dial_code", code, { shouldValidate: true });
    setValue("user_phone_number", value.slice(code.length) || "", { shouldValidate: true });
  };

  const handleAddressSelect = (address: AddressResult) => {
    setValue("street", address.street, { shouldValidate: true });
    setValue("suite", address.suite, { shouldValidate: true });
    setValue("city", address.city, { shouldValidate: true });
    setValue("state", address.state, { shouldValidate: true });
    setValue("zip_code", address.zip_code, { shouldValidate: true });
    if (address.latitude) setValue("latitude", address.latitude, { shouldValidate: true });
    if (address.longitude) setValue("longitude", address.longitude, { shouldValidate: true });
  };

  const { isPending, mutate } = useMutation({
    mutationFn: catchAsync(async (payload: unknown) => {
      const res = await organizationSignupApi(payload);
      if (checkResponse({ res, showSuccess: true })) {
        router.push("/login");
      }
    }),
  });

  const onSubmit = (data: OrgSignupFormValues) => {
    mutate(buildPayload(data));
  };

  const inputBaseClass =
    "w-full px-3 py-2.5 rounded-xl border bg-white text-sm outline-none focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)] transition-all";
  const inputClass = (name: keyof OrgSignupFormValues) =>
    `${inputBaseClass} ${errors[name] ? "border-red-500" : "border-rcn-border focus:border-[#b9d7c5]"}`;
  const errorMsg = (name: keyof OrgSignupFormValues) =>
    errors[name]?.message ? <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p> : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 login-bg">
      <div className="max-w-[1200px] w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
          {/* Left Hero Section */}
          <div className="rounded-rcn-lg p-5 login-hero-gradient text-rcn-dark-text shadow-rcn min-h-[280px]">
            <div className="flex gap-3 items-center mb-4">
              <div className="w-10 h-10 rounded-xl relative shrink-0 overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
                <Image src="/logo.jpeg" alt="RCN Logo" fill className="object-cover" />
              </div>
              <div>
                <h2 className="text-lg font-semibold m-0 mb-2">Referral Coordination Network</h2>
                <p className="text-rcn-dark-text/85 text-sm m-0">
                  Register Your Organization
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Send and receive referrals securely</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Track referrals from request to completion</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Manage your organization profile and users</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Access the referral directory and coordination tools</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-rcn-dark-text/80 mb-3">
                Already have an account?
              </p>
              <CustomNextLink href="/login" variant="secondary" size="sm">
                Sign in instead
              </CustomNextLink>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold m-0 mb-3">Register Organization</h3>
            <p className="text-xs text-rcn-muted m-0 mb-4">
              Complete the form below to register your organization. Required fields are marked with an asterisk (*).
            </p>

            <form onSubmit={rhfHandleSubmit(onSubmit)}>
              {/* Organization Information */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-rcn-text mb-3 uppercase tracking-wide">Organization Information</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      Organization Name <span className="text-rcn-danger">*</span>
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      placeholder="e.g., Northlake Medical Center"
                      className={inputClass("name")}
                    />
                    {errorMsg("name")}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">
                        Phone <span className="text-rcn-danger">*</span>
                      </label>
                      <PhoneInputField
                        value={orgPhoneValue}
                        onChange={handleOrgPhoneChange}
                        hasError={!!errors.phone_number}
                        inputProps={{ required: true }}
                      />
                      {errorMsg("phone_number")}
                    </div>
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">
                        Email <span className="text-rcn-danger">*</span>
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="contact@organization.com"
                        className={inputClass("email")}
                      />
                      {errorMsg("email")}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">EIN (Optional)</label>
                    <input
                      {...register("ein_number")}
                      type="text"
                      placeholder="12-3456789"
                      className={inputClass("ein_number")}
                    />
                    {errorMsg("ein_number")}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">
                        Password <span className="text-rcn-danger">*</span>
                      </label>
                      <input
                        {...register("password")}
                        type="password"
                        placeholder="Min. 8 characters"
                        className={inputClass("password")}
                        autoComplete="new-password"
                      />
                      {errorMsg("password")}
                    </div>
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">
                        Confirm Password <span className="text-rcn-danger">*</span>
                      </label>
                      <input
                        {...register("confirm_password")}
                        type="password"
                        placeholder="Re-enter password"
                        className={inputClass("confirm_password")}
                        autoComplete="new-password"
                      />
                      {errorMsg("confirm_password")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-rcn-border my-4"></div>

              {/* Organization Address */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-rcn-text mb-3 uppercase tracking-wide">Organization Address</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">Search address</label>
                    <Autocomplete
                      onPlaceSelect={handleAddressSelect}
                      placeholder="Start typing an address..."
                      countryRestriction="us"
                      className="mb-1"
                    />
                    <p className="text-xs text-rcn-muted mt-0.5">Select a suggestion to fill the fields below.</p>
                    {errorMsg("street") || errorMsg("longitude")}
                  </div>
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">Street</label>
                    <input
                      {...register("street")}
                      type="text"
                      placeholder="123 Main Street"
                      className={inputClass("street")}
                    />
                    {errorMsg("street")}
                  </div>

                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">Apt/Suite</label>
                    <input
                      {...register("suite")}
                      type="text"
                      placeholder="Suite 100"
                      className={inputClass("suite")}
                    />
                    {errorMsg("suite")}
                  </div>



                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">City</label>
                      <input
                        {...register("city")}
                        type="text"
                        placeholder="City"
                        className={inputClass("city")}
                      />
                      {errorMsg("city")}
                    </div>
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">
                        State <span className="text-rcn-danger">*</span>
                      </label>
                      <input {...register("state")} type="text" placeholder="State" className={inputClass("state")} />
                      {errorMsg("state")}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      Zip <span className="text-rcn-danger">*</span>
                    </label>
                    <input
                      {...register("zip_code")}
                      type="text"
                      placeholder="12345 or 12345-6789"
                      className={inputClass("zip_code")}
                    />
                    {errorMsg("zip_code")}
                  </div>
                </div>
              </div>

              <div className="h-px bg-rcn-border my-4"></div>

              {/* Contact Person */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-rcn-text mb-3 uppercase tracking-wide">Contact Person</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">First Name</label>
                      <input
                        {...register("user_first_name")}
                        type="text"
                        placeholder="John"
                        className={inputClass("user_first_name")}
                      />
                      {errorMsg("user_first_name")}
                    </div>
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">Last Name</label>
                      <input
                        {...register("user_last_name")}
                        type="text"
                        placeholder="Doe"
                        className={inputClass("user_last_name")}
                      />
                      {errorMsg("user_last_name")}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">Email</label>
                    <input
                      {...register("user_email")}
                      type="email"
                      placeholder="contact@organization.com"
                      className={inputClass("user_email")}
                    />
                    {errorMsg("user_email")}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">Tel</label>
                      <PhoneInputField
                        value={userPhoneValue}
                        onChange={handleUserPhoneChange}
                        hasError={!!errors.user_phone_number}
                      />
                      {errorMsg("user_phone_number")}
                    </div>
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">Fax</label>
                      <input
                        {...register("user_fax_number")}
                        type="tel"
                        placeholder="(555) 123-4568"
                        className={inputClass("user_fax_number")}
                      />
                      {errorMsg("user_fax_number")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-rcn-border my-4"></div>

              {/* Submit Buttons */}
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <CustomNextLink href="/" variant="ghost" size="sm">
                  Cancel
                </CustomNextLink>
                <Button variant="primary" type="submit" disabled={isPending}>
                  {isPending ? "Registering…" : "Register Organization"}
                </Button>
              </div>
            </form>
          </div>
        </div>
        <p className="text-xs text-rcn-muted mt-3 text-center">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default OrgSignup;
