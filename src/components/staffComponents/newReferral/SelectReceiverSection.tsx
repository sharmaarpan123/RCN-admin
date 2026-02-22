"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import CustomAsyncSelect from "@/components/CustomAsyncSelect";
import CustomReactSelect from "@/components/CustomReactSelect";
import { SectionHeader } from "./SectionHeader";
import type { GuestOrganization, OrgBranchDeptOption, ReceiverRow } from "./types";
import type { ReferralFormValues } from "./referralFormSchema";
import {
  getStaffOrganizationsApi,
  getStatesApi,
  postStaffBranchesByOrganizationsApi,
  postStaffDepartmentsByBranchesApi,
} from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import { Button } from "@/components";
import defaultAdminQueryKeys from "@/utils/adminQueryKeys";
import { AddReceiverModal } from "./AddReceiverModal";
import { toastWarning } from "@/utils/toast";

function toOptions(list: unknown[]): OrgBranchDeptOption[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item: unknown) => {
      const rec = item as Record<string, unknown>;
      const id = (rec._id ?? rec.id) as string | undefined;
      const name = (rec.name ?? rec.title) as string | undefined;
      return id && name ? { value: id, label: String(name) } : null;
    })
    .filter((x): x is OrgBranchDeptOption => x !== null);
}

interface SelectReceiverSectionProps {
  stateFilter: string;
  setStateFilter: (v: string) => void;

}

