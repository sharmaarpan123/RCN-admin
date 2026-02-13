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

/** Raw shape from GET /api/organization/referral/sent — use API data directly in SenderInbox. */
export interface SentReferralApi {
  _id: string;
  is_draft?: boolean;
  sent_at: string | null;
  payment_type?: string | null;
  createdAt?: string;
  updatedAt?: string;
  sender_name?: string;
  facility_name?: string;
  facility_address?: string;
  sender_email?: string;
  sender_phone_number?: string;
  sender_fax_number?: string;
  sender_dial_code?: string;
  speciality_ids?: string[];
  additional_speciality?: { name?: string; user_id?: string; _id?: string }[];
  department_ids?: string[];
  guest_organizations?: unknown[];
  additional_notes?: string;
  patient?: {
    patient_first_name?: string;
    patient_last_name?: string;
    dob?: string;
    gender?: string;
    address_of_care?: string;
  };
  patient_insurance_information?: { payer?: string; policy?: string; plan_group?: string; document?: string }[];
  additional_patient?: Record<string, unknown>;
  documents?: Record<string, unknown>;
  primary_care?: Record<string, unknown>;
  department_statuses?: unknown[];
  /** UI-only: added when user forwards from inbox (not from API). */
  _localReceivers?: ReceiverInstance[];
}

/** GET /api/organization/referral/:id — response data as-is (do not reshape). */
export type ReferralByIdApi = SentReferralApi;

/** Raw shape from GET /api/organization/referral/received — use API data directly in ReceiverInbox. Update when backend response is provided. */
export type ReceivedReferralApi = SentReferralApi;

/** Pagination meta from list APIs (e.g. /referral/sent, /referral/received). */
export interface ReferralListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Response shape from GET /api/organization/referral/sent and /referral/received — data + meta. */
export interface ReferralListResponse<T> {
  data: T[];
  meta: ReferralListMeta;
}
