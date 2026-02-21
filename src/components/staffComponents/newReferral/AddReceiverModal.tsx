"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal, Button, PhoneInputField } from "@/components";
import { toastError } from "@/utils/toast";
import type { GuestOrganization, OrgBranchDeptOption } from "./types";
import { getStatesApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultAdminQueryKeys from "@/utils/adminQueryKeys";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

interface AddReceiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (guest: GuestOrganization) => void;
  
}

export function AddReceiverModal({
  isOpen,
  onClose,
  onAdd,
 
}: AddReceiverModalProps) {
  const [company_name, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [dial_code, setDialCode] = useState("+1");
  const [phone_number, setPhoneNumber] = useState("");
  const [fax_number, setFaxNumber] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState(() =>
    ""
  );

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

  const handleClose = () => {
    setCompanyName("");
    setEmail("");
    setDialCode("+1");
    setPhoneNumber("");
    setFaxNumber("");
    setAddress("");
    onClose();
  };

  const phoneValue =
    (dial_code ?? "") + (phone_number ?? "").replace(/\D/g, "");

  const handlePhoneChange = (value: string, country: { dialCode: string }) => {
    const code = country?.dialCode ?? "+1";
    setDialCode(code);
    setPhoneNumber(value.slice(code.length).replace(/\D/g, "") || "");
  };

  const handleSubmit = () => {
    if (!company_name.trim()) {
      toastError("Company name is required.");
      return;
    }
    if (!email.trim()) {
      toastError("Email is required.");
      return;
    }
    if (!phone_number.trim()) {
      toastError("Phone number is required.");
      return;
    }
    if (!fax_number.trim()) {
      toastError("Fax number is required.");
      return;
    }
    if (!address.trim()) {
      toastError("Address is required.");
      return;
    }
    if (!state) {
      toastError("State (business location) is required.");
      return;
    }
    onAdd({
      company_name: company_name.trim(),
      email: email.trim(),
      phone_number: phone_number.trim(),
      dial_code: dial_code || "+1",
      fax_number: fax_number.trim(),
      address: address.trim(),
      state: state,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Company Name <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="text"
            value={company_name}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Email <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className={inputClass}
          />
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
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Fax Number <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="tel"
            value={fax_number}
            onChange={(e) => setFaxNumber(e.target.value)}
            placeholder="(xxx) xxx-xxxx"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Address <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, City, State, ZIP"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            State (business location) <span className="text-rcn-danger font-black">*</span>
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select state
            </option>
            {stateSelectOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2.5 justify-end mt-4">
        <Button type="button" variant="secondary" size="md" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="button" variant="primary" size="md" onClick={handleSubmit}>
          Add receiver
        </Button>
      </div>
    </Modal>
  );
}
