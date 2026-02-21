"use client";

import type { Company } from "@/app/staff-portal/inbox/types";
import { ForwardModal } from "@/components/staffComponents/ForwardModal";


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


    </>
  );
}
