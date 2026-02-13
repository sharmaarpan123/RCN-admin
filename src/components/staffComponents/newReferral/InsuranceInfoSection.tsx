"use client";

import React from "react";
import { useFormContext, useFieldArray, useFormState } from "react-hook-form";
import { SectionHeader } from "./SectionHeader";
import type { ReferralFormValues } from "./referralFormSchema";
import { Button } from "@/components";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

export function InsuranceInfoSection() {
  const { register, control } = useFormContext<ReferralFormValues>();
  const { errors } = useFormState<ReferralFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "patient_insurance_information",
  });

  const insuranceRootError =
    errors.patient_insurance_information &&
    typeof errors.patient_insurance_information === "object" &&
    "message" in errors.patient_insurance_information
      ? (errors.patient_insurance_information as { message?: string }).message
      : undefined;

  return (
    <section
      id="insurance-info"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Patient Insurance Information"
        subtitle="Primary required; additional insurance optional"
        badge="Documents optional"
      />

      {insuranceRootError && (
        <div
          className="border border-red-300 bg-red-50 rounded-[14px] p-3 mb-3 text-sm text-red-800"
          role="alert"
        >
          {insuranceRootError}
        </div>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border border-dashed border-rcn-border bg-[#fbfdfb] rounded-[14px] p-3 mb-3"
        >
          <div className="flex items-center justify-between gap-2.5 mb-2.5">
            <strong className="text-xs font-black">
              {index === 0
                ? "Primary Insurance (Required)"
                : `Additional Insurance (Optional) #${index}`}
            </strong>
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-extrabold"
              >
                Remove
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
                Payer {index === 0 && <span className="text-rcn-danger font-black">*</span>}
              </label>
              <input
                type="text"
                {...register(`patient_insurance_information.${index}.payer`)}
                placeholder="e.g., BCBS, Aetna, Medicare"
                className={`${inputClass} ${errors.patient_insurance_information?.[index]?.payer ? "border-red-400" : ""}`}
                aria-invalid={!!errors.patient_insurance_information?.[index]?.payer}
              />
              {errors.patient_insurance_information?.[index]?.payer && (
                <p className="text-xs text-rcn-danger mt-1 m-0">
                  {errors.patient_insurance_information[index]?.payer?.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
                Policy # {index === 0 && <span className="text-rcn-danger font-black">*</span>}
              </label>
              <input
                type="text"
                {...register(`patient_insurance_information.${index}.policy`)}
                placeholder="Policy / Member ID"
                className={`${inputClass} ${errors.patient_insurance_information?.[index]?.policy ? "border-red-400" : ""}`}
                aria-invalid={!!errors.patient_insurance_information?.[index]?.policy}
              />
              {errors.patient_insurance_information?.[index]?.policy && (
                <p className="text-xs text-rcn-danger mt-1 m-0">
                  {errors.patient_insurance_information[index]?.policy?.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
                Plan/Group {index === 0 && <span className="text-rcn-danger font-black">*</span>}
              </label>
              <input
                type="text"
                {...register(`patient_insurance_information.${index}.plan_group`)}
                placeholder="Plan / Group"
                className={`${inputClass} ${errors.patient_insurance_information?.[index]?.plan_group ? "border-red-400" : ""}`}
                aria-invalid={!!errors.patient_insurance_information?.[index]?.plan_group}
              />
              {errors.patient_insurance_information?.[index]?.plan_group && (
                <p className="text-xs text-rcn-danger mt-1 m-0">
                  {errors.patient_insurance_information[index]?.plan_group?.message}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-rcn-muted mt-2.5">Document URL (optional).</p>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5 mt-2.5">
            Document URL
          </label>
          <input
            type="text"
            {...register(`patient_insurance_information.${index}.document`)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={() => append({ payer: "", policy: "", plan_group: "", document: "" })}
        className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-[14px] mt-3"
      >
        <span className="w-6.5 h-6.5 rounded-xl bg-white/18 flex items-center justify-center text-base">
          ＋
        </span>
        Add Another Additional Insurance (Optional)
      </Button>
      <p className="text-xs text-rcn-muted text-center mt-1.5">
        Add another insurance payer (optional).
      </p>
    </section>
  );
}
