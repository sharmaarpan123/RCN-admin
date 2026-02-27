"use client";

import {
  getOrganizationReferralByIdApi,
  getPaymentMethodsActiveApi,
  patchOrganizationReferralDepartmentStatusApi,
  postOrganizationReferralDepartmentPayApi,
  postOrganizationReferralDepartmentPaymentSummaryApi,
} from "@/apis/ApiCalls";
import {
  fmtDate,
  pillClass,
  scrollToId,
} from "@/app/staff-portal/inbox/helpers";
import type {
  ReferralByIdApi,
  DepartmentStatus,
} from "@/app/staff-portal/inbox/types";
import { Button, StripeCardModal } from "@/components";
import {
  ReceiverAdditionalSection,
  ReceiverBasicSection,
  ReceiverChatSection,
  ReceiverDocsSection,
  ReceiverPrimaryCareSection,
  ReceiverSenderInfoSection,
} from "@/components/staffComponents/inbox/receiver/view";
import type { PaymentSummaryData } from "@/components/staffComponents/inbox/receiver/view/Modals";
import {
  PayToUnlockModal,
  PaymentSummaryModal,
} from "@/components/staffComponents/inbox/receiver/view/Modals";
import { documentsToList } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { catchAsync, checkResponse, downloadFile } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { toastError } from "@/utils/toast";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useRef, useState } from "react";
import { useStaffAuthLoginUser } from "@/store/slices/Auth/hooks";
import PrintIcon from "@/assets/svg/PrintIcon.jsx";

export type department_status_type =
  | {
    department_id?: string;
    department?: { _id?: string; name?: string };
    status?: "pending" | "active" | "rejected";
    payment_status?: "paid" | "not_paid";
    is_paid_by_sender?: number;
  }
  | undefined;

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;
const EXCLUDED_PAYMENT_KEYS = ["apple", "google"];
const CARD_KEY = "card";

export default function ReceiverDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string | undefined;

  const { data: apiData, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.referralReceivedList, "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getOrganizationReferralByIdApi(id);
      if (!checkResponse({ res })) return null;
      const data = (res.data as { data?: ReferralByIdApi })?.data;
      return data ?? null;
    },
    enabled: !!id,
  });

  const chatBodyRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto p-[18px]">
        <div className="py-10 text-center text-rcn-muted">
          Loading referral…
        </div>
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="max-w-[1280px] mx-auto p-[18px]">
        <div className="py-10 text-center">
          <h2 className="text-lg font-semibold mb-2">Referral not found</h2>
          <Link
            href="/staff-portal/inbox"
            className="text-rcn-brand hover:underline"
          >
            Back to Inbox
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ReceiverDetailContent key={id} data={apiData} chatBodyRef={chatBodyRef} />
  );
}

const btn = (
  onClick: () => void,
  label: string,
  primary = true,
  disabled = false,
) => (
  <Button
    key={label}
    type="button"
    variant={primary ? "primary" : "danger"}
    size="sm"
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </Button>
);


