"use client";

import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { SectionHeader } from "./SectionHeader";
import type { ReferralFormValues } from "./referralFormSchema";

export function PatientInfoSection() {
  const { errors } = useFormState<ReferralFormValues>();
  const { register } = useFormContext<ReferralFormValues>();

  const patient_first_name = useWatch({ name: "patient_first_name" });
  const patient_last_name = useWatch({ name: "patient_last_name" });
  const dob = useWatch({ name: "dob" });
  const gender = useWatch({ name: "gender" });
  const address_of_care = useWatch({ name: "address_of_care" });

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

  return (
    <section
      id="patient-info"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Patient Information"
        subtitle="Required demographics and address of care"
        badge="Required fields"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            First Name <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="text"
            {...register("patient_first_name")}
            className={inputClass}
            value={patient_first_name}
          />
          {errors.patient_first_name && (
            <p className="text-xs text-rcn-danger mt-1 m-0">{errors.patient_first_name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Last Name <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="text"
            {...register("patient_last_name")}
            className={inputClass}
            value={patient_last_name}
          />
          {errors.patient_last_name && (
            <p className="text-xs text-rcn-danger mt-1 m-0">{errors.patient_last_name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            DOB <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="date"
            {...register("dob")}
            className={inputClass}
            value={dob}
          />
          {errors.dob && (
            <p className="text-xs text-rcn-danger mt-1 m-0">{errors.dob.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Gender <span className="text-rcn-danger font-black">*</span>
          </label>
          <select {...register("gender")} className={inputClass} value={gender}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && (
            <p className="text-xs text-rcn-danger mt-1 m-0">{errors.gender.message}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Address of Care <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="text"
            {...register("address_of_care")}
            placeholder="Street, City, State, ZIP"
            className={inputClass}
            value={address_of_care}
          />
          {errors.address_of_care && (
            <p className="text-xs text-rcn-danger mt-1 m-0">{errors.address_of_care.message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
