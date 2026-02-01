// Mock data for Financial page
export const MOCK_FINANCIAL_ORGS = [
  {
    id: "org_northlake",
    name: "Northlake Medical Group",
    address: {
      state: "IL",
    },
  },
  {
    id: "org_evergreen",
    name: "Evergreen Imaging Center",
    address: {
      state: "IL",
    },
  },
  {
    id: "org_sunrise",
    name: "Sunrise Specialty Clinic",
    address: {
      state: "TX",
    },
  },
];

export const MOCK_FINANCIAL_REFERRALS = [
  {
    id: "ref_1001",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    senderOrgId: "org_northlake",
    receiverOrgId: "org_evergreen",
    status: "Pending",
  },
  {
    id: "ref_1002",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    senderOrgId: "org_evergreen",
    receiverOrgId: "org_sunrise",
    status: "Accepted",
  },
  {
    id: "ref_1003",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    senderOrgId: "org_sunrise",
    receiverOrgId: "org_northlake",
    status: "Rejected",
  },
];

export const MOCK_LEDGER = [
  {
    id: "ldg_001",
    at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    orgId: "org_northlake",
    deltaCents: -500,
    type: "charge",
  },
  {
    id: "ldg_002",
    at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    orgId: "org_evergreen",
    deltaCents: 10,
    type: "sender_bonus",
  },
];

export const MOCK_INVOICES = [
  {
    id: "inv_001",
    number: "INV-001001",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    orgId: "org_northlake",
    orgName: "Northlake Medical Group",
    orgEmail: "info@northlake.org",
    totalCents: 5000,
    emailStatus: "SENT",
  },
  {
    id: "inv_002",
    number: "INV-001002",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    orgId: "org_evergreen",
    orgName: "Evergreen Imaging Center",
    orgEmail: "contact@evergreenimaging.com",
    totalCents: 10000,
    emailStatus: "PENDING",
  },
];