function ReceiverDetailContent({
  data,
  chatBodyRef,
}: {
  data: ReferralByIdApi;
  chatBodyRef: React.RefObject<HTMLDivElement | null>;
}) {
  const queryClient = useQueryClient();
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paySource, setPaySource] = useState<"credit" | "payment">("payment");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState<PaymentSummaryData | null>(null);
  const [stripeOpen, setStripeOpen] = useState(false);
  const [stripePmId, setStripePmId] = useState("");
  const { loginUser } = useStaffAuthLoginUser();
  console.log(loginUser, "loginUser")
  const refId = data._id;

  const receiverDepartmentIds = loginUser?.user_departments?.map((d) => d._id) ?? [];








  const department_status = data.department_statuses?.find((d: DepartmentStatus) => receiverDepartmentIds.includes(d.department_id ?? "")) as department_status_type;

  const receiverId =
    department_status?.department_id ??
    department_status?.department?._id ??
    null;
  const senderPaid = department_status?.is_paid_by_sender === 1;
  const isUnlocked = department_status?.payment_status === "paid";



  const { data: methodsList } = useQuery({
    queryKey: defaultQueryKeys.paymentMethodsActive,
    queryFn: async () => {
      const res = await getPaymentMethodsActiveApi();
      if (!checkResponse({ res })) return [];
      const raw = res.data as {
        data?: { id: string; name: string; key: string }[];
      };
      const list = Array.isArray(raw?.data) ? raw.data : [];
      return list
        .filter((m) => !EXCLUDED_PAYMENT_KEYS.includes(m.key))
        .map((m) => ({ id: m.id, name: m.name, key: m.key }));
    },
    enabled: payModalOpen && paySource === "payment",
  });

  const methods = Array.isArray(methodsList) ? methodsList : [];
  const selectedMethod = methods.find((m) => m.id === selectedPaymentMethodId);
  const isCard = selectedMethod?.key === CARD_KEY;

  const closePayModals = () => {
    setPayModalOpen(false);
    setSummaryOpen(false);
    setStripeOpen(false);
    setSelectedPaymentMethodId("");
    setPaySource("payment");
    setSummary(null);
  };

  const { isPending: summaryLoading, mutate: getSummary } = useMutation({
    mutationFn: catchAsync(async (pmId: string) => {
      if (!receiverId) return;
      const res = await postOrganizationReferralDepartmentPaymentSummaryApi(
        refId,
        receiverId,
        {
          source: "payment",
          payment_method_id: pmId,
        },
      );
      if (!checkResponse({ res, showSuccess: true })) return;
      const raw = res.data as { data?: PaymentSummaryData };
      setSummary(raw?.data ?? null);
      setStripePmId(pmId);

      setSummaryOpen(true);
    }),
  });

  const { isPending: payLoading, mutate: pay } = useMutation({
    mutationFn: catchAsync(
      async (payload: {
        source: "credit" | "payment";
        payment_method_id?: string;
      }) => {
        if (!receiverId) return;
        const res = await postOrganizationReferralDepartmentPayApi(
          refId,
          receiverId,
          payload,
        );
        const needsStripe =
          payload.source === "payment" && payload.payment_method_id;
        if (!checkResponse({ res, showSuccess: !needsStripe })) return;
        const resData = (res.data as { data?: { client_secret?: string } })
          ?.data;
        if (
          needsStripe &&
          resData?.client_secret &&
          payload.payment_method_id
        ) {
          const stripe = await stripePromise;
          if (!stripe) {
            toastError("Stripe is not configured.");
            return;
          }
          const { error } = await stripe.confirmCardPayment(
            resData.client_secret,
            {
              payment_method: payload.payment_method_id,
            },
          );
          if (error) {
            toastError(error.message ?? "Payment confirmation failed.");
            return;
          }
        }
        closePayModals();
        queryClient.invalidateQueries({
          queryKey: [...defaultQueryKeys.referralReceivedList, "detail", refId],
        });
        queryClient.invalidateQueries({
          queryKey: defaultQueryKeys.referralReceivedList,
        });
      },
    ),
  });

  const openPayModal = () => setPayModalOpen(true);

  const onPayModalAction = () => {
    if (paySource === "credit") {
      pay({ source: "credit" });
      return;
    }
    if (!selectedPaymentMethodId.trim()) {
      toastError("Please select a payment method.");
      return;
    }
    if (isCard) {
      setStripeOpen(true);
      return;
    }
  };

  const onSummaryConfirm = () => {
    pay({ source: "payment", payment_method_id: stripePmId });
  };

  const onStripeDone = (pmId: string) => {
    setStripeOpen(false);
    getSummary(pmId);
  };
  const closeSummary = () => {
    setSummaryOpen(false);
    setSummary(null);
    setStripeOpen(false);
  };
  const payBusy = summaryLoading || payLoading;

  const revalidateReferral = () => {
    queryClient.invalidateQueries({
      queryKey: [...defaultQueryKeys.referralReceivedList, "detail", refId],
    });
    queryClient.invalidateQueries({
      queryKey: defaultQueryKeys.referralReceivedList,
    });
  };

  const { isPending: statusLoading, mutate: setDepartmentStatus } = useMutation(
    {
      mutationFn: catchAsync(async (status: "active" | "rejected") => {
        if (!receiverId) return;
        const res = await patchOrganizationReferralDepartmentStatusApi(
          refId,
          receiverId,
          { status },
        );
        if (!checkResponse({ res, showSuccess: true })) return;
        revalidateReferral();
      }),
    },
  );

  const receiverReject = () => {
    if (!receiverId) return;
    setDepartmentStatus("rejected");
  };

  const receiverAccept = () => {
    if (!receiverId) return;
    setDepartmentStatus("active");
  };



  const p = data.patient ?? {};
  const ins = data.patient_insurance_information ?? [];
  const primary = ins[0];
  const addPatient = (data.additional_patient ?? {}) as Record<string, string>;
  const sentAt = data.sent_at
    ? new Date(data.sent_at)
    : new Date(data.createdAt ?? 0);
  const servicesForDisplay = data.speciality_ids ?? [];

  const docList = documentsToList(
    data.documents as Record<string, unknown> | undefined,
  );

  const primaryCare = (data.primary_care ?? {}) as Record<string, string | undefined>;
  const hasPrimaryCare = Boolean(
    primaryCare.name ||
    primaryCare.address ||
    primaryCare.phone_number ||
    primaryCare.email ||
    primaryCare.fax ||
    primaryCare.npi,
  );

  const navBtns = [
    { id: "secSenderInfo", label: "Sender Info" },
    { id: "secBasic", label: "Basic Info" },
    { id: "secDocs", label: "Documents" },
    { id: "secAdditional", label: "Additional Info" },
    ...(hasPrimaryCare ? [{ id: "secPrimaryCare", label: "Primary Care" }] : []),
    { id: "secChat", label: "Chat" },
  ];


  const downloadPdfHandler = async (data: ReferralByIdApi) => {
    downloadFile(data?.pdf_export_url ?? "");
  };

  return (
    <div className="max-w-[1280px] mx-auto p-[18px]">
      <div className="flex flex-wrap gap-3 items-center justify-between p-3.5 px-4 border border-slate-200 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] sticky top-2.5 z-10 mb-3.5">
        <div className="flex items-center justify-between gap-2.5">
          <Link
            href="/staff-portal/inbox"
            className="text-rcn-brand hover:underline text-sm font-semibold"
          >
            ← Back to Inbox
          </Link>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="primary" size="sm" onClick={() => downloadPdfHandler(data)}>
            <PrintIcon size={24} />

          </Button>

          {department_status?.status === "pending" && senderPaid ? (
            <>
              {btn(receiverAccept, "Accept", true, statusLoading)}
              {btn(receiverReject, "Reject", false, statusLoading)}
            </>
          ) : department_status?.payment_status === "paid" &&
            department_status?.status === "active" ? (
            <span
              key="paid"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5
                      rounded-full text-[11px] font-black border ${pillClass("PAID")}`}
            >
              Paid/Unlocked
            </span>
          ) : department_status?.status === "rejected" ? (
            <span
              key="rej"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("REJECTED")}`}
            >
              Rejected
            </span>
          ) : null}
        </div>
      </div>

      <div className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">
            Referral Detail
          </h2>
          <p className="m-0 mt-1 text-rcn-muted text-xs font-semibold">
            Receiver view: chat is free. Patient information requires payment —
            payment flow will be added soon.
          </p>
        </div>
        <div className="p-3 overflow-auto">
          <div className="flex flex-wrap gap-3 items-start justify-between p-3.5 rounded-2xl border border-rcn-brand/20 bg-white/95 shadow-[0_12px_26px_rgba(2,6,23,.07)] mb-3">
            <div>
              <h3 className="m-0 text-[15px] font-semibold tracking-wide">
                {isUnlocked &&
                  p &&
                  (p.patient_last_name != null || p.patient_first_name != null)
                  ? ` ${p.patient_last_name ?? ""}, ${p.patient_first_name ?? ""} • DOB ${p.dob ?? ""} • ${p.gender ?? ""}`
                  : "  Referral (pay to view patient details)"}
              </h3>
              <p className="m-0 mt-1.5 text-rcn-muted text-xs font-semibold">
                Sent: {fmtDate(sentAt)}
                {senderPaid && p?.address_of_care != null
                  ? ` • Address of Care: ${p.address_of_care}`
                  : ""}
              </p>
            </div>
          </div>

          <div
            className="border border-rcn-brand/20 rounded-2xl bg-white/95 shadow-[0_12px_26px_rgba(2,6,23,.07)] p-2.5 sticky top-[86px] z-4 mb-3"
            aria-label="Quick Jump Navigation"
          >
            <div className="flex items-center justify-between gap-2.5 mb-2">
              <strong className="text-xs tracking-wide">Quick Jump</strong>
              <span className="text-[11px] text-rcn-muted font-extrabold">
                Jump to any section
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {navBtns.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => scrollToId(b.id)}
                  className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-rcn-brand/20 bg-rcn-brand/10 text-rcn-accent-dark font-black text-xs shadow-[0_8px_16px_rgba(2,6,23,.05)] hover:border-rcn-brand/30 hover:bg-rcn-brand/10"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-linear-to-b from-rcn-brand/85 to-rcn-brand-light/75 shadow-[0_6px_12px_rgba(15,107,58,.18)]"
                    aria-hidden
                  />
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <ReceiverSenderInfoSection
              data={{
                sender_name: data.sender_name,
                facility_name: data.facility_name,
                facility_address: data.facility_address,
                sender_email: data.sender_email,
                sender_phone_number: data.sender_phone_number,
                sender_fax_number: data.sender_fax_number,
                sender_dial_code: data.sender_dial_code,
              }}
            />
            <ReceiverBasicSection
              isUnlocked={isUnlocked}
              receiverStatus={department_status?.status ?? "pending"}
              patient={p}
              primaryInsurance={primary}
              additionalInsurances={ins}
              servicesForDisplay={servicesForDisplay}
              onPayUnlock={openPayModal}
              onReject={receiverReject}
            />
            <ReceiverDocsSection
              isUnlocked={isUnlocked}
              receiverStatus={department_status?.status ?? "pending"}
              docList={docList}
              onPayUnlock={openPayModal}
            />
            <ReceiverAdditionalSection
              department_status={department_status}
              isUnlocked={isUnlocked}
              addPatient={addPatient}
              senderPaid={senderPaid}
              onAccept={receiverAccept}
              onReject={receiverReject}
              openPayModal={openPayModal}
            />
            <ReceiverPrimaryCareSection
              isUnlocked={isUnlocked}
              primaryCare={primaryCare}
              openPayModal={openPayModal}
            />
            <ReceiverChatSection
              referralId={refId}
              localMessages={[]}
              chatBodyRef={chatBodyRef}
            />
          </div>

          <PayToUnlockModal
            isOpen={payModalOpen}
            onClose={closePayModals}
            paySource={paySource}
            onPaySourceChange={setPaySource}
            paymentMethodId={selectedPaymentMethodId}
            onPaymentMethodChange={setSelectedPaymentMethodId}
            methods={methods}
            busy={payBusy}
            payLoading={payLoading}
            summaryLoading={summaryLoading}
            onAction={onPayModalAction}
          />
          <PaymentSummaryModal
            isOpen={summaryOpen}
            onClose={closeSummary}
            summary={summary}
            payLoading={payLoading}
            onConfirm={onSummaryConfirm}
          />
          <StripeCardModal
            isOpen={stripeOpen}
            onClose={() => setStripeOpen(false)}
            onSuccess={onStripeDone}
            isSubmitting={payLoading}
          />
        </div>
      </div>
    </div>
  );
}
