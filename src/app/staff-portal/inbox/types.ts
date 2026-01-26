export interface Company {
  name: string;
  email: string;
}

export interface ReceiverInstance {
  receiverId: string;
  name: string;
  email: string;
  status: string;
  paidUnlocked: boolean;
  updatedAt: Date;
  rejectReason: string;
  servicesRequestedOverride?: string[] | null;
}

export interface Doc {
  name: string;
  type: string;
  fileName?: string;
  canDownload: boolean;
}

export interface Comm {
  at: Date;
  who: string;
  msg: string;
}

export interface ChatMsg {
  at: Date;
  fromRole: string;
  fromName: string;
  text: string;
}

export interface Referral {
  id: string;
  sentAt: Date;
  patient: { last: string; first: string; dob: string; gender: string };
  addressOfCare: string;
  servicesRequested: string[];
  insurance: { primary: { name: string; policy: string }; additional: { name: string; policy: string }[] };
  additionalPatientInfo: { phone: string; language: string; rep: string; ssn: string; otherInfo: string };
  docs: Doc[];
  receivers: ReceiverInstance[];
  comms: Comm[];
  chatByReceiver: Record<string, ChatMsg[]>;
}
