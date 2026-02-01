"use client";

import { Button } from "@/components";
import { useState } from "react";
import { MOCK_ORG, US_STATES, isValidEmail, isLikelyZip, type Org, type OrgAddress, type OrgContact } from "../mockData";

const DEF_ADDR: OrgAddress = { street: "", apt: "", city: "", state: "", zip: "" };
const DEF_CONTACT: OrgContact = { firstName: "", lastName: "", email: "", tel: "", fax: "" };

export default function OrgPortalOrganizationSettingsPage() {
  const [org, setOrg] = useState<Org>(MOCK_ORG);
  const [form, setForm] = useState<Partial<Org>>(MOCK_ORG);
  const [toastMsg, setToastMsg] = useState<{ title: string; body: string } | null>(null);

  const showToast = (title: string, body: string) => {
    setToastMsg({ title, body });
    setTimeout(() => setToastMsg(null), 2200);
  };

  const saveOrgSettings = (input: Partial<Org>): boolean => {
    const phone = (input.phone ?? org.phone ?? "").trim();
    const email = (input.email ?? org.email ?? "").trim();
    const a = input.address ?? org.address ?? { street: "", apt: "", city: "", state: "", zip: "" };
    
    if (!phone) {
      showToast("Missing required field", "Organization Phone is required.");
      return false;
    }
    if (!email) {
      showToast("Missing required field", "Organization Email is required.");
      return false;
    }
    if (!isValidEmail(email)) {
      showToast("Invalid email", "Please enter a valid Organization Email.");
      return false;
    }
    if (!(a.street || "").trim()) {
      showToast("Missing address", "Street is required.");
      return false;
    }
    if (!(a.city || "").trim()) {
      showToast("Missing address", "City is required.");
      return false;
    }
    if (!(a.state || "").trim()) {
      showToast("Missing address", "State is required.");
      return false;
    }
    if (!(a.zip || "").trim()) {
      showToast("Missing address", "Zip is required.");
      return false;
    }
    if (!isLikelyZip(a.zip)) {
      showToast("Invalid zip", "Zip must be 5 digits (or ZIP+4).");
      return false;
    }
    const c = input.contact ?? org.contact ?? { firstName: "", lastName: "", email: "", tel: "", fax: "" };
    if ((c.email || "").trim() && !isValidEmail(c.email)) {
      showToast("Invalid contact email", "Please enter a valid Contact Person Email (or leave blank).");
      return false;
    }
    
    const updatedOrg: Org = {
      ...org,
      name: (input.name ?? org.name ?? "").trim() || "Main Organization",
      phone,
      email,
      ein: (input.ein ?? org.ein ?? "").trim(),
      address: { 
        street: (a.street || "").trim(), 
        apt: (a.apt || "").trim(), 
        city: (a.city || "").trim(), 
        state: (a.state || "").trim(), 
        zip: (a.zip || "").trim() 
      },
      contact: c,
    };
    
    setOrg(updatedOrg);
    setForm(updatedOrg);
    showToast("Organization saved", "Organization profile updated.");
    return true;
  };

  const handleSave = () => {
    saveOrgSettings({
      name: form.name,
      phone: form.phone,
      email: form.email,
      ein: form.ein,
      address: form.address,
      contact: form.contact,
    });
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold m-0">Organization Settings</h1>
        <p className="text-sm text-rcn-muted m-0 mt-0.5">Manage profile of your organization.</p>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="px-4 py-3 border-b border-rcn-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-sm m-0">Organization Profile</h3>
            <p className="text-xs text-rcn-muted m-0 mt-0.5">Update required organization profile details and optional contacts.</p>
          </div>
           </div>
        <div className="p-4 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Organization Name</label>
              <input
                value={form.name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Organization EIN (Optional)</label>
              <input
                value={form.ein ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, ein: e.target.value }))}
                placeholder="e.g., 12-3456789"
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Organization Phone <span className="text-rcn-danger">*</span></label>
              <input
                value={form.phone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                type="tel"
                placeholder="e.g., (312) 555-0100"
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Organization Email <span className="text-rcn-danger">*</span></label>
              <input
                value={form.email ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                type="email"
                placeholder="e.g., admin@organization.com"
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
              />
            </div>
          </div>

          <div className="border-t border-rcn-border pt-3">
            <h4 className="font-bold text-sm m-0 mb-2">Organization Address <span className="text-rcn-danger">*</span></h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Street <span className="text-rcn-danger">*</span></label>
                <input
                  value={form.address?.street ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: { ...DEF_ADDR, ...(f.address ?? {}), street: e.target.value } }))}
                  placeholder="e.g., 123 Main St"
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Apt/Suite (optional)</label>
                <input
                  value={form.address?.apt ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: { ...DEF_ADDR, ...(f.address ?? {}), apt: e.target.value } }))}
                  placeholder="e.g., Suite 200"
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">City <span className="text-rcn-danger">*</span></label>
                <input
                  value={form.address?.city ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: { ...DEF_ADDR, ...(f.address ?? {}), city: e.target.value } }))}
                  placeholder="e.g., Chicago"
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">State <span className="text-rcn-danger">*</span></label>
                <select
                  value={form.address?.state ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: { ...DEF_ADDR, ...(f.address ?? {}), state: e.target.value } }))}
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                >
                  <option value="">Select State…</option>
                  {US_STATES.map((s) => (
                    <option key={s.abbr} value={s.abbr}>{s.name} ({s.abbr})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Zip <span className="text-rcn-danger">*</span></label>
                <input
                  value={form.address?.zip ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: { ...DEF_ADDR, ...(f.address ?? {}), zip: e.target.value } }))}
                  placeholder="e.g., 60601"
                  inputMode="numeric"
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-rcn-border pt-3">
            <h4 className="font-bold text-sm m-0 mb-2">Organization Contact Person (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Last Name</label>
                <input
                  value={form.contact?.lastName ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, contact: { ...DEF_CONTACT, ...(f.contact ?? {}), lastName: e.target.value } }))}
                  placeholder="e.g., Smith"
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">First Name</label>
                <input
                  value={form.contact?.firstName ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, contact: { ...DEF_CONTACT, ...(f.contact ?? {}), firstName: e.target.value } }))}
                  placeholder="e.g., Jane"
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Email</label>
                <input
                  value={form.contact?.email ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, contact: { ...DEF_CONTACT, ...(f.contact ?? {}), email: e.target.value } }))}
                  type="email"
                  placeholder="e.g., jane.smith@organization.com"
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted mb-1.5">Tel</label>
                <input
                  value={form.contact?.tel ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, contact: { ...DEF_CONTACT, ...(f.contact ?? {}), tel: e.target.value } }))}
                  type="tel"
                  placeholder="e.g., (312) 555-0102"
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-rcn-muted mb-1.5">Fax</label>
                <input
                  value={form.contact?.fax ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, contact: { ...DEF_CONTACT, ...(f.contact ?? {}), fax: e.target.value } }))}
                  type="tel"
                  placeholder="e.g., (312) 555-0199"
                  className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={handleSave} className="w-full sm:w-auto shrink-0">Save Organization</Button>
        </div>  
      </div>

      {toastMsg && (
        <div
          className="fixed left-4 right-4 sm:left-auto sm:right-4 bottom-4 z-50 min-w-0 max-w-[min(440px,calc(100vw-2rem))] bg-rcn-dark-bg text-white rounded-2xl px-4 py-3 shadow-rcn border border-white/10"
          role="status"
          aria-live="polite"
        >
          <p className="font-bold text-sm m-0">{toastMsg.title}</p>
          <p className="text-xs m-0 mt-1 opacity-90">{toastMsg.body}</p>
        </div>
      )}
    </div>
  );
}
