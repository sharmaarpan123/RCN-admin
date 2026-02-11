export interface Receiver {
  name: string;
  state: string;
}

/** One selected receiver: organization + branch + department (for staff referral). */
export interface ReceiverRow {
  organizationId: string;
  organizationName: string;
  branchId: string | null;
  branchName: string | null;
  departmentId: string | null;
  departmentName: string | null;
}

/** Option shape for org/branch/department selects. */
export interface OrgBranchDeptOption {
  value: string;
  label: string;
}

export interface InsuranceBlock {
  id: number;
  payer: string;
  policy: string;
  planGroup: string;
}

export const US_STATES = [
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

export const AVAILABLE_SERVICES = [
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

export const DEMO_RECEIVERS: Receiver[] = [
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

export const NAV_ITEMS = [
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
];
