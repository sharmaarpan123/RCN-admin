"use client";

import React, { useState, useRef, useEffect } from "react";

interface Receiver {
  name: string;
  state: string;
}

interface InsuranceBlock {
  id: number;
  payer: string;
  policy: string;
  planGroup: string;
}

const US_STATES = [
  { value: "ALL", label: "All States" },
  { value: "AL", label: "Alabama (AL)" },
  { value: "AK", label: "Alaska (AK)" },
  { value: "AZ", label: "Arizona (AZ)" },
  { value: "AR", label: "Arkansas (AR)" },
  { value: "CA", label: "California (CA)" },
  { value: "CO", label: "Colorado (CO)" },
  { value: "CT", label: "Connecticut (CT)" },
  { value: "DE", label: "Delaware (DE)" },
  { value: "DC", label: "District of Columbia (DC)" },
  { value: "FL", label: "Florida (FL)" },
  { value: "GA", label: "Georgia (GA)" },
  { value: "HI", label: "Hawaii (HI)" },
  { value: "ID", label: "Idaho (ID)" },
  { value: "IL", label: "Illinois (IL)" },
  { value: "IN", label: "Indiana (IN)" },
  { value: "IA", label: "Iowa (IA)" },
  { value: "KS", label: "Kansas (KS)" },
  { value: "KY", label: "Kentucky (KY)" },
  { value: "LA", label: "Louisiana (LA)" },
  { value: "ME", label: "Maine (ME)" },
  { value: "MD", label: "Maryland (MD)" },
  { value: "MA", label: "Massachusetts (MA)" },
  { value: "MI", label: "Michigan (MI)" },
  { value: "MN", label: "Minnesota (MN)" },
  { value: "MS", label: "Mississippi (MS)" },
  { value: "MO", label: "Missouri (MO)" },
  { value: "MT", label: "Montana (MT)" },
  { value: "NE", label: "Nebraska (NE)" },
  { value: "NV", label: "Nevada (NV)" },
  { value: "NH", label: "New Hampshire (NH)" },
  { value: "NJ", label: "New Jersey (NJ)" },
  { value: "NM", label: "New Mexico (NM)" },
  { value: "NY", label: "New York (NY)" },
  { value: "NC", label: "North Carolina (NC)" },
  { value: "ND", label: "North Dakota (ND)" },
  { value: "OH", label: "Ohio (OH)" },
  { value: "OK", label: "Oklahoma (OK)" },
  { value: "OR", label: "Oregon (OR)" },
  { value: "PA", label: "Pennsylvania (PA)" },
  { value: "RI", label: "Rhode Island (RI)" },
  { value: "SC", label: "South Carolina (SC)" },
  { value: "SD", label: "South Dakota (SD)" },
  { value: "TN", label: "Tennessee (TN)" },
  { value: "TX", label: "Texas (TX)" },
  { value: "UT", label: "Utah (UT)" },
  { value: "VT", label: "Vermont (VT)" },
  { value: "VA", label: "Virginia (VA)" },
  { value: "WA", label: "Washington (WA)" },
  { value: "WV", label: "West Virginia (WV)" },
  { value: "WI", label: "Wisconsin (WI)" },
  { value: "WY", label: "Wyoming (WY)" },
];

const AVAILABLE_SERVICES = [
  "Home Health (Skilled)",
  "Hospice",
  "Palliative Care",
  "Primary Care follow-up",
  "Outpatient infusion",
  "Lab draws at home",
  "Respiratory therapy",
  "Nutrition services",
  "Durable medical equipment (DME) & supplies",
  "Personal care & supportive services",
];

const DEMO_RECEIVERS: Receiver[] = [
  { name: "Sunrise Home Health", state: "IL" },
  { name: "Evergreen Hospice", state: "IL" },
  { name: "Comfort Palliative Services", state: "IN" },
  { name: "City Infusion Center", state: "WI" },
  { name: "Mobile Lab Draws", state: "IL" },
  { name: "Gulf Coast Hospice & Palliative", state: "FL" },
  { name: "Desert Home Health", state: "AZ" },
  { name: "Golden State DME & Supplies", state: "CA" },
  { name: "Buckeye Infusion Partners", state: "OH" },
  { name: "Lone Star Skilled Nursing Services", state: "TX" },
  { name: "Very Long Receiver Company Name Example — Skilled Nursing & Home Health Services, Inc.", state: "IL" },
  { name: "Another Extremely Long Receiver Name Example — Durable Medical Equipment & Supplies Division", state: "NY" },
];

