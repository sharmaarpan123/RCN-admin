"use client";

import React from "react";
import Modal from "@/components/Modal";
import { ForwardModal } from "@/components/staffComponents/ForwardModal";
import type { Company } from "@/app/staff-portal/inbox/types";
import type { PaymentSummaryData } from "./senderViewHelpers";

interface DeleteDocModalState {
  kind: "api" | "local";
  label: string;
  index: number;
}

interface SenderDetailModalsProps {
  forwardOpen: boolean;
  onCloseForward: () => void;
  forwardRefId: string | null;
  servicesRequested: string[];
  companyDirectory: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (c: Company | null) => void;
  onForward: (company: Company, customServices: string[] | null) => void;
  onAddCompanyAndSelect: (name: string, email: string) => void;

  deleteDocModal: DeleteDocModalState | null;
  onCloseDeleteDoc: () => void;
  onConfirmDeleteDoc: () => void;

  summaryModalOpen: boolean;
  paymentSummary: PaymentSummaryData | null;
  onCloseSummary: () => void;
}

export function SenderDetailModals({
  forwardOpen,
  onCloseForward,
  forwardRefId,
  servicesRequested,
  companyDirectory,
  selectedCompany,
  onSelectCompany,
  onForward,
  onAddCompanyAndSelect,
  deleteDocModal,
  onCloseDeleteDoc,
  onConfirmDeleteDoc,
  summaryModalOpen,
  paymentSummary,
  onCloseSummary,
}: SenderDetailModalsProps) {
  return (
    <>
      <ForwardModal
        isOpen={forwardOpen}
        onClose={onCloseForward}
        refId={forwardRefId}
        servicesRequested={servicesRequested}
        companyDirectory={companyDirectory}
        selectedCompany={selectedCompany}
        onSelectCompany={onSelectCompany}
        onForward={onForward}
        onAddCompanyAndSelect={onAddCompanyAndSelect}
      />

      <Modal isOpen={deleteDocModal !== null} onClose={onCloseDeleteDoc} maxWidth="500px">
        <div className="p-4">
          <h3 className="m-0 text-base font-semibold mb-3 flex items-center gap-2.5">
            <span className="text-2xl">🗑️</span>
            Delete Document
          </h3>
          <p className="m-0 mb-4 text-sm text-rcn-text">
            Are you sure you want to delete the document <strong>&quot;{deleteDocModal?.label}&quot;</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2.5 justify-end">
            <button
              type="button"
              onClick={onCloseDeleteDoc}
              className="border border-slate-200 bg-white text-rcn-text px-4 py-2 rounded-xl font-extrabold text-xs shadow hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmDeleteDoc}
              className="border border-red-200 bg-red-50 text-red-700 px-4 py-2 rounded-xl font-extrabold text-xs shadow hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={summaryModalOpen} onClose={onCloseSummary} maxWidth="560px">
        <div className="p-4">
          <h3 className="m-0 text-base font-semibold mb-3 flex items-center gap-2.5">
            <span className="text-2xl">💳</span>
            Payment Summary
          </h3>
          {paymentSummary ? (
            <div className="text-sm text-rcn-text space-y-3">
              {paymentSummary.referral_id && (
                <div>
                  <span className="text-rcn-muted text-xs font-black">Referral ID</span>
                  <p className="m-0 mt-0.5 font-[850]">{paymentSummary.referral_id}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {typeof paymentSummary.total_recipients === "number" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Recipients</span>
                    <p className="m-0 mt-0.5 font-[850]">{paymentSummary.total_recipients}</p>
                  </div>
                )}
                {typeof paymentSummary.total_departments === "number" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Departments</span>
                    <p className="m-0 mt-0.5 font-[850]">{paymentSummary.total_departments}</p>
                  </div>
                )}
                {paymentSummary.source != null && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Payment by</span>
                    <p className="m-0 mt-0.5 font-[850]">{paymentSummary.source === "free" ? "Receiver pays" : "Sender pays"}</p>
                  </div>
                )}
                {(paymentSummary.amount != null || paymentSummary.currency) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Amount</span>
                    <p className="m-0 mt-0.5 font-[850]">
                      {paymentSummary.currency ? `${paymentSummary.currency} ` : ""}
                      {typeof paymentSummary.amount === "number" ? paymentSummary.amount : "—"}
                    </p>
                  </div>
                )}
              </div>
              {paymentSummary.breakdown?.message && (
                <div className="p-3 rounded-xl bg-rcn-brand/5 border border-rcn-brand/20">
                  <p className="m-0 text-[13px] font-[850] text-rcn-text">{paymentSummary.breakdown.message}</p>
                </div>
              )}
              <p className="m-0 text-rcn-muted text-xs">Next: final payment flow will be integrated here.</p>
            </div>
          ) : (
            <p className="m-0 text-rcn-muted text-sm">No summary data.</p>
          )}
          <div className="flex gap-2.5 justify-end mt-4">
            <button
              type="button"
              onClick={onCloseSummary}
              className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-4 py-2 rounded-xl font-extrabold text-xs shadow hover:bg-rcn-brand/20"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
