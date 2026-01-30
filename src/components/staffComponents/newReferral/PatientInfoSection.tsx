"use client";

import React from "react";
import { SectionHeader } from "./SectionHeader";

interface PatientInfoSectionProps {
  lastName: string;
  setLastName: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  dob: string;
  setDob: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  addressOfCare: string;
  setAddressOfCare: (v: string) => void;
}

export function PatientInfoSection({
  lastName,
  setLastName,
  firstName,
  setFirstName,
  dob,
  setDob,
  gender,
  setGender,
  addressOfCare,
  setAddressOfCare,
}: PatientInfoSectionProps) {
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
            Last Name <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            First Name <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            DOB <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Gender <span className="text-rcn-danger font-black">*</span>
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          >
            <option value="" disabled>
              Select
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Address of Care <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="text"
            value={addressOfCare}
            onChange={(e) => setAddressOfCare(e.target.value)}
            placeholder="Street, City, State, ZIP"
            required
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
      </div>
    </section>
  );
}