function AddReceiverModal({
  isOpen,
  onClose,
  onAdd,
  defaultState,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (receiver: Receiver) => void;
  defaultState: string;
}) {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState(defaultState);
  const [services, setServices] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const newState = defaultState === "ALL" ? "IL" : defaultState;
      setState(newState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

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
      alert("Company Name is required.");
      return;
    }
    if (!state) {
      alert("State (business location) is required.");
      return;
    }
    onAdd({ name: company.trim(), state });
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/35 flex items-center justify-center p-4 z-[999]"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      aria-hidden="false"
    >
      <div
        className="w-full max-w-[760px] bg-white border border-rcn-border rounded-2xl shadow-rcn p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receiverModalTitle"
      >
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <h3 id="receiverModalTitle" className="m-0 text-lg font-semibold">Add Referral Receiver</h3>
            <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">Company details (submit to add to Available Receivers).</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="border border-rcn-border bg-white px-2.5 py-2 rounded-xl font-extrabold text-xs shadow"
          >
            ✕
          </button>
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
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(xxx) xxx-xxxx"
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Fax Number</label>
            <input
              type="tel"
              value={fax}
              onChange={(e) => setFax(e.target.value)}
              placeholder="(xxx) xxx-xxxx"
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, State, ZIP"
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              State (business location) <span className="text-rcn-danger font-black">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
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
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal min-h-[95px] resize-y focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
        </div>

        <div className="flex gap-2.5 justify-end mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="border border-rcn-border bg-white px-2.5 py-2 rounded-xl font-extrabold text-xs shadow"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewReferralPage() {
  const [receivers, setReceivers] = useState<Receiver[]>(DEMO_RECEIVERS);
  const [stateFilter, setStateFilter] = useState("ALL");
  const [receiverSearch, setReceiverSearch] = useState("");
  const [selectedReceivers, setSelectedReceivers] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>(AVAILABLE_SERVICES);
  const [requestedServices, setRequestedServices] = useState<string[]>([]);
  const [insuranceBlocks, setInsuranceBlocks] = useState<InsuranceBlock[]>([
    { id: 1, payer: "", policy: "", planGroup: "" },
    { id: 2, payer: "", policy: "", planGroup: "" },
  ]);
  const [insuranceCount, setInsuranceCount] = useState(2);
  const [receiverModalOpen, setReceiverModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("sender-form");

  // Scroll detection for active section
  useEffect(() => {
    const sections = [
      "sender-form",
      "sender-info",
      "select-receiver",
      "services-requested",
      "patient-info",
      "insurance-info",
      "additional-details",
      "attachments",
      "pcp-info",
      "form-actions",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for sticky nav

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Form fields
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [addressOfCare, setAddressOfCare] = useState("");
  const [primaryPayer, setPrimaryPayer] = useState("");
  const [primaryPolicy, setPrimaryPolicy] = useState("");
  const [primaryPlanGroup, setPrimaryPlanGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("");
  const [ssn, setSsn] = useState("");
  const [representative, setRepresentative] = useState("");
  const [otherInfo, setOtherInfo] = useState("");
  const [otherServices, setOtherServices] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [pcpName, setPcpName] = useState("");
  const [pcpAddress, setPcpAddress] = useState("");
  const [pcpTel, setPcpTel] = useState("");
  const [pcpFax, setPcpFax] = useState("");
  const [pcpEmail, setPcpEmail] = useState("");
  const [pcpNpi, setPcpNpi] = useState("");

  const filteredReceivers = receivers
    .filter((r) => stateFilter === "ALL" || r.state === stateFilter)
    .filter((r) => !selectedReceivers.includes(r.name))
    .filter((r) => !receiverSearch || r.name.toLowerCase().includes(receiverSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const availableReceiversList = filteredReceivers.map((r) => r.name);

  const availableReceiversRef = useRef<HTMLSelectElement>(null);
  const selectedReceiversRef = useRef<HTMLSelectElement>(null);
  const availableServicesRef = useRef<HTMLSelectElement>(null);
  const requestedServicesRef = useRef<HTMLSelectElement>(null);

  const moveReceiver = (direction: "right" | "left" | "allRight" | "allLeft") => {
    if (direction === "right" || direction === "allRight") {
      const select = availableReceiversRef.current;
      if (!select) return;
      const selected = direction === "allRight"
        ? Array.from(select.options).map((o) => o.value)
        : Array.from(select.selectedOptions).map((o) => o.value);
      setSelectedReceivers((prev) => [...new Set([...prev, ...selected])]);
    } else {
      const select = selectedReceiversRef.current;
      if (!select) return;
      const selected = direction === "allLeft"
        ? Array.from(select.options).map((o) => o.value)
        : Array.from(select.selectedOptions).map((o) => o.value);
      setSelectedReceivers((prev) => prev.filter((item) => !selected.includes(item)));
    }
  };

  const moveService = (direction: "right" | "left" | "allRight" | "allLeft") => {
    if (direction === "right" || direction === "allRight") {
      const select = availableServicesRef.current;
      if (!select) return;
      const selected = direction === "allRight"
        ? Array.from(select.options).map((o) => o.value)
        : Array.from(select.selectedOptions).map((o) => o.value);
      setAvailableServices((prev) => prev.filter((s) => !selected.includes(s)));
      setRequestedServices((prev) => [...new Set([...prev, ...selected])]);
    } else {
      const select = requestedServicesRef.current;
      if (!select) return;
      const selected = direction === "allLeft"
        ? Array.from(select.options).map((o) => o.value)
        : Array.from(select.selectedOptions).map((o) => o.value);
      setRequestedServices((prev) => prev.filter((s) => !selected.includes(s)));
      setAvailableServices((prev) => [...new Set([...prev, ...selected])]);
    }
  };

  const addInsuranceBlock = () => {
    setInsuranceCount((prev) => prev + 1);
    setInsuranceBlocks((prev) => [...prev, { id: insuranceCount + 1, payer: "", policy: "", planGroup: "" }]);
  };

  const removeInsuranceBlock = (id: number) => {
    setInsuranceBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const updateInsuranceBlock = (id: number, field: keyof InsuranceBlock, value: string) => {
    setInsuranceBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, [field]: value } : block)));
  };

  const handleAddReceiver = (receiver: Receiver) => {
    setReceivers((prev) => [...prev, receiver]);
  };

  const handleSubmit = () => {
    // Validation and submission logic here
    alert("Demo: Referral submitted successfully!");
  };

  const handleSaveDraft = () => {
    alert("Demo: Draft saved!");
  };

  return (
    <div className="max-w-[1280px] mx-auto  ">
      {/* Horizontal Sticky Navigation */}
      <nav className="md:sticky top-[5px] z-20 mb-3.5">
        <div className="bg-gradient-to-b  from-rcn-brand  to-rcn-brand-light border border-slate-200/60 rounded-2xl shadow-sm p-3">
          <div className="flex items-center gap-2.5 flex-wrap overflow-x-auto">
            {[
              { id: "sender-form", label: "Patient Referral Form (Sender)" },
              { id: "sender-info", label: "Person/Facility Sending Referral" },
              { id: "select-receiver", label: "Select the Referral Receiver" },
              { id: "services-requested", label: "Services Requested" },
              { id: "patient-info", label: "Patient Information" },
              { id: "insurance-info", label: "Patient Insurance Information" },
              { id: "additional-details", label: "Additional Patient Details" },
              { id: "attachments", label: "Attached Documents (Sender)" },
              { id: "pcp-info", label: "Primary Care Physician" },
              { id: "form-actions", label: "Submit / Save Draft" },
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(item.id);
                    const element = document.getElementById(item.id);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#d4f4e0] border border-[#4ade80] text-rcn-text shadow-sm"
                      : "bg-white border border-slate-300 text-rcn-text hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive ? "bg-[#22c55e]" : "bg-slate-400"
                    }`}
                  />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      <main>
        {/* Patient Referral Form Header */}
        <section id="sender-form" className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
            <div className="pl-3 flex flex-col gap-0.5">
              <h2 className="m-0 text-lg font-semibold tracking-wide">Patient Referral Form (Sender)</h2>
              <p className="m-0 text-xs text-rcn-muted font-[850]">Send a referral to one or multiple receivers.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
              Sender uploads documents
            </span>
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
          </div>
        </section>

        {/* Person/Facility Sending Referral */}
        <section id="sender-info" className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
            <div className="pl-3 flex flex-col gap-0.5">
              <h2 className="m-0 text-lg font-semibold tracking-wide">Person/Facility Sending Referral</h2>
              <p className="m-0 text-xs text-rcn-muted font-[850]">Automatically included by the system</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
              Auto-filled
            </span>
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
          </div>
          <p className="text-xs text-rcn-muted mb-3">Facility name, address, email, phone number, and fax number are auto-filled.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["Sender Name", "Facility Name", "Facility Address", "Email", "Phone Number", "Fax Number"].map((label) => (
              <div key={label}>
                <label className="block text-xs text-rcn-muted font-[850] mb-1.5">{label}</label>
                <input type="text" placeholder="Auto-filled" disabled className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-slate-50 text-rcn-muted text-sm" />
              </div>
            ))}
          </div>
        </section>

        {/* Select the Referral Receiver */}
        <section id="select-receiver" className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
            <div className="pl-3 flex flex-col gap-0.5">
              <h2 className="m-0 text-lg font-semibold tracking-wide">Select the Referral Receiver</h2>
              <p className="m-0 text-xs text-rcn-muted font-[850]">Filter by state to narrow receiver list</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
              Bulk referrals supported
            </span>
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
          </div>

          <div className="border border-rcn-border/60 bg-[#eef8f1] border-[#cfe6d6] rounded-[14px] p-3 mb-3">
            <p className="m-0 text-sm text-rcn-text">
              Bulk referrals are supported. When a referral is sent to multiple receivers, each receiver will only be able to view their own referral and will not be able to see any other receivers or recipient details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">State (business location)</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              >
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-rcn-muted mt-1.5">Select a state to narrow down available receivers.</p>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Receiver (dropdown)</label>
              <select
                onChange={(e) => {
                  if (e.target.value && !selectedReceivers.includes(e.target.value)) {
                    setSelectedReceivers((prev) => [...prev, e.target.value]);
                  }
                  e.target.value = "";
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              >
                <option value="" disabled selected>
                  Select a receiver
                </option>
                {filteredReceivers.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Search receiver</label>
              <input
                type="text"
                value={receiverSearch}
                onChange={(e) => setReceiverSearch(e.target.value)}
                placeholder="Type to search Available Receivers..."
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
          </div>

          {/* Receiver Mover */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3 items-start">
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Available receivers (multi-select)</label>
              <select
                ref={availableReceiversRef}
                multiple
                size={10}
                className="w-full min-h-[240px] px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm overflow-x-auto"
              >
                {availableReceiversList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setReceiverModalOpen(true)}
                className="w-full mt-2.5 flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-[14px] bg-gradient-to-b from-rcn-brand to-rcn-brand-light text-white border border-black/6 shadow-[0_10px_18px_rgba(47,125,79,.22)] font-black text-xs hover:brightness-[1.03] hover:-translate-y-px active:translate-y-0 transition-all"
              >
                <span className="w-6.5 h-6.5 rounded-xl bg-white/18 flex items-center justify-center text-base">＋</span>
                <span>Add Referral Receiver (if not listed)</span>
              </button>
              <p className="text-xs text-rcn-muted text-center mt-1.5">Add a new receiver company to the list.</p>
            </div>

            

            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Selected receivers</label>
              <select
                ref={selectedReceiversRef}
                multiple
                size={10}
                className="w-full min-h-[240px] px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm overflow-x-auto"
              >
                {selectedReceivers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-rcn-muted mt-2">This is the final receiver list for the referral.</p>
            </div>
          </div>
        </section>

        {/* Services Requested */}
        <section id="services-requested" className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
            <div className="pl-3 flex flex-col gap-0.5">
              <h2 className="m-0 text-lg font-semibold tracking-wide">Services Requested</h2>
              <p className="m-0 text-xs text-rcn-muted font-[850]">Move services into &quot;Requested Services&quot;</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
              Multi-select
            </span>
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
          </div>

          <p className="text-xs text-rcn-muted mb-3">Use the buttons to move services between Available and Requested.</p>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3 items-center mb-3">
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Available services</label>
              <select
                ref={availableServicesRef}
                multiple
                size={10}
                className="w-full min-h-[240px] px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm"
              >
                {availableServices.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

           

            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Requested services</label>
              <select
                ref={requestedServicesRef}
                multiple
                size={10}
                className="w-full min-h-[240px] px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm"
              >
                {requestedServices.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              <p className="text-xs text-rcn-muted mt-2">This list will be submitted as Services Requested.</p>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Other services: Please type</label>
            <textarea
              value={otherServices}
              onChange={(e) => setOtherServices(e.target.value)}
              placeholder="Type any additional services needed..."
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal min-h-[95px] resize-y focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>

          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Other Information</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional referral notes..."
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal min-h-[95px] resize-y focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
        </section>

        {/* Patient Information */}
        <section id="patient-info" className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
            <div className="pl-3 flex flex-col gap-0.5">
              <h2 className="m-0 text-lg font-semibold tracking-wide">Patient Information</h2>
              <p className="m-0 text-xs text-rcn-muted font-[850]">Required demographics and address of care</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
              Required fields
            </span>
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
          </div>

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

        {/* Patient Insurance Information */}
        <section id="insurance-info" className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
            <div className="pl-3 flex flex-col gap-0.5">
              <h2 className="m-0 text-lg font-semibold tracking-wide">Patient Insurance Information</h2>
              <p className="m-0 text-xs text-rcn-muted font-[850]">Primary required; additional insurance optional</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
              Documents optional
            </span>
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
          </div>

          <div className="border border-dashed border-rcn-border bg-[#fbfdfb] rounded-[14px] p-3 mb-3">
            <div className="flex items-center justify-between gap-2.5 mb-2.5">
              <strong className="text-xs font-black">Primary Insurance (Required)</strong>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted">
                Required
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
                  Payer <span className="text-rcn-danger font-black">*</span>
                </label>
                <input
                  type="text"
                  value={primaryPayer}
                  onChange={(e) => setPrimaryPayer(e.target.value)}
                  placeholder="e.g., BCBS, Aetna, Medicare"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
                />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
                  Policy # <span className="text-rcn-danger font-black">*</span>
                </label>
                <input
                  type="text"
                  value={primaryPolicy}
                  onChange={(e) => setPrimaryPolicy(e.target.value)}
                  placeholder="Policy / Member ID"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
                />
              </div>
              <div>
                <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
                  Plan/Group <span className="text-rcn-danger font-black">*</span>
                </label>
                <input
                  type="text"
                  value={primaryPlanGroup}
                  onChange={(e) => setPrimaryPlanGroup(e.target.value)}
                  placeholder="Plan / Group"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
                />
              </div>
            </div>
            <p className="text-xs text-rcn-muted mt-2.5">Upload insurance document(s) (optional).</p>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5 mt-2.5">Upload Insurance Document(s)</label>
            <input type="file" multiple className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm" />
          </div>

          {insuranceBlocks.map((block) => (
            <div key={block.id} className="border border-dashed border-rcn-border bg-[#fbfdfb] rounded-[14px] p-3 mb-3">
              <div className="flex items-center justify-between gap-2.5 mb-2.5">
                <strong className="text-xs font-black">Additional Insurance (Optional) #{block.id}</strong>
                <button
                  type="button"
                  onClick={() => removeInsuranceBlock(block.id)}
                  className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-extrabold shadow"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Payer</label>
                  <input
                    type="text"
                    value={block.payer}
                    onChange={(e) => updateInsuranceBlock(block.id, "payer", e.target.value)}
                    placeholder="e.g., BCBS, Aetna, Medicare"
                    className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
                  />
                </div>
                <div>
                  <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Policy #</label>
                  <input
                    type="text"
                    value={block.policy}
                    onChange={(e) => updateInsuranceBlock(block.id, "policy", e.target.value)}
                    placeholder="Policy / Member ID"
                    className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
                  />
                </div>
                <div>
                  <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Plan/Group</label>
                  <input
                    type="text"
                    value={block.planGroup}
                    onChange={(e) => updateInsuranceBlock(block.id, "planGroup", e.target.value)}
                    placeholder="Plan / Group"
                    className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
                  />
                </div>
              </div>
              <p className="text-xs text-rcn-muted mt-2.5">Upload insurance document(s) (optional).</p>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5 mt-2.5">Upload Insurance Document(s)</label>
              <input type="file" multiple className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm" />
            </div>
          ))}

          <button
            type="button"
            onClick={addInsuranceBlock}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-[14px] bg-gradient-to-b from-rcn-brand to-rcn-brand-light text-white border border-black/6 shadow-[0_10px_18px_rgba(47,125,79,.22)] font-black text-xs hover:brightness-[1.03] hover:-translate-y-px active:translate-y-0 transition-all mt-3"
          >
            <span className="w-6.5 h-6.5 rounded-xl bg-white/18 flex items-center justify-center text-base">＋</span>
            <span>Add Another Additional Insurance (Optional)</span>
          </button>
          <p className="text-xs text-rcn-muted text-center mt-1.5">Add another insurance payer (optional).</p>
        </section>

        {/* Additional Patient Details */}
        <section id="additional-details" className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
            <div className="pl-3 flex flex-col gap-0.5">
              <h2 className="m-0 text-lg font-semibold tracking-wide">Additional Patient Details</h2>
              <p className="m-0 text-xs text-rcn-muted font-[850]">Visible to receiver after payment/unlock</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
              Phone required
            </span>
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
          </div>

          <div className="border border-rcn-border/60 bg-[#eef8f1] border-[#cfe6d6] rounded-[14px] p-3 mb-3">
            <p className="m-0 text-sm text-rcn-text mb-2">
              These additional details will be visible to the Referral Receiver after payment/unlock (unless the Referral Sender purchased the referral, in which case the Receiver can view without paying).
            </p>
            <p className="m-0 text-sm text-rcn-text mb-2">
              Without unlocking additional details, the receiver can still verify the patient&apos;s insurance and choose to accept or decline the referral. This helps ensure the receiver does not incur costs for services that are not covered or not appropriate.
            </p>
            <p className="m-0 text-sm text-rcn-text">
              The communication channel (chat/messaging) will remain closed until the receiver pays to unlock the referral, at which point full details become available and the receiver can communicate with the sender.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
                Phone Number <span className="text-rcn-danger font-black">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Primary Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Social Security Number</label>
              <input
                type="text"
                value={ssn}
                onChange={(e) => setSsn(e.target.value)}
                placeholder="XXX-XX-XXXX"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Patient-selected representative or power of attorney</label>
              <input
                type="text"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Other Information</label>
              <textarea
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                placeholder="Additional details visible after receiver unlock..."
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal min-h-[95px] resize-y focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
          </div>
        </section>

        {/* Attached Documents */}
        <section id="attachments" className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
            <div className="pl-3 flex flex-col gap-0.5">
              <h2 className="m-0 text-lg font-semibold tracking-wide">Attached Documents (Sender)</h2>
              <p className="m-0 text-xs text-rcn-muted font-[850]">Upload supporting documents for the referral</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
              Optional
            </span>
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["Face Sheet", "Medication List", "Discharge Summary", "Wound Photos", "Signed Order", "History & Physical", "Progress Note"].map((label) => (
              <div key={label}>
                <label className="block text-xs text-rcn-muted font-[850] mb-1.5">{label}</label>
                <input
                  type="file"
                  multiple={label === "Wound Photos"}
                  accept={label === "Wound Photos" ? "image/*" : undefined}
                  className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Other Documents</label>
              <input type="file" multiple className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm" />
            </div>
          </div>
        </section>

        {/* Primary Care Physician Information */}
        <section id="pcp-info" className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
            <div className="pl-3 flex flex-col gap-0.5">
              <h2 className="m-0 text-lg font-semibold tracking-wide">Primary Care Physician Information</h2>
              <p className="m-0 text-xs text-rcn-muted font-[850]">Enter patient&apos;s primary care physician details</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
              Optional
            </span>
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Name</label>
              <input
                type="text"
                value={pcpName}
                onChange={(e) => setPcpName(e.target.value)}
                placeholder="PCP full name"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Address</label>
              <input
                type="text"
                value={pcpAddress}
                onChange={(e) => setPcpAddress(e.target.value)}
                placeholder="Street, City, State, ZIP"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Tel</label>
              <input
                type="tel"
                value={pcpTel}
                onChange={(e) => setPcpTel(e.target.value)}
                placeholder="(xxx) xxx-xxxx"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Fax</label>
              <input
                type="tel"
                value={pcpFax}
                onChange={(e) => setPcpFax(e.target.value)}
                placeholder="(xxx) xxx-xxxx"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Email</label>
              <input
                type="email"
                value={pcpEmail}
                onChange={(e) => setPcpEmail(e.target.value)}
                placeholder="pcp@example.com"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">NPI</label>
              <input
                type="text"
                value={pcpNpi}
                onChange={(e) => setPcpNpi(e.target.value)}
                placeholder="NPI number"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
          </div>
        </section>

        {/* Submit / Save Draft */}
        <section id="form-actions" className="flex gap-2.5 flex-wrap justify-end p-3 border border-rcn-border rounded-2xl bg-gradient-to-b from-white to-[#f6fbf7] shadow-rcn mb-3.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl font-extrabold text-xs shadow"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-3 py-2.5 rounded-xl font-extrabold text-xs shadow"
          >
            Submit Referral
          </button>
        </section>
      </main>

      <AddReceiverModal
        isOpen={receiverModalOpen}
        onClose={() => setReceiverModalOpen(false)}
        onAdd={handleAddReceiver}
        defaultState={stateFilter}
      />
    </div>
  );
}
