"use client";

import { useOrgPortal, US_STATES, type Org, type OrgAddress, type OrgContact } from "@/context/OrgPortalContext";
import { Button } from "@/components";
import { useEffect, useState } from "react";

const DEF_ADDR: OrgAddress = { street: "", apt: "", city: "", state: "", zip: "" };
const DEF_CONTACT: OrgContact = { firstName: "", lastName: "", email: "", tel: "", fax: "" };

export default function OrgPortalOrganizationSettingsPage() {
  const { org, saveOrgSettings } = useOrgPortal();
  const [form, setForm] = useState<Partial<Org>>(org);

  useEffect(() => {
    setForm(org);
  }, [org]);

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
          <Button variant="primary" size="sm" onClick={handleSave} className="w-full sm:w-auto shrink-0">Save Organization</Button>
        </div>
        <div className="p-4 space-y-4">
          <div className="rounded-xl border border-dashed border-rcn-accent/50 bg-rcn-accent/5 px-3 py-2 text-xs text-rcn-accent">
            Fields marked <span className="text-rcn-danger font-bold">*</span> are required.
          </div>

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
      </div>
    </div>
  );
}
