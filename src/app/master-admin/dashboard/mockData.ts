// Mock data for Dashboard
export const MOCK_ORGS_DASHBOARD = [
  {
    id: "org_northlake",
    name: "Northlake Medical Group",
    phone: "(312) 555-1200",
    email: "info@northlake.org",
    enabled: true,
    address: {
      street: "1200 W Lake St",
      city: "Chicago",
      state: "IL",
      zip: "60601",
    },
  },
  {
    id: "org_evergreen",
    name: "Evergreen Imaging Center",
    phone: "(630) 555-4400",
    email: "contact@evergreenimaging.com",
    enabled: true,
    address: {
      street: "4550 Greenleaf Ave",
      city: "Naperville",
      state: "IL",
      zip: "60563",
    },
  },
  {
    id: "org_sunrise",
    name: "Sunrise Specialty Clinic",
    phone: "(713) 555-7700",
    email: "hello@sunriseclinic.com",
    enabled: true,
    address: {
      street: "99 Bayou Blvd",
      city: "Houston",
      state: "TX",
      zip: "77002",
    },
  },
];

export const MOCK_REFERRALS_DASHBOARD = [
  {
    id: "ref_1001",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    senderOrgId: "org_northlake",
    receiverOrgId: "org_evergreen",
    status: "Pending",
    patient: {
      last: "Garcia",
      first: "Elena",
      dob: "1956-04-08",
      gender: "F",
    },
    insurance: {
      primary: {
        payer: "Medicare",
        policy: "1EG4-TE5-MK72",
      },
    },
    services: "CT Chest w/ contrast; Pulmonology consult",
    servicesData: {
      requested: ["CT Chest w/ contrast", "Pulmonology consult"],
      otherInformation: "Chronic cough, rule out mass.",
    },
    notes: "Chronic cough, rule out mass.",
    billing: {
      senderSendCharged: false,
      receiverOpenCharged: false,
      senderUsedCredit: false,
      receiverUsedCredit: false,
    },
  },
  {
    id: "ref_1002",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    senderOrgId: "org_evergreen",
    receiverOrgId: "org_sunrise",
    status: "Accepted",
    patient: {
      last: "Johnson",
      first: "Michael",
      dob: "1972-11-15",
      gender: "M",
    },
    insurance: {
      primary: {
        payer: "Blue Cross",
        policy: "BC-789-456",
      },
    },
    services: "Orthopedic consultation",
    servicesData: {
      requested: ["Orthopedic consultation"],
      otherInformation: "Knee pain assessment",
    },
    notes: "Knee pain assessment",
    billing: {
      senderSendCharged: false,
      receiverOpenCharged: true,
      senderUsedCredit: false,
      receiverUsedCredit: true,
    },
  },
  {
    id: "ref_1003",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    senderOrgId: "org_sunrise",
    receiverOrgId: "org_northlake",
    status: "Rejected",
    patient: {
      last: "Williams",
      first: "Sarah",
      dob: "1985-03-22",
      gender: "F",
    },
    insurance: {
      primary: {
        payer: "Aetna",
        policy: "AET-123-789",
      },
    },
    services: "Cardiology assessment",
    servicesData: {
      requested: ["Cardiology assessment"],
      otherInformation: "Chest pain evaluation",
    },
    notes: "Chest pain evaluation",
    billing: {
      senderSendCharged: false,
      receiverOpenCharged: false,
      senderUsedCredit: false,
      receiverUsedCredit: false,
    },
  },
];

export const MOCK_PAYMENT_SETTINGS = {
  fees: {
    serviceFee: 5.0,
  },
};
