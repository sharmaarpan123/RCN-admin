"use client";

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
  type Receiver,
  type ReceiverRow,
} from "@/components/staffComponents/newReferral";
import {
  getDepartmentIdsFromReceiverRows,
  referralFormSchema,
  type ReferralFormValues,
} from "@/components/staffComponents/newReferral/referralFormSchema";
import { postOrganizationReferralApi } from "@/apis/ApiCalls";
import { checkResponse, catchAsync } from "@/utils/commonFunc";
import { toastError } from "@/utils/toast";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";

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

const defaultValues: ReferralFormValues = {
  sender_name: "",
  facility_name: "",
  facility_address: "",
  sender_email: "",
  sender_phone_number: "",
  sender_fax_number: "",
  sender_dial_code: "+1",
  receiver_rows: [],
  speciality_ids: [],
  additional_speciality: "",
  additional_notes: "",
  patient_first_name: "",
  patient_last_name: "",
  dob: "",
  gender: "",
  address_of_care: "",
  patient_insurance_information: [{ payer: "", policy: "", plan_group: "", document: "" }],
  patient_phone_number: "",
  patient_dial_code: "+1",
  primary_language: "",
  social_security_number: "",
  power_of_attorney: "",
  other_information: "",
  face_sheet: "",
  medication_list: "",
  discharge_summary: "",
  wound_photos: [],
  signed_order: "",
  history_or_physical: "",
  progress_notes: "",
  other_documents: [],
  primary_care_name: "",
  primary_care_address: "",
  primary_care_phone_number: "",
  primary_care_dial_code: "+1",
  primary_care_fax: "",
  primary_care_email: "",
  primary_care_npi: "",
};

export default function NewReferralPage() {
  const queryClient = useQueryClient();
  const [stateFilter, setStateFilter] = useState("ALL");
  const [receiverModalOpen, setReceiverModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("sender-form");

  const methods = useForm<ReferralFormValues>({
    defaultValues,
    resolver: yupResolver(referralFormSchema),
  });


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

  const onSubmit = (values: ReferralFormValues) => {
    const department_ids = getDepartmentIdsFromReceiverRows(
      values.receiver_rows as ReceiverRow[]
    );
    if (!department_ids.length) {
      toastError(
        "Select at least one receiver with branch and department before submitting."
      );
      return;
    }
    const payload = {
      sender_name: values.sender_name,
      facility_name: values.facility_name,
      facility_address: values.facility_address,
      sender_email: values.sender_email,
      sender_phone_number: (values.sender_phone_number ?? "").replace(/\D/g, ""),
      sender_fax_number: values.sender_fax_number,
      sender_dial_code: values.sender_dial_code ?? "+1",
      department_ids,
      speciality_ids: values.speciality_ids,
      additional_speciality: values.additional_speciality || undefined,
      additional_notes: values.additional_notes || undefined,
      patient_first_name: values.patient_first_name,
      patient_last_name: values.patient_last_name,
      dob: values.dob,
      gender: values.gender,
      address_of_care: values.address_of_care,
      patient_insurance_information: values.patient_insurance_information.map((item) => ({
        payer: item.payer,
        policy: item.policy,
        plan_group: item.plan_group,
        ...(item.document ? { document: item.document } : {}),
      })),
      patient_phone_number: (values.patient_phone_number ?? "").replace(/\D/g, ""),
      patient_dial_code: values.patient_dial_code ?? "+1",
      primary_language: values.primary_language || undefined,
      social_security_number: values.social_security_number || undefined,
      power_of_attorney: values.power_of_attorney || undefined,
      other_information: values.other_information || undefined,
      face_sheet: values.face_sheet || undefined,
      medication_list: values.medication_list || undefined,
      discharge_summary: values.discharge_summary || undefined,
      wound_photos: values.wound_photos?.length ? values.wound_photos : undefined,
      signed_order: values.signed_order || undefined,
      history_or_physical: values.history_or_physical || undefined,
      progress_notes: values.progress_notes || undefined,
      other_documents: values.other_documents?.length ? values.other_documents : undefined,
      primary_care_name: values.primary_care_name || undefined,
      primary_care_address: values.primary_care_address || undefined,
      primary_care_phone_number: values.primary_care_phone_number || undefined,
      primary_care_dial_code: values.primary_care_dial_code || undefined,
      primary_care_fax: values.primary_care_fax || undefined,
      primary_care_email: values.primary_care_email || undefined,
      primary_care_npi: values.primary_care_npi || undefined,
    };
    catchAsync(async () => {
      const res = await postOrganizationReferralApi(payload);
      if (checkResponse({ res, showSuccess: true })) {
        methods.reset(defaultValues);
        queryClient.invalidateQueries({ queryKey: defaultQueryKeys.referralSentList });
      }
    })();
  };

  const handleAddReceiver = (receiver: Receiver) => {
    const newRow: ReceiverRow = {
      organizationId: `custom-${receiver.name}-${Date.now()}`,
      organizationName: receiver.name,
      branchId: null,
      branchName: null,
      departmentId: null,
      departmentName: null,
    };
    methods.setValue("receiver_rows", [...methods.getValues("receiver_rows"), newRow], {
      shouldValidate: true,
    });
  };

  console.log(methods.formState.errors, "errors");

  return (
    <div className="max-w-[1280px] mx-auto">
      <NewReferralNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          <main>
            <SenderFormHeader />
            <SenderInfoSection />

            <SelectReceiverSection
              stateFilter={stateFilter}
              setStateFilter={setStateFilter}
              onOpenAddReceiver={() => setReceiverModalOpen(true)}
            />

            <ServicesRequestedSection />

            <PatientInfoSection />

            <InsuranceInfoSection />

            <AdditionalDetailsSection />

            <AttachmentsSection />

            <PcpInfoSection />

            <FormActionsSection />
          </main>
        </form>
      </FormProvider>

      <AddReceiverModal
        isOpen={receiverModalOpen}
        onClose={() => setReceiverModalOpen(false)}
        onAdd={handleAddReceiver}
        defaultState={stateFilter}
      />
    </div>
  );
}
