"use client";

import React, { useState, useEffect } from "react";
import {
  AddReceiverModal,
  AdditionalDetailsSection,
  AttachmentsSection,
  FormActionsSection,
  InsuranceInfoSection,
  NewReferralNav,
  PatientInfoSection,
  PcpInfoSection,
  SelectReceiverSection,
  SenderFormHeader,
  SenderInfoSection,
  ServicesRequestedSection,
  AVAILABLE_SERVICES,
  DEMO_RECEIVERS,
  type InsuranceBlock,
  type Receiver,
} from "@/components/staffComponents/newReferral";

const SECTION_IDS = [
  "sender-form",
  "sender-info",
  "select-receiver",
  "services-requested",
  "patient-info",
  "insurance-info",
  "additional-details",
  "attachments",
  "pcp-info",
  "form-actions",
];

export default function NewReferralPage() {
  const [receivers, setReceivers] = useState<Receiver[]>(DEMO_RECEIVERS);
  const [stateFilter, setStateFilter] = useState("ALL");
  const [receiverSearch, setReceiverSearch] = useState("");
  const [selectedReceivers, setSelectedReceivers] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>(AVAILABLE_SERVICES);
  const [requestedServices, setRequestedServices] = useState<string[]>([]);
  const [insuranceBlocks, setInsuranceBlocks] = useState<InsuranceBlock[]>([
    { id: 1, payer: "", policy: "", planGroup: "" },
    { id: 2, payer: "", policy: "", planGroup: "" },
  ]);
  const [insuranceCount, setInsuranceCount] = useState(2);
  const [receiverModalOpen, setReceiverModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("sender-form");

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [addressOfCare, setAddressOfCare] = useState("");
  const [primaryPayer, setPrimaryPayer] = useState("");
  const [primaryPolicy, setPrimaryPolicy] = useState("");
  const [primaryPlanGroup, setPrimaryPlanGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("");
  const [ssn, setSsn] = useState("");
  const [representative, setRepresentative] = useState("");
  const [otherInfo, setOtherInfo] = useState("");
  const [otherServices, setOtherServices] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [pcpName, setPcpName] = useState("");
  const [pcpAddress, setPcpAddress] = useState("");
  const [pcpTel, setPcpTel] = useState("");
  const [pcpFax, setPcpFax] = useState("");
  const [pcpEmail, setPcpEmail] = useState("");
  const [pcpNpi, setPcpNpi] = useState("");

  const [selectedAvailableReceivers, setSelectedAvailableReceivers] = useState<string[]>([]);
  const [selectedSelectedReceivers, setSelectedSelectedReceivers] = useState<string[]>([]);
  const [selectedAvailableServices, setSelectedAvailableServices] = useState<string[]>([]);
  const [selectedRequestedServices, setSelectedRequestedServices] = useState<string[]>([]);

  const filteredReceivers = receivers
    .filter((r) => stateFilter === "ALL" || r.state === stateFilter)
    .filter((r) => !selectedReceivers.includes(r.name))
    .filter(
      (r) =>
        !receiverSearch || r.name.toLowerCase().includes(receiverSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const availableReceiversList = filteredReceivers.map((r) => r.name);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const element = document.getElementById(SECTION_IDS[i]);
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop) {
            setActiveSection(SECTION_IDS[i]);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addInsuranceBlock = () => {
    setInsuranceCount((prev) => prev + 1);
    setInsuranceBlocks((prev) => [
      ...prev,
      { id: insuranceCount + 1, payer: "", policy: "", planGroup: "" },
    ]);
  };

  const removeInsuranceBlock = (id: number) => {
    setInsuranceBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const updateInsuranceBlock = (
    id: number,
    field: keyof InsuranceBlock,
    value: string
  ) => {
    setInsuranceBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, [field]: value } : block))
    );
  };

  const handleAddReceiver = (receiver: Receiver) => {
    setReceivers((prev) => [...prev, receiver]);
  };

  const handleSubmit = () => {
    alert("Demo: Referral submitted successfully!");
  };

  const handleSaveDraft = () => {
    alert("Demo: Draft saved!");
  };

  return (
    <div className="max-w-[1280px] mx-auto">
      <NewReferralNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main>
        <SenderFormHeader />
        <SenderInfoSection />

        <SelectReceiverSection
          stateFilter={stateFilter}
          setStateFilter={setStateFilter}
          receiverSearch={receiverSearch}
          setReceiverSearch={setReceiverSearch}
          selectedReceivers={selectedReceivers}
          setSelectedReceivers={setSelectedReceivers}
          availableReceiversList={availableReceiversList}
          selectedAvailableReceivers={selectedAvailableReceivers}
          setSelectedAvailableReceivers={setSelectedAvailableReceivers}
          selectedSelectedReceivers={selectedSelectedReceivers}
          setSelectedSelectedReceivers={setSelectedSelectedReceivers}
          filteredReceivers={filteredReceivers}
          onOpenAddReceiver={() => setReceiverModalOpen(true)}
        />

        <ServicesRequestedSection
          availableServices={availableServices}
          setAvailableServices={setAvailableServices}
          requestedServices={requestedServices}
          setRequestedServices={setRequestedServices}
          selectedAvailableServices={selectedAvailableServices}
          setSelectedAvailableServices={setSelectedAvailableServices}
          selectedRequestedServices={selectedRequestedServices}
          setSelectedRequestedServices={setSelectedRequestedServices}
          otherServices={otherServices}
          setOtherServices={setOtherServices}
          additionalNotes={additionalNotes}
          setAdditionalNotes={setAdditionalNotes}
        />

        <PatientInfoSection
          lastName={lastName}
          setLastName={setLastName}
          firstName={firstName}
          setFirstName={setFirstName}
          dob={dob}
          setDob={setDob}
          gender={gender}
          setGender={setGender}
          addressOfCare={addressOfCare}
          setAddressOfCare={setAddressOfCare}
        />

        <InsuranceInfoSection
          primaryPayer={primaryPayer}
          setPrimaryPayer={setPrimaryPayer}
          primaryPolicy={primaryPolicy}
          setPrimaryPolicy={setPrimaryPolicy}
          primaryPlanGroup={primaryPlanGroup}
          setPrimaryPlanGroup={setPrimaryPlanGroup}
          insuranceBlocks={insuranceBlocks}
          addInsuranceBlock={addInsuranceBlock}
          removeInsuranceBlock={removeInsuranceBlock}
          updateInsuranceBlock={updateInsuranceBlock}
        />

        <AdditionalDetailsSection
          phone={phone}
          setPhone={setPhone}
          language={language}
          setLanguage={setLanguage}
          ssn={ssn}
          setSsn={setSsn}
          representative={representative}
          setRepresentative={setRepresentative}
          otherInfo={otherInfo}
          setOtherInfo={setOtherInfo}
        />

        <AttachmentsSection />

        <PcpInfoSection
          pcpName={pcpName}
          setPcpName={setPcpName}
          pcpAddress={pcpAddress}
          setPcpAddress={setPcpAddress}
          pcpTel={pcpTel}
          setPcpTel={setPcpTel}
          pcpFax={pcpFax}
          setPcpFax={setPcpFax}
          pcpEmail={pcpEmail}
          setPcpEmail={setPcpEmail}
          pcpNpi={pcpNpi}
          setPcpNpi={setPcpNpi}
        />

        <FormActionsSection
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
        />
      </main>

      <AddReceiverModal
        isOpen={receiverModalOpen}
        onClose={() => setReceiverModalOpen(false)}
        onAdd={handleAddReceiver}
        defaultState={stateFilter}
      />
    </div>
  );
}
