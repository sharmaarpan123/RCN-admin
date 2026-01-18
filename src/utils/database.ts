// Database utilities for localStorage management
const LS_KEY = "rcn_demo_v6";
const SESSION_KEY = "rcn_session_v6";

export const US_STATES = [
  "","AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT",
  "NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

export const PAY_METHODS = [
  { key:"creditCard",   label:"Credit Card" },
  { key:"debitCard",    label:"Debit Card" },
  { key:"applePay",     label:"Apple Pay" },
  { key:"paypal",       label:"PayPal" },
  { key:"googlePay",    label:"Google Pay" },
  { key:"bankTransfer", label:"Bank Transfer" },
  { key:"ach",          label:"ACH" }
];

export const MODULE_PERMS = {
  dashboard: "referralDashboard",
  userpanel: "userPanel",
  payments: "paymentAdjustmentSettings",
  banners: "bannerManagement",
  financials: "financials",
  reports: "reports",
  audit: "auditLog",
  settings: "settings"
};

// Helper functions
export const nowISO = () => new Date().toISOString();

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const uid = (prefix = "id") => {
  return prefix + "_" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
};

export const safeLower = (s: any) => (s || "").toString().toLowerCase();

export const escapeHtml = (str: any) => {
  return (str || "").toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
};

export const escapeAttr = (str: any) => {
  return (str || "").toString()
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
};

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = {year:"numeric", month:"short", day:"2-digit"};
  return d.toLocaleDateString(undefined, opts);
};

export const moneyToCents = (v: number | string) => Math.round((parseFloat(String(v || "0")) || 0) * 100);
export const centsToMoney = (c: number) => (Math.round(c || 0) / 100).toFixed(2);

// Default payment settings
export const defaultPaymentSettings = () => ({
  version: 4,
  methods: {
    creditCard: true,
    debitCard: true,
    applePay: true,
    paypal: true,
    googlePay: true,
    bankTransfer: false,
    ach: false
  },
  fees: {
    serviceFee: 5.00,
    processingByMethod: {
      creditCard: 0.00,
      debitCard: 0.00,
      applePay: 0.00,
      paypal: 0.00,
      googlePay: 0.00,
      bankTransfer: 0.00,
      ach: 0.00
    }
  },
  bonus: {
    senderPerReceiverPaid: 0.10,
    applyToAllSenders: true,
    bulkThreshold: 10,
    bulkDiscountPct: 10
  },
  invoice: {
    autoEmail: true
  }
});

// Default banner SVG
export const defaultBannerSvgData = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="250">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#0b3b24"/>
        <stop offset="1" stop-color="#18a05f"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="18" fill="url(#g)"/>
    <text x="50%" y="46%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#ffffff" font-weight="700">RCN Banner</text>
    <text x="50%" y="62%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#eafff3">Advertising / Announcement</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
};

