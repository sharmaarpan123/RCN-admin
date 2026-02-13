"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button } from "@/components";
import { toastError } from "@/utils/toast";
import type { Receiver } from "./types";
import { US_STATES } from "./types";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

interface AddReceiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (receiver: Receiver) => void;
  defaultState: string;
}

export function AddReceiverModal({
  isOpen,
  onClose,
  onAdd,
  defaultState,
}: AddReceiverModalProps) {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState(defaultState);
  const [services, setServices] = useState("");

  useEffect(() => {
    if (isOpen) {
      const newState = defaultState === "ALL" ? "IL" : defaultState;
      queueMicrotask(() => setState(newState));
    }
  }, [isOpen, defaultState]);

  const handleClose = () => {
    setCompany("");
    setEmail("");
    setPhone("");
    setFax("");
    setAddress("");
    setServices("");
    onClose();
  };

  const handleSubmit = () => {
    if (!company.trim()) {
      toastError("Company Name is required.");
      return;
    }
    if (!state) {
      toastError("State (business location) is required.");
      return;
    }
    onAdd({ name: company.trim(), state });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="760px">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <h3 id="receiverModalTitle" className="m-0 text-lg font-semibold">
            Add Referral Receiver
          </h3>
          <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">
            Company details (submit to add to Available Receivers).
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
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(xxx) xxx-xxxx"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Fax Number</label>
          <input
            type="tel"
            value={fax}
            onChange={(e) => setFax(e.target.value)}
            placeholder="(xxx) xxx-xxxx"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Address</label>
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
            <option value="" disabled>Select state</option>
            {US_STATES.filter((s) => s.value !== "ALL").map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Services Offered</label>
          <textarea
            value={services}
            onChange={(e) => setServices(e.target.value)}
            placeholder="List services offered (e.g., Home Health, Hospice, DME, etc.)"
            className={`${inputClass} min-h-[95px] resize-y`}
          />
        </div>
      </div>

      <div className="flex gap-2.5 justify-end mt-4">
        <Button type="button" variant="secondary" size="md" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="button" variant="primary" size="md" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </Modal>
  );
}
