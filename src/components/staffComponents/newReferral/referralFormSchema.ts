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
          .test("required", "Branch is required for each receiver.", (v) => v != null && v !== ""),
        branchName: yup.string().nullable().default(null),
        departmentId: yup
          .string()
          .nullable()
          .default(null)
          .test("required", "Department is required for each receiver.", (v) => v != null && v !== ""),
        departmentName: yup.string().nullable().default(null),
      })
    )
    .default([]),
  speciality_ids: yup.array().of(yup.string().min(1)).optional().default([]),
  additional_speciality: yup.string().trim().optional().default(""),
  additional_notes: yup.string().trim().optional().default(""),
  patient_first_name: yup.string().trim().optional().default(""),
  patient_last_name: yup.string().trim().optional().default(""),
  dob: yup.string().trim().optional().default(""),
  gender: yup.string().trim().optional().default(""),
  address_of_care: yup.string().trim().optional().default(""),
  patient_insurance_information: yup
    .array()
    .of(insuranceItemSchema)
    .optional() 
    .default([{ payer: "", policy: "", plan_group: "", document: "" }]),
  patient_phone_number: yup.string().trim().optional().default(""),
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
  primary_care_fax: yup.string().trim().optional().default(""),
  primary_care_email: yup.string().trim().optional().default(""),
  primary_care_npi: yup.string().trim().optional().default(""),
});

export type ReferralFormValues = yup.InferType<typeof referralFormSchema>;

/** Map ReceiverRow (camelCase) to API department_ids. */
export function getDepartmentIdsFromReceiverRows(rows: ReceiverRow[]): string[] {
  return rows.map((r) => r.departmentId).filter((id): id is string => id != null && id !== "");
}
