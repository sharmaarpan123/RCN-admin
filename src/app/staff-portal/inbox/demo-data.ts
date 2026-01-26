import type { Referral, Company } from "./types";

export const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export const DEMO_REFERRALS: Referral[] = [
  {
    id: "REF-10291",
    sentAt: daysAgo(3),
    patient: { last: "Williams", first: "Maria", dob: "1969-04-12", gender: "F" },
    addressOfCare: "Home • 1550 W Lake St, Chicago, IL",
    servicesRequested: ["PT eval", "Skilled Nursing", "Wound Care"],
    insurance: {
      primary: { name: "CountyCare", policy: "CC-7788129" },
      additional: [{ name: "Medicare Part A", policy: "1EG4-XX9-XX11" }],
    },
    additionalPatientInfo: {
      phone: "(312) 555-0912",
      language: "Spanish",
      rep: "Daughter: Ana Williams",
      ssn: "XXX-XX-2388",
      otherInfo: "Prefers afternoon calls; wheelchair at baseline",
    },
    docs: [
      { name: "Discharge Summary", type: "Clinical", canDownload: true },
      { name: "Medication List", type: "Clinical", canDownload: true },
      { name: "Wound Photos", type: "Wound", canDownload: true },
      { name: "Other Documents (Optional)", type: "Other", canDownload: true },
      { name: "Insurance Card (CountyCare)", type: "Insurance", canDownload: true },
    ],
    receivers: [
      { receiverId: "RX-1", name: "Sunrise Home Health", email: "intake@sunrisehh.com", status: "ACCEPTED", paidUnlocked: false, updatedAt: daysAgo(2), rejectReason: "" },
      { receiverId: "RX-2", name: "Green Valley PT", email: "referrals@greenvalleypt.com", status: "PENDING", paidUnlocked: false, updatedAt: daysAgo(3), rejectReason: "" },
      { receiverId: "RX-3", name: "Northside Nursing", email: "intake@northsidenursing.com", status: "REJECTED", paidUnlocked: false, updatedAt: daysAgo(2), rejectReason: "Out of service area" },
    ],
    comms: [
      { at: daysAgo(3), who: "System", msg: "Referral sent to 3 receivers (bulk). Each receiver can only view their own copy." },
      { at: daysAgo(2), who: "Sunrise Home Health", msg: "Accepted (pending payment to unlock additional info)." },
      { at: daysAgo(2), who: "Northside Nursing", msg: "Rejected: Out of service area." },
    ],
    chatByReceiver: {
      "RX-1": [
        { at: daysAgo(2), fromRole: "RECEIVER", fromName: "Sunrise Home Health", text: "We can likely accept. Do you have any additional wound measurements?" },
        { at: daysAgo(2), fromRole: "SENDER", fromName: "Sender", text: "Yes—see Wound Photos and Discharge Summary. Let me know if you need anything else." },
      ],
      "RX-2": [],
      "RX-3": [],
    },
  },
];

export const DEMO_COMPANIES: Company[] = [
  { name: "Sunrise Home Health", email: "intake@sunrisehh.com" },
  { name: "Green Valley PT", email: "referrals@greenvalleypt.com" },
  { name: "Northside Nursing", email: "intake@northsidenursing.com" },
  { name: "Lakeview Hospice", email: "intake@lakeviewhospice.com" },
  { name: "Citywide Imaging", email: "orders@citywideimaging.com" },
];

export const RECEIVER_CTX = { receiverId: "RX-1", receiverName: "Sunrise Home Health" };
