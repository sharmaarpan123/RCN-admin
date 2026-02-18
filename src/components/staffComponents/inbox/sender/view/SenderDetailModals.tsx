"use client";

import React from "react";
import Modal from "@/components/Modal";
import { ForwardModal } from "@/components/staffComponents/ForwardModal";
import type { Company } from "@/app/staff-portal/inbox/types";
interface DeleteDocModalState {
  kind: "api" | "local";
  label: string;
  index: number;
}

interface SenderDetailModalsProps {
  forwardOpen: boolean;
  onCloseForward: () => void;
  forwardRefId: string | null;
  servicesRequested: { name: string; id: string }[];
  companyDirectory: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (c: Company | null) => void;
  onForward: (company: Company, customServices: string[] | null) => void;
  onAddCompanyAndSelect: (name: string, email: string) => void;

  deleteDocModal: DeleteDocModalState | null;
  onCloseDeleteDoc: () => void;
  onConfirmDeleteDoc: () => void;
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
    </>
  );
}
