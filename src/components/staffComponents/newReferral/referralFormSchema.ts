"use client";

import * as yup from "yup";
import type { ReceiverRow } from "./types";

/** Matches backend insuranceItemSchema: all optional. */
const insuranceItemSchema = yup.object({
  payer: yup.string().trim().optional().default(""),
  policy: yup.string().trim().optional().default(""),
  plan_group: yup.string().trim().optional().default(""),
  document: yup.string().trim().optional().default(""),
});

/** One guest organization (optional array; when an item exists, all fields required). */
export const guestOrganizationItemSchema = yup.object({
  company_name: yup.string().trim().required("Company name is required"),
  email: yup.string().trim().required("Email is required").email("Valid email is required"),
  phone_number: yup.string().default("").test("phone-number-length", "Invalid phone number", (value) => !value || value.length >= 7),
  dial_code: yup.string().trim().optional().default(""),
  fax_number: yup.string().trim().default("").test("fax-number-length", "Fax number cannot exceed 10 characters", (value) => !value || value.length <= 10),
  address: yup.string().trim().optional().default(""),
  state: yup.string().trim().required("State is required"),
});

export type GuestOrganizationFormValues = yup.InferType<typeof guestOrganizationItemSchema>;

/** Form values use API payload keys (snake_case). Aligned with backend createOrUpdateReferralSchema (all optional). receiver_rows is UI-only for building department_ids on submit. */
export const referralFormSchema = yup.object({
  sender_name: yup.string().trim().optional().default(""),
  facility_name: yup.string().trim().optional().default(""),
  facility_address: yup.string().trim().optional().default(""),
  sender_email: yup.string().trim().optional().default(""),
  sender_phone_number: yup.string().trim().optional().default(""),
  sender_fax_number: yup.string().trim().optional().default(""),
  sender_dial_code: yup.string().trim().optional().default("+1"),
  receiver_rows: yup
    .array()
    .of(
      yup.object({
        organizationId: yup.string().required(),
        organizationName: yup.string().required(),
        branchId: yup
          .string()
          .nullable()
          .default(null)
          .test(
            "branch-required",
            "Branch is required for each receiver.",
            function (v) {
              const orgId = this.parent?.organizationId as string | undefined;
              if (orgId?.startsWith("custom-")) return true;
              return v != null && v !== "";
            }
          ),
        branchName: yup.string().nullable().default(null),
        selectedDepartments: yup
          .array()
          .of(
            yup.object({
              value: yup.string().required(),
              label: yup.string().required(),
            })
          )
          .default([])
          .test(
            "departments-required",
            "Select at least one department for this receiver.",
            function (selectedDepartments) {
              const parent = this.parent as { organizationId?: string; branchId?: string | null };
              if (parent?.organizationId?.startsWith("custom-")) return true;
              if (!parent?.branchId) return true;
              return Array.isArray(selectedDepartments) && selectedDepartments.length > 0;
            }
          ),
      })
    )
    .default([])
    .test(
      "receiver-departments",
      "Select at least one receiver with branch and department(s), or add a receiver from the list above.",
      function (rows) {
        const root = this.parent as { guest_organizations?: unknown[] };
        const hasGuestOrgs = Array.isArray(root?.guest_organizations) && root.guest_organizations.length > 0;
        if (hasGuestOrgs) return true;
        if (!rows?.length) return false;
        const hasDepartment = rows.some(
          (r) =>
            Array.isArray(r?.selectedDepartments) &&
            r.selectedDepartments.length > 0
        );
        return hasDepartment;
      }
    ),
  speciality_ids: yup
    .array()
    .of(yup.string().min(1))
    .default([])
    .when("additional_speciality", ([additional_speciality], schema) => {
      console.log(additional_speciality, "additional_speciality")
      const hasAdditional =
        Array.isArray(additional_speciality) &&
        additional_speciality.some((val) => val && val?.trim() !== "");

      return hasAdditional
        ? schema.notRequired()
        : schema
          .min(
            1,
            "Select at least one requested service, or describe other services below."
          )
          .required();
    }),

  additional_speciality: yup.array().of(yup.string().trim().default("")).optional().default([]),
  additional_notes: yup.string().trim().optional().default(""),
  patient_first_name: yup.string().trim().required("First name is required"),
  patient_last_name: yup.string().trim().required("Last name is required"),
  dob: yup
    .string()
    .trim()
    .required("DOB is required")
    .test(
      "dob-not-future",
      "Date of birth cannot be greater than today",
      (value) => {
        if (!value) return true;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return true;
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date.getTime() <= today.getTime();
      }
    ),
  gender: yup.string().trim().required("Gender is required"),
  address_of_care: yup.string().trim().required("Address of care is required"),
  patient_insurance_information: yup
    .array()
    .of(insuranceItemSchema)
    .default([{ payer: "", policy: "", plan_group: "", document: "" }])
    .test(
      "primary-insurance",
      "Primary insurance: Payer, Policy #, and Plan/Group are required.",
      (items) => {
        const first = items?.[0];
        if (!first) return true;
        return (
          Boolean(first.payer?.trim()) &&
          Boolean(first.policy?.trim()) &&
          Boolean(first.plan_group?.trim())
        );
      }
    ),
  patient_phone_number: yup.string().trim().required("Patient phone number is required"),
  patient_dial_code: yup.string().trim().optional().default("+1"),
  primary_language: yup.string().trim().optional().default(""),
  social_security_number: yup
    .string()
    .trim()
    .optional()
    .default("")
    .test(
      "ssn-length",
      "Incomplete Social Security Number",
      (value) => !value || value.length === 11
    ),
  power_of_attorney: yup.string().trim().optional().default(""),
  other_information: yup.string().trim().optional().default(""),
  face_sheet: yup.string().trim().optional().default(""),
  medication_list: yup.string().trim().optional().default(""),
  discharge_summary: yup.string().trim().optional().default(""),
  wound_photos: yup.array().of(yup.string().trim()).optional().default([]),
  signed_order: yup.string().trim().optional().default(""),
  history_or_physical: yup.string().trim().optional().default(""),
  progress_notes: yup.string().trim().optional().default(""),
  other_documents: yup.array().of(yup.string().trim()).optional().default([]),
  primary_care_name: yup.string().trim().optional().default(""),
  primary_care_address: yup.string().trim().optional().default(""),
  primary_care_phone_number: yup.string().trim().optional().default(""),
  primary_care_dial_code: yup.string().trim().optional().default("+1"),
  primary_care_fax: yup.string().trim().optional().default("").max(10, "Fax number cannot exceed 10 characters"),
  primary_care_email: yup.string().trim().optional().default(""),
  primary_care_npi: yup.string().trim().optional().default(""),
  guest_organizations: yup
    .array()
    .of(guestOrganizationItemSchema)
    .optional()
    .default([]),
});

export type ReferralFormValues = yup.InferType<typeof referralFormSchema>;

/** Map ReceiverRow (camelCase) to API department_ids (flattens all selected departments across rows). */
export function getDepartmentIdsFromReceiverRows(rows: ReceiverRow[]): string[] {
  return rows.flatMap((r) => (r.selectedDepartments ?? []).map((d) => d.value)).filter((id): id is string => id != null && id !== "");
}
