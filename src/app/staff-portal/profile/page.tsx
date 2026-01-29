"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { getDB, saveDB, nowISO, audit } from "@/utils/database";

export default function StaffProfilePage() {
  const { session, refreshDB, showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    fax: "",
    address: "",
    role: "",
    notes: "",
  });

  useEffect(() => {
    // if (session?.userId) {
      const db = getDB();
      const user = db?.users?.find((u: any) => u.id === session?.userId);
      if (user) {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          fax: user.fax || "",
          address: user.address || "",
          role: user.role || "",
          notes: user.notes || "",
        });
      }
      setLoading(false);
    // }
  }, [session]);

  const handleReset = () => {
    if (session?.userId) {
      const db = getDB();
      const user = db.users.find((u: any) => u.id === session.userId);
      if (user) {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          fax: user.fax || "",
          address: user.address || "",
          role: user.role || "",
          notes: user.notes || "",
        });
        showToast("Form reset to saved values.");
      }
    }
  };

  const handleSaveProfile = () => {
    if (!session?.userId) {
      showToast("No user session found.");
      return;
    }

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const fax = formData.fax.trim();
    const address = formData.address.trim();
    const notes = formData.notes.trim();

    if (!firstName) {
      showToast("First Name is required.");
      return;
    }
    if (!lastName) {
      showToast("Last Name is required.");
      return;
    }
    if (!email) {
      showToast("Email is required.");
      return;
    }
    if (!email.includes("@")) {
      showToast("Please enter a valid email address.");
      return;
    }

    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === session.userId);
    
    if (userIndex === -1) {
      showToast("User not found.");
      return;
    }

    // Check for duplicate email (excluding current user)
    const duplicateEmail = db.users.some(
      (u: any) => u.id !== session.userId && u.email?.toLowerCase() === email
    );
    if (duplicateEmail) {
      showToast("This email is already in use by another user.");
      return;
    }

    // Update user
    db.users[userIndex] = {
      ...db.users[userIndex],
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      fax,
      address,
      notes,
      updatedAt: nowISO(),
    };

    saveDB(db);
    refreshDB();
    audit("profile_updated", { userId: session.userId });
    showToast("Profile saved successfully.");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-10">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold m-0 mb-2">Staff Profile</h1>
        <p className="text-rcn-muted text-sm m-0">Manage your contact information and profile preferences.</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
          <span className="text-xs font-semibold text-rcn-text">{formData.role || "Staff"}</span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-xs font-black text-rcn-muted mb-1.5">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-xs font-black text-rcn-muted mb-1.5">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
              placeholder="Enter last name"
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-xs font-black text-rcn-muted mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
              placeholder="Enter email address"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-xs font-black text-rcn-muted mb-1.5">
              Address
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
              placeholder="Enter address"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-xs font-black text-rcn-muted mb-1.5">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
              placeholder="(312) 555-0100"
            />
          </div>

          {/* Fax Number */}
          <div>
            <label htmlFor="fax" className="block text-xs font-black text-rcn-muted mb-1.5">
              Fax Number
            </label>
            <input
              id="fax"
              type="tel"
              value={formData.fax}
              onChange={(e) => handleChange("fax", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
              placeholder="(312) 555-0199"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-xs font-black text-rcn-muted mb-1.5">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10 resize-none"
              placeholder="Additional notes or information"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-rcn-text font-extrabold text-xs shadow hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-4 py-2.5 rounded-xl border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark font-extrabold text-xs shadow hover:bg-rcn-brand/15 transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