export function SelectReceiverSection({
  stateFilter,
  setStateFilter,

}: SelectReceiverSectionProps) {
  const [receiverModalOpen, setReceiverModalOpen] = useState(false);
  const { control, setValue, getValues } = useFormContext<ReferralFormValues>();
  const watchedReceiverRows = useWatch({ name: "receiver_rows", control });
  const watchedGuestOrganizations = useWatch({ name: "guest_organizations", control });
  const guestOrganizations = useMemo(
    () => (watchedGuestOrganizations ?? []) as GuestOrganization[],
    [watchedGuestOrganizations]
  );
  const { errors } = useFormState<ReferralFormValues>();
  const receiverRows = useMemo(
    () => (watchedReceiverRows ?? []) as ReceiverRow[],
    [watchedReceiverRows]
  );

  const receiverRowsRootError =
    errors.receiver_rows &&
      typeof errors.receiver_rows === "object" &&
      "message" in errors.receiver_rows
      ? (errors.receiver_rows as { message?: string }).message
      : undefined;

  const selectedOrgOptions: OrgBranchDeptOption[] = useMemo(
    () =>
      receiverRows.map((r) => ({
        value: r.organizationId,
        label: r.organizationName,
      })),
    [receiverRows]
  );

  const { data: stateOptionsFromApi = [] } = useQuery({
    queryKey: [...defaultAdminQueryKeys.statesList],
    queryFn: async () => {
      const res = await getStatesApi();
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      const list = Array.isArray(data) ? data : [];
      return list
        .map((item: { name?: string; abbreviation?: string }) => {
          const value = item.abbreviation;
          const label = item.name;
          return value != null && label != null ? { value: String(value), label: String(label) } : null;
        })
        .filter((x): x is OrgBranchDeptOption => x != null);
    },
  });

  const stateFilterOptions: OrgBranchDeptOption[] = [

    ...stateOptionsFromApi,
  ];

  const loadOrganizationOptions = useCallback(
    (inputValue: string) => {
      const stateParam =
        stateFilter && stateFilter !== "ALL"
          ? stateOptionsFromApi.find((s) => s.value === stateFilter)?.label ?? stateFilter
          : "";



      if (!stateParam && inputValue?.trim()) {
        toastWarning("Please select a state");
        return Promise.resolve([]);
      }

      if (!stateParam) {
        return Promise.resolve([]);
      }

      if (!inputValue?.trim()) {
        return Promise.resolve([]);
      }

      return getStaffOrganizationsApi({
        ...(stateParam && { state: stateParam }),
        ...(inputValue.trim() && { search: inputValue.trim() }),
      })
        .then((res) => {
          if (!checkResponse({ res })) return [];
          const data = res.data?.data ?? res.data;
          const list = Array.isArray(data) ? data : [];
          return toOptions(list);
        })
        .catch(() => []);
    },
    [stateFilter, stateOptionsFromApi]
  );

  const handleOrganizationChange = useCallback(
    (options: OrgBranchDeptOption[]) => {

      const newReceiverRows = options.map((opt) => {
        const existing = receiverRows.find((r) => r.organizationId === opt.value);
        return {
          organizationId: opt.value,
          organizationName: opt.label,
          branchId: existing?.branchId ?? null,
          branchName: existing?.branchName ?? null,
          departmentId: existing?.departmentId ?? null,
          departmentName: existing?.departmentName ?? null,
        };
      })

      setValue(
        "receiver_rows",
        newReceiverRows,
        { shouldValidate: true, }
      );
    },
    [receiverRows, setValue]
  );

  const removeRow = useCallback(
    (organizationId: string) => {
      setValue(
        "receiver_rows",
        receiverRows.filter((r) => r.organizationId !== organizationId),
        { shouldValidate: true }
      );
    },
    [receiverRows, setValue]
  );

  const updateRowBranch = useCallback(
    (organizationId: string, branchId: string, branchName: string) => {
      setValue(
        "receiver_rows",
        receiverRows.map((r) =>
          r.organizationId === organizationId
            ? {
              ...r,
              branchId,
              branchName,
              departmentId: null,
              departmentName: null,
            }
            : r
        ),
        { shouldValidate: true }
      );
    },
    [receiverRows, setValue]
  );

  const updateRowDepartment = useCallback(
    (organizationId: string, departmentId: string, departmentName: string) => {
      setValue(
        "receiver_rows",
        receiverRows.map((r) =>
          r.organizationId === organizationId
            ? { ...r, departmentId, departmentName }
            : r
        ),
        { shouldValidate: true }
      );
    },
    [receiverRows, setValue]
  );

  const handleAddReceiver = (guest: GuestOrganization) => {
    const currentGuests = getValues("guest_organizations") ?? [];
    setValue("guest_organizations", [...currentGuests, guest], { shouldValidate: true });
  };




  return (
    <>
      <AddReceiverModal
        key={receiverModalOpen ? `add-receiver-${stateFilter}` : "add-receiver-closed"}
        isOpen={receiverModalOpen}
        onClose={() => setReceiverModalOpen(false)}
        onAdd={handleAddReceiver}
        defaultState={stateFilter}
      />
      <section
        id="select-receiver"
        className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5  relative"
      >
        <SectionHeader
          title="Select the Referral Receiver"
          subtitle="Filter by state, then search and select organizations"
          badge="Bulk referrals supported"
        />

        <div className="border border-rcn-border/60 bg-[#eef8f1] border-[#cfe6d6] rounded-[14px] p-3 mb-3">
          <p className="m-0 text-sm text-rcn-text">
            Bulk referrals are supported. When a referral is sent to multiple receivers, each
            receiver will only be able to view their own referral and will not be able to see any
            other receivers or recipient details.
          </p>
        </div>

        {receiverRowsRootError && (
          <div
            className="border border-red-300 bg-red-50 rounded-[14px] p-3 mb-3 text-sm text-red-800"
            role="alert"
          >
            {receiverRowsRootError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              State (business location)
            </label>
            <CustomReactSelect
              value={stateFilter}
              onChange={setStateFilter}
              options={stateFilterOptions}
              placeholder="Select state..."
              aria-label="State (business location)"
              isClearable={false}
              maxMenuHeight={280}
            />
            <p className="text-xs text-rcn-muted mt-1.5">
              Select a state to narrow down organizations.
            </p>
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              Organization (search and select)
            </label>
            <CustomAsyncSelect
              value={selectedOrgOptions}
              onChange={handleOrganizationChange}
              loadOptions={loadOrganizationOptions}
              placeholder="Type to search organizations..."
              aria-label="Organization"
              defaultOptions={true}
              maxMenuHeight={280}
            />
            <p className="text-xs text-rcn-muted mt-1.5">
              Select one or more organizations. Then choose branch and department per row below.
            </p>
          </div>
        </div>

        <ReceiverRowsTable
          receiverRows={receiverRows}
          updateRowBranch={updateRowBranch}
          updateRowDepartment={updateRowDepartment}
          removeRow={removeRow}
          receiverRowsErrors={errors.receiver_rows}
          receiverRowsRootError={receiverRowsRootError}
        />

        <GuestOrganizationsTable
          guestOrganizations={guestOrganizations}
          removeGuestOrganization={(index: number) => {
            const current = getValues("guest_organizations") ?? [];
            setValue(
              "guest_organizations",
              current.filter((_, i) => i !== index),
              { shouldValidate: true }
            );
          }}
        />

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setReceiverModalOpen(true)}
          className="w-full mt-2.5 flex items-center justify-center gap-2.5 rounded-[14px] bg-gradient-to-b from-rcn-brand to-rcn-brand-light border border-black/6 shadow-[0_10px_18px_rgba(47,125,79,.22)] font-black text-xs"
        >
          <span className="w-6.5 h-6.5 rounded-xl bg-white/18 flex items-center justify-center text-base">
            ＋
          </span>
          <span>Add Referral Receiver (if not listed)</span>
        </Button>
      </section>
    </>
  );
}

/** Fetches branches for one org and returns options. */
function useBranchOptions(organizationId: string): OrgBranchDeptOption[] {
  const { data } = useQuery({
    queryKey: ["staff", "branches", organizationId],
    queryFn: async () => {
      const res = await postStaffBranchesByOrganizationsApi({
        organization_ids: [organizationId],
      });
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      return toOptions(Array.isArray(data) ? data : []);
    },
    enabled: !!organizationId,
  });
  return data ?? [];
}

/** Fetches departments for one branch and returns options. */
function useDepartmentOptions(branchId: string | null): OrgBranchDeptOption[] {
  const { data } = useQuery({
    queryKey: ["staff", "departments", branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const res = await postStaffDepartmentsByBranchesApi({
        branch_ids: [branchId],
      });
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      return toOptions(Array.isArray(data) ? data : []);
    },
    enabled: !!branchId,
  });
  return data ?? [];
}

function ReceiverRow({
  row,
  updateRowBranch,
  updateRowDepartment,
  removeRow,
  branchError,
  departmentError,
}: {
  row: ReceiverRow;
  updateRowBranch: (organizationId: string, branchId: string, branchName: string) => void;
  updateRowDepartment: (organizationId: string, departmentId: string, departmentName: string) => void;
  removeRow: (organizationId: string) => void;
  branchError?: string;
  departmentError?: string;
}) {
  const branchOptions = useBranchOptions(row.organizationId);
  const departmentOptions = useDepartmentOptions(row.branchId);

  const branchValue = row.branchId
    ? { value: row.branchId, label: row.branchName ?? row.branchId }
    : "";
  const departmentValue = row.departmentId
    ? { value: row.departmentId, label: row.departmentName ?? row.departmentId }
    : "";

  return (
    <div className="grid grid-cols-[1fr_minmax(180px,1fr)_minmax(180px,1fr)_auto] gap-2 border-b border-rcn-border last:border-b-0 py-2.5 px-2 items-start">
      <div className="min-w-0">
        <p className="m-0 text-sm font-medium text-rcn-text wrap-break-word">
          {row.organizationName}
        </p>
      </div>
      <div className="min-w-[180px]">
        <CustomReactSelect
          value={typeof branchValue === "string" ? branchValue : branchValue.value}
          onChange={(value) => {
            const opt = branchOptions.find((o: OrgBranchDeptOption) => o.value === value);
            if (opt) updateRowBranch(row.organizationId, opt.value, opt.label);
          }}
          options={branchOptions}
          placeholder="Select branch..."
          aria-label="Branch"
          aria-invalid={!!branchError}
          isClearable
          maxMenuHeight={220}
          controlClassName={branchError ? "!border-red-500" : undefined}
        />
        {branchError && (
          <p className="text-xs text-rcn-danger mt-1 m-0" role="alert">
            {branchError}
          </p>
        )}
      </div>
      <div className="min-w-[180px]">
        <CustomReactSelect
          value={typeof departmentValue === "string" ? departmentValue : departmentValue.value}
          onChange={(value) => {
            const opt = departmentOptions.find((o: OrgBranchDeptOption) => o.value === value);
            if (opt) updateRowDepartment(row.organizationId, opt.value, opt.label);
          }}
          options={departmentOptions}
          placeholder="Select department..."
          aria-label="Department"
          aria-invalid={!!departmentError}
          isClearable
          maxMenuHeight={220}
          isDisabled={!row.branchId}
          controlClassName={departmentError ? "!border-red-500" : undefined}
        />
        {departmentError && (
          <p className="text-xs text-rcn-danger mt-1 m-0" role="alert">
            {departmentError}
          </p>
        )}
      </div>
      <div className="w-24 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeRow(row.organizationId)}
          aria-label="Remove receiver"
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

function ReceiverRowsTable({
  receiverRows,
  updateRowBranch,
  updateRowDepartment,
  removeRow,
  receiverRowsErrors,
  receiverRowsRootError,
}: {
  receiverRows: ReceiverRow[];
  updateRowBranch: (organizationId: string, branchId: string, branchName: string) => void;
  updateRowDepartment: (organizationId: string, departmentId: string, departmentName: string) => void;
  removeRow: (organizationId: string) => void;
  receiverRowsErrors?: unknown;
  receiverRowsRootError?: string;
}) {
  if (receiverRows.length === 0) {
    return (
      <div
        className={`py-4 text-center text-sm border rounded-xl ${receiverRowsRootError
          ? "border-red-300 bg-red-50/80 text-red-800"
          : "border-rcn-border bg-slate-50/50 text-rcn-muted"
          }`}
      >
        {receiverRowsRootError ? (
          <p className="m-0 font-medium" role="alert">
            {receiverRowsRootError}
          </p>
        ) : (
          <p className="m-0">
            No organizations selected. Use the search above to add organizations, then choose branch
            and department for each row.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rcn-border mb-3">
      <div className="min-w-[600px] rounded-xl ">
        <div className="grid grid-cols-[1fr_minmax(180px,1fr)_minmax(180px,1fr)_auto] gap-2 bg-slate-50 border-b border-rcn-border px-2 py-2.5 text-xs font-semibold text-rcn-muted uppercase tracking-wider items-center">
          <div>Organization</div>
          <div>Branch</div>
          <div>Department</div>
          <div className="w-24 shrink-0">Action</div>
        </div>
        {receiverRows.map((row, index) => (
          <ReceiverRow
            key={row.organizationId}
            row={row}
            updateRowBranch={updateRowBranch}
            updateRowDepartment={updateRowDepartment}
            removeRow={removeRow}
            branchError={(receiverRowsErrors as Array<{ branchId?: { message?: string }; departmentId?: { message?: string } }>)?.[index]?.branchId?.message}
            departmentError={(receiverRowsErrors as Array<{ branchId?: { message?: string }; departmentId?: { message?: string } }>)?.[index]?.departmentId?.message}
          />
        ))}
      </div>
    </div>
  );
}

function GuestOrganizationsTable({
  guestOrganizations,
  removeGuestOrganization,
}: {
  guestOrganizations: GuestOrganization[];
  removeGuestOrganization: (index: number) => void;
}) {
  if (guestOrganizations.length === 0) return null;

  return (
    <div className="rounded-xl border border-rcn-border mb-3 my-2">
      <div className="text-sm font-medium text-rcn-text mb-2 p-2 ">Guest Organizations</div>
      <div className="min-w-[600px] rounded-xl">
        <div className="grid grid-cols-[1fr_1fr_120px_auto] gap-2 bg-slate-50 border-b border-rcn-border px-2 py-2.5 text-xs font-semibold text-rcn-muted uppercase tracking-wider items-center">
          <div>Company</div>
          <div>Email / Phone</div>
          <div>State</div>
          <div className="w-20 shrink-0">Action</div>
        </div>
        {guestOrganizations.map((guest, index) => (
          <div
            key={`${guest.company_name}-${index}`}
            className="grid grid-cols-[1fr_1fr_120px_auto] gap-2 border-b border-rcn-border last:border-b-0 py-2.5 px-2 items-center"
          >
            <div className="min-w-0">
              <p className="m-0 text-sm font-medium text-rcn-text truncate" title={guest.company_name}>
                {guest.company_name}
              </p>
              <p className="m-0 text-xs text-rcn-muted truncate" title={guest.address}>
                {guest.address}
              </p>
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm text-rcn-text truncate">{guest.email}</p>
              <p className="m-0 text-xs text-rcn-muted truncate">
                {guest.dial_code} {guest.phone_number}
              </p>
            </div>
            <div className="text-sm text-rcn-text">{guest.state}</div>
            <div className="w-20 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGuestOrganization(index)}
                aria-label="Remove guest organization"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
