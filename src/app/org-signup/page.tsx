"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { US_STATES } from '../../utils/database';
import Button from '../../components/Button';
import CustomNextLink from '../../components/CustomNextLink';

const OrgSignup: React.FC = () => {
  const { db, refreshDB, showToast } = useApp();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    // Organization Info
    name: '',
    phone: '',
    email: '',
    ein: '',
    
    // Address
    street: '',
    suite: '',
    city: '',
    state: '',
    zip: '',
    
    // Contact Person
    contactFirst: '',
    contactLast: '',
    contactEmail: '',
    contactTel: '',
    contactFax: '',
  });

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)] transition-all";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showToast('Organization Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Organization Phone is required.');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Organization Email is required.');
      return;
    }
    if (!formData.state.trim()) {
      showToast('State is required.');
      return;
    }
    if (!formData.zip.trim()) {
      showToast('Zip is required.');
      return;
    }

    // Generate unique ID
    const uid = (prefix: string) => `${prefix}_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

    // Create organization object
    const newOrg = {
      id: uid('org'),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      ein: formData.ein.trim() || '',
      enabled: true,
      address: {
        street: formData.street.trim() || '',
        suite: formData.suite.trim() || '',
        city: formData.city.trim() || '',
        state: formData.state.trim(),
        zip: formData.zip.trim()
      },
      contact: {
        first: formData.contactFirst.trim() || '',
        last: formData.contactLast.trim() || '',
        email: formData.contactEmail.trim() || '',
        tel: formData.contactTel.trim() || '',
        fax: formData.contactFax.trim() || ''
      },
      walletCents: 0,
      referralCredits: 0
    };

    // Save to database
    db.orgs.push(newOrg);
    localStorage.setItem('rcn_demo_v6', JSON.stringify(db));
    refreshDB();

    showToast('Organization registered successfully!');
    
    // Redirect to login or dashboard after a short delay
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 login-bg">
      <div className="max-w-[1200px] w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
          {/* Left Hero Section */}
          <div className="rounded-rcn-lg p-5 login-hero-gradient text-rcn-dark-text shadow-rcn min-h-[280px]">
            <div className="flex gap-3 items-center mb-4">
              <div className="w-10 h-10 rounded-xl relative shrink-0 overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
                <Image src="/logo.jpeg" alt="RCN Logo" fill className="object-cover" />
              </div>
              <div>
                <h2 className="text-lg font-semibold m-0 mb-2">Referral Coordination Network</h2>
                <p className="text-rcn-dark-text/85 text-sm m-0">
                  Register Your Organization
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Send and receive referrals securely</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Track referrals from request to completion</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Manage your organization profile and users</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Access the referral directory and coordination tools</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-rcn-dark-text/80 mb-3">
                Already have an account?
              </p>
              <CustomNextLink href="/login" variant="secondary" size="sm">
                Sign in instead
              </CustomNextLink>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold m-0 mb-3">Register Organization</h3>
            <p className="text-xs text-rcn-muted m-0 mb-4">
              Complete the form below to register your organization. Required fields are marked with an asterisk (*).
            </p>

            <form onSubmit={handleSubmit}>
              {/* Organization Information */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-rcn-text mb-3 uppercase tracking-wide">Organization Information</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      Organization Name <span className="text-rcn-danger">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Northlake Medical Center"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">
                        Phone <span className="text-rcn-danger">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">
                        Email <span className="text-rcn-danger">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@organization.com"
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      EIN (Optional)
                    </label>
                    <input
                      id="ein"
                      type="text"
                      value={formData.ein}
                      onChange={handleChange}
                      placeholder="12-3456789"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-rcn-border my-4"></div>

              {/* Organization Address */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-rcn-text mb-3 uppercase tracking-wide">Organization Address</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">Street</label>
                    <input
                      id="street"
                      type="text"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="123 Main Street"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">Apt/Suite</label>
                    <input
                      id="suite"
                      type="text"
                      value={formData.suite}
                      onChange={handleChange}
                      placeholder="Suite 100"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">City</label>
                      <input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">
                        State <span className="text-rcn-danger">*</span>
                      </label>
                      <select
                        id="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      >
                        <option value="">Select State</option>
                        {US_STATES.filter(s => s !== '').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">
                      Zip <span className="text-rcn-danger">*</span>
                    </label>
                    <input
                      id="zip"
                      type="text"
                      value={formData.zip}
                      onChange={handleChange}
                      placeholder="12345"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-rcn-border my-4"></div>

              {/* Contact Person */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-rcn-text mb-3 uppercase tracking-wide">Contact Person</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">First Name</label>
                      <input
                        id="contactFirst"
                        type="text"
                        value={formData.contactFirst}
                        onChange={handleChange}
                        placeholder="John"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">Last Name</label>
                      <input
                        id="contactLast"
                        type="text"
                        value={formData.contactLast}
                        onChange={handleChange}
                        placeholder="Doe"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-rcn-muted block mb-1.5">Email</label>
                    <input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="contact@organization.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">Tel</label>
                      <input
                        id="contactTel"
                        type="tel"
                        value={formData.contactTel}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-rcn-muted block mb-1.5">Fax</label>
                      <input
                        id="contactFax"
                        type="tel"
                        value={formData.contactFax}
                        onChange={handleChange}
                        placeholder="(555) 123-4568"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-rcn-border my-4"></div>

              {/* Submit Buttons */}
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <CustomNextLink href="/" variant="ghost" size="sm">
                  Cancel
                </CustomNextLink>
                <Button variant="primary" type="submit">
                  Register Organization
                </Button>
              </div>
            </form>
          </div>
        </div>
        <p className="text-xs text-rcn-muted mt-3 text-center">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default OrgSignup;
