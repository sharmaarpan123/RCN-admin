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
  phone_number: yup.string().trim().required("Phone number is required"),
  dial_code: yup.string().trim().optional().default("+1"),
  fax_number: yup.string().trim().required("Fax number is required").max(15, "Fax number cannot exceed 15 characters"),
  address: yup.string().trim().required("Address is required"),
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
        departmentId: yup
          .string()
          .nullable()
          .default(null)
          .test(
            "department-required",
            "Department is required for each receiver.",
            function (v) {
              const orgId = this.parent?.organizationId as string | undefined;
              if (orgId?.startsWith("custom-")) return true;
              return v != null && v !== "";
            }
          ),
        departmentName: yup.string().nullable().default(null),
      })
    )
    .default([])
    .test(
      "receiver-departments",
      "Select at least one receiver with branch and department, or add a receiver from the list above.",
      (rows) => {
        if (!rows?.length) return false;
        const hasDepartment = rows.some(
          (r) => r?.departmentId != null && String(r.departmentId).trim() !== ""
        );
        return hasDepartment;
      }
    ),
  speciality_ids: yup
    .array()
    .of(yup.string().min(1))
    .default([])
    .test(
      "at-least-one-service",
      "Select at least one requested service, or describe other services below.",
      (ids) => Array.isArray(ids) && ids.length > 0
    ),
  additional_speciality: yup.array().of(yup.string().trim().default("")).optional().default([]),
  additional_notes: yup.string().trim().optional().default(""),
  patient_first_name: yup.string().trim().required("First name is required"),
  patient_last_name: yup.string().trim().required("Last name is required"),
  dob: yup.string().trim().required("DOB is required"),
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
  social_security_number: yup.string().trim().optional().default(""),
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
  primary_care_fax: yup.string().trim().optional().default("").max(15 , "Fax number cannot exceed 15 characters"),
  primary_care_email: yup.string().trim().optional().default(""),
  primary_care_npi: yup.string().trim().optional().default(""),
  guest_organizations: yup
    .array()
    .of(guestOrganizationItemSchema)
    .optional()
    .default([]),
});

export type ReferralFormValues = yup.InferType<typeof referralFormSchema>;

/** Map ReceiverRow (camelCase) to API department_ids. */
export function getDepartmentIdsFromReceiverRows(rows: ReceiverRow[]): string[] {
  return rows.map((r) => r.departmentId).filter((id): id is string => id != null && id !== "");
}