// LocalStorage functions
export const loadDB = () => {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const saveDB = (db: any) => {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
};

export const getSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const setSession = (sess: any) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Audit logging
export const audit = (action: string, meta: any = {}) => {
  const db = getDB();
  const sess = getSession();
  db.audit.unshift({ 
    id: uid("audit"), 
    at: nowISO(), 
    who: sess?.email || "unknown", 
    action, 
    meta 
  });
  saveDB(db);
};

// Seed demo data
export const seedDemo = () => {
  const org1 = {
    id: "org_northlake", 
    name: "Northlake Medical Group",
    phone: "(312) 555-1200", 
    email: "info@northlake.org",
    ein: "12-3456789",
    contact: {
      first: "Maya", 
      last: "Singh", 
      email: "maya@northlake.org", 
      tel: "(312) 555-1201", 
      fax: "(312) 555-1299"
    },
    address: {
      street: "1200 W Lake St", 
      suite: "Suite 200", 
      city: "Chicago", 
      state: "IL", 
      zip: "60601"
    },
    enabled: true,
    walletCents: 0,
    referralCredits: 0
  };

  const org2 = {
    id: "org_evergreen", 
    name: "Evergreen Imaging Center",
    phone: "(630) 555-4400", 
    email: "contact@evergreenimaging.com",
    ein: "98-7654321",
    contact: {
      first: "Jon", 
      last: "Hernandez", 
      email: "jon@evergreenimaging.com", 
      tel: "(630) 555-4401", 
      fax: "(630) 555-4499"
    },
    address: {
      street: "4550 Greenleaf Ave", 
      suite: "", 
      city: "Naperville", 
      state: "IL", 
      zip: "60563"
    },
    enabled: true,
    walletCents: 0,
    referralCredits: 0
  };

  const org3 = {
    id: "org_sunrise", 
    name: "Sunrise Specialty Clinic",
    phone: "(713) 555-7700", 
    email: "hello@sunriseclinic.com",
    ein: "23-4567890",
    contact: {
      first: "Aisha", 
      last: "Khan", 
      email: "aisha@sunriseclinic.com", 
      tel: "(713) 555-7701", 
      fax: "(713) 555-7799"
    },
    address: {
      street: "99 Bayou Blvd", 
      suite: "Ste 12", 
      city: "Houston", 
      state: "TX", 
      zip: "77002"
    },
    enabled: true,
    walletCents: 0,
    referralCredits: 0
  };

  const branches = [
    {id:"br_northlake_main", orgId:org1.id, name:"Main", enabled:true},
    {id:"br_northlake_west", orgId:org1.id, name:"West", enabled:true},
    {id:"br_evergreen_main", orgId:org2.id, name:"Main", enabled:true},
    {id:"br_sunrise_main", orgId:org3.id, name:"Main", enabled:true}
  ];

  const depts = [
    {id:"dp_northlake_cardio", orgId:org1.id, branchId:"br_northlake_main", name:"Cardiology", enabled:true},
    {id:"dp_northlake_pulm", orgId:org1.id, branchId:"br_northlake_west", name:"Pulmonology", enabled:true},
    {id:"dp_evergreen_mri", orgId:org2.id, branchId:"br_evergreen_main", name:"MRI", enabled:true},
    {id:"dp_sunrise_ortho", orgId:org3.id, branchId:"br_sunrise_main", name:"Orthopedics", enabled:true}
  ];

  const users = [
    {
      id:"u_sysadmin", 
      email:"sysadmin@rcn.local",
      firstName:"System", 
      lastName:"Admin", 
      name:"System Admin",
      phone:"", 
      notes:"",
      role:"SYSTEM_ADMIN", 
      adminCap:true, 
      orgId:null,
      resetIntervalDays:30, 
      mfaEmail:true, 
      enabled:true,
      password:"Admin123!", 
      forceChangeNextLogin:false, 
      passwordChangedAt:daysAgo(10),
      permissions:{
        referralDashboard: true, 
        userPanel: true, 
        paymentAdjustmentSettings: true, 
        bannerManagement: true,
        financials: true, 
        reports: true, 
        auditLog: true, 
        settings: true
      },
      branchIds:[], 
      deptIds:[]
    },
    {
      id:"u_orgadmin_nl", 
      email:"orgadmin@northlake.org",
      firstName:"Org", 
      lastName:"Admin", 
      name:"Org Admin (Northlake)",
      phone:"", 
      notes:"Northlake organization admin user.",
      role:"ORG_ADMIN", 
      adminCap:true, 
      orgId:org1.id,
      resetIntervalDays:60, 
      mfaEmail:false, 
      enabled:true,
      password:"Admin123!", 
      forceChangeNextLogin:false, 
      passwordChangedAt:daysAgo(15),
      permissions:{
        referralDashboard: true, 
        userPanel: false, 
        paymentAdjustmentSettings: true, 
        bannerManagement: true,
        financials: false, 
        reports: true, 
        auditLog: false, 
        settings: false
      },
      branchIds:[], 
      deptIds:[]
    },
    {
      id:"u_staff_nl", 
      email:"staff@northlake.org",
      firstName:"Staff", 
      lastName:"User", 
      name:"Staff (Northlake)",
      phone:"", 
      notes:"",
      role:"STAFF", 
      adminCap:false, 
      orgId:org1.id,
      resetIntervalDays:90, 
      mfaEmail:false, 
      enabled:true,
      password:"Admin123!", 
      forceChangeNextLogin:false, 
      passwordChangedAt:daysAgo(20),
      permissions:{
        referralDashboard: true, 
        userPanel: false, 
        paymentAdjustmentSettings: false, 
        bannerManagement: false,
        financials: false, 
        reports: false, 
        auditLog: false, 
        settings: false
      },
      branchIds:["br_northlake_main"], 
      deptIds:["dp_northlake_cardio"]
    }
  ];

  const referrals = [
    {
      id:"ref_1001", 
      createdAt:daysAgo(1),
      senderOrgId:org1.id, 
      receiverOrgId:org2.id,
      branchId:"br_northlake_main", 
      deptId:"dp_northlake_cardio",
      payOption:"SENDER_PAYS",
      patient:{
        last:"Garcia", 
        first:"Elena", 
        dob:"1956-04-08", 
        gender:"F",
        addressOfCare:"123 W Madison St, Chicago, IL 60602",
        phone:"(312) 555-0101",
        primaryLanguage:"English",
        ssn:"123-45-6789",
        representative:"Daughter: Maria Garcia (POA)",
        otherInfo:"Chronic cough x 3 months. Needs imaging urgently."
      },
      servicesData:{
        requested:["CT Chest w/ contrast","Pulmonology consult"],
        otherServices:"",
        otherInformation:"Chronic cough, rule out mass."
      },
      services:"CT Chest w/ contrast; Pulmonology consult",
      insurance:{
        primary:{
          payer:"Medicare",
          policy:"1EG4-TE5-MK72",
          plan:"Part A/B",
          documents:[]
        },
        additional:[]
      },
      attachments:{
        faceSheet:[], medicationList:[], dischargeSummary:[], woundPhotos:[],
        signedOrder:[], historyPhysical:[], progressNote:[], otherDocuments:[]
      },
      pcp:{
        name:"John Smith, MD",
        address:"45 N Michigan Ave, Chicago, IL 60602",
        tel:"(312) 555-2200",
        fax:"(312) 555-2299",
        email:"jsmith@primarycare.example",
        npi:"1234567890"
      },
      receiverUnlock:{ unlocked:true, unlockedAt:daysAgo(1), unlockedBy:"u_orgadmin_nl" },
      chat:{
        unlocked:true,
        messages:[
          {ts:daysAgo(1), from:"sender", who:"orgadmin@northlake.org", text:"Referral sent. Please confirm you can accept CT Chest w/ contrast within 48 hours."}
        ]
      },
      billing:{ senderSendCharged:false, receiverOpenCharged:false, senderUsedCredit:false, receiverUsedCredit:false },
      status:"Pending",
      notes:"Chronic cough, rule out mass."
    }
  ];

  const banners = [{
    id:"banner_rcn",
    name:"RCN Sponsored Banner",
    placement:"RIGHT_SIDEBAR",
    scope:"GLOBAL",
    orgId:null,
    active:true,
    startAt:"",
    endAt:"",
    imageData: defaultBannerSvgData(),
    imageUrl:"",
    linkUrl:"",
    alt:"RCN Banner",
    notes:"",
    createdAt: nowISO(),
    createdBy:"system",
    updatedAt: nowISO(),
    updatedBy:"system"
  }];

  const db = { 
    orgs:[org1, org2, org3], 
    branches, 
    depts, 
    users, 
    referrals, 
    banners, 
    audit:[], 
    paymentSettings: defaultPaymentSettings(),
    finance: { ledger:[], pairCounts:{}, invoices:[], invoiceSeq:1000 }
  };
  
  saveDB(db);
  clearSession();
  return db;
};

// Normalize database for backward compatibility
export const normalizeDB = (db: any) => {
  let changed = false;

  if (!db.banners || !Array.isArray(db.banners)) { 
    db.banners = []; 
    changed = true; 
  }

  if (!db.finance) {
    db.finance = { ledger:[], pairCounts:{}, invoices:[], invoiceSeq:1000 };
    changed = true;
  }

  if (!db.paymentSettings) {
    db.paymentSettings = defaultPaymentSettings();
    changed = true;
  }

  // Normalize orgs
  (db.orgs || []).forEach((o: any) => {
    if (typeof o.walletCents !== "number") { o.walletCents = 0; changed = true; }
    if (typeof o.referralCredits !== "number") { o.referralCredits = 0; changed = true; }
  });

  // Normalize referrals
  (db.referrals || []).forEach((r: any) => {
    if (r.status === "Sent") { r.status = "Pending"; changed = true; }
    if (r.status === "Declined") { r.status = "Rejected"; changed = true; }
    if (r.status === "Completed") { r.status = "Accepted"; changed = true; }
    
    if (!r.billing) {
      r.billing = { senderSendCharged:false, receiverOpenCharged:false, senderUsedCredit:false, receiverUsedCredit:false };
      changed = true;
    }
  });

  // Normalize users
  (db.users || []).forEach((u: any) => {
    if (!u.firstName || !u.lastName) {
      const parts = (u.name || "").split(/\s+/);
      u.firstName = u.firstName || parts[0] || "";
      u.lastName = u.lastName || parts.slice(1).join(" ") || "";
      changed = true;
    }
    
    if (!u.permissions) {
      u.permissions = defaultPermissionsForUser(u.role, u.adminCap);
      changed = true;
    }

    if (u.role === "SYSTEM_ADMIN") {
      if (u.orgId) { u.orgId = null; changed = true; }
      if ((u.branchIds || []).length) { u.branchIds = []; changed = true; }
      if ((u.deptIds || []).length) { u.deptIds = []; changed = true; }
    }
  });

  if (changed) saveDB(db);
  return db;
};

// Get database with initialization
export const getDB = () => {
  let db = loadDB();
  if (!db) db = seedDemo();
  return normalizeDB(db);
};

// Default permissions helper
export const defaultPermissionsForUser = (role: string, adminCap: boolean) => {
  if (role === "SYSTEM_ADMIN") {
    return { 
      referralDashboard:true, userPanel:true, paymentAdjustmentSettings:true, 
      bannerManagement:true, financials:true, reports:true, auditLog:true, settings:true 
    };
  }
  if (role === "ORG_ADMIN") {
    return {
      referralDashboard:true, userPanel:false, 
      paymentAdjustmentSettings: !!adminCap, bannerManagement: !!adminCap,
      financials: false, reports: true, auditLog: !!adminCap, settings: false
    };
  }
  return {
    referralDashboard:true, userPanel:false, paymentAdjustmentSettings:false, 
    bannerManagement:false, financials:false, reports:false, auditLog:false, settings:false
  };
};

// Role label helper
export const roleLabel = (r: string) => {
  if (r === "SYSTEM_ADMIN") return "System Admin";
  if (r === "ORG_ADMIN") return "Organization Admin";
  if (r === "STAFF") return "Staff";
  return r;
};

// Download file helper
export const downloadFile = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; 
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
