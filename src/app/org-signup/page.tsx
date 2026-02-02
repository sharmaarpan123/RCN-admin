"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toastSuccess, toastError } from '../../utils/toast';
import Button from '../../components/Button';
import CustomNextLink from '../../components/CustomNextLink';

// US States list
const US_STATES = [
  { abbr: "AL", name: "Alabama" }, { abbr: "AK", name: "Alaska" }, { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" }, { abbr: "CA", name: "California" }, { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" }, { abbr: "DE", name: "Delaware" }, { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" }, { abbr: "HI", name: "Hawaii" }, { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" }, { abbr: "IN", name: "Indiana" }, { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" }, { abbr: "KY", name: "Kentucky" }, { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" }, { abbr: "MD", name: "Maryland" }, { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" }, { abbr: "MN", name: "Minnesota" }, { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" }, { abbr: "MT", name: "Montana" }, { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" }, { abbr: "NH", name: "New Hampshire" }, { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" }, { abbr: "NY", name: "New York" }, { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" }, { abbr: "OH", name: "Ohio" }, { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" }, { abbr: "PA", name: "Pennsylvania" }, { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" }, { abbr: "SD", name: "South Dakota" }, { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" }, { abbr: "UT", name: "Utah" }, { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" }, { abbr: "WA", name: "Washington" }, { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" }, { abbr: "WY", name: "Wyoming" }, { abbr: "DC", name: "District of Columbia" },
];

const OrgSignup: React.FC = () => {
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
      toastError('Organization Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      toastError('Organization Phone is required.');
      return;
    }
    if (!formData.email.trim()) {
      toastError('Organization Email is required.');
      return;
    }
    if (!formData.state.trim()) {
      toastError('State is required.');
      return;
    }
    if (!formData.zip.trim()) {
      toastError('Zip is required.');
      return;
    }

    // In a real application, this would POST to an API
    // For demo purposes, just show success message and redirect
    toastSuccess('Organization registered successfully! (Demo mode - no actual signup)');
    
    // Redirect to login after a short delay
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
                        {US_STATES.map(s => (
                          <option key={s.abbr} value={s.abbr}>{s.name}</option>
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
