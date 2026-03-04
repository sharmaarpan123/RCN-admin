"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStaffOrganizationsApi,
  getStatesApi,
  postStaffBranchesByOrganizationsApi,
  postStaffDepartmentsByBranchesApi,
} from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import { Button } from "@/components";
import CustomAsyncSelect from "@/components/CustomAsyncSelect";
import CustomReactSelect from "@/components/CustomReactSelect";
import defaultAdminQueryKeys from "@/utils/adminQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { toastWarning } from "@/utils/toast";

export interface OrgBranchDeptOption {
  value: string;
  label: string;
}

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

export interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  refId: string | null;
  onForward: (departmentIds: string[]) => void;
  isPending?: boolean;
}

export function ForwardModal({
  isOpen,
  onClose,
  refId,
  onForward,
  isPending = false,
}: ForwardModalProps) {
  const [stateFilter, setStateFilter] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<OrgBranchDeptOption | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<Set<string>>(new Set());

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
          return value != null && label != null
            ? { value: String(value), label: String(label) }
            : null;
        })
        .filter((x): x is OrgBranchDeptOption => x != null);
    },
  });

  const stateFilterOptions: OrgBranchDeptOption[] = useMemo(
    () => [...stateOptionsFromApi],
    [stateOptionsFromApi]
  );

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
      if (!stateParam) return Promise.resolve([]);
      if (!inputValue?.trim()) return Promise.resolve([]);

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

  const { data: branchOptions = [] } = useQuery({
    queryKey: ["staff", "forward-branches", selectedOrg?.value],
    queryFn: async () => {
      if (!selectedOrg?.value) return [];
      const res = await postStaffBranchesByOrganizationsApi({
        organization_ids: [selectedOrg.value],
      });
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      return toOptions(Array.isArray(data) ? data : []);
    },
    enabled: !!selectedOrg?.value,
  });

  const { data: departmentOptions = [] } = useQuery({
    queryKey: ["staff", "forward-departments", selectedBranch],
    queryFn: async () => {
      if (!selectedBranch) return [];
      const res = await postStaffDepartmentsByBranchesApi({
        branch_ids: [selectedBranch],
      });
      if (!checkResponse({ res })) return [];
      const data = res.data?.data ?? res.data;
      return toOptions(Array.isArray(data) ? data : []);
    },
    enabled: !!selectedBranch,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const orgSelectValue = useMemo(
    () => (selectedOrg ? [selectedOrg] : []),
    [selectedOrg]
  );

  const handleOrgChange = useCallback((opts: OrgBranchDeptOption[]) => {
    const next = opts?.[0] ?? null;
    setSelectedOrg(next);
    if (!next) {
      setSelectedBranch("");
      setSelectedDepartmentIds(new Set());
    }
  }, []);

  const handleBranchChange = useCallback((value: string) => {
    setSelectedBranch(value);
    if (!value) setSelectedDepartmentIds(new Set());
  }, []);

  const toggleDepartment = useCallback((deptId: string) => {
    setSelectedDepartmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const ids = Array.from(selectedDepartmentIds);
    if (!ids.length) {
      toastWarning("Please select at least one department.");
      return;
    }
    onForward(ids);
    onClose();
  }, [selectedDepartmentIds, onForward, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/55 flex items-center justify-center p-4 z-999"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-hidden="false"
    >
      <div
        className="w-full max-w-[780px] bg-white/98 border border-slate-200 rounded-[18px] shadow-[0_30px_80px_rgba(2,6,23,.35)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={refId ? `Forward referral ${refId}` : "Forward referral"}
      >
        <div
          className="p-3.5 border-b border-rcn-brand/20 flex items-start justify-between gap-3"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,107,58,.18), rgba(31,138,76,.12), rgba(31,138,76,.06))",
          }}
        >
          <div>
            <h3 className="m-0 text-sm font-black tracking-wide">
              Forward Referral to Departments
            </h3>
            <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">
              Select state, organization, branch, then choose departments to forward to.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 bg-white px-2.5 py-2 rounded-xl font-extrabold text-xs shadow-[0_8px_18px_rgba(2,6,23,.06)]"
          >
            Close
          </button>
        </div>

        <div className="p-3.5 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-rcn-muted text-xs font-[850] leading-snug mb-1.5">
                State (business location)
              </label>
              <CustomReactSelect
                value={stateFilter}
                onChange={setStateFilter}
                options={stateFilterOptions}
                placeholder="Select state..."
                aria-label="State"
                isClearable={false}
                maxMenuHeight={280}
              />
            </div>
            <div>
              <label className="block text-rcn-muted text-xs font-[850] leading-snug mb-1.5">
                Organization (search and select)
              </label>
              <CustomAsyncSelect
                value={orgSelectValue}
                onChange={handleOrgChange}
                loadOptions={loadOrganizationOptions}
                placeholder="Type to search organizations..."
                aria-label="Organization"
                defaultOptions={false}
                maxMenuHeight={280}
              />
            </div>
          </div>

          <div>
            <label className="block text-rcn-muted text-xs font-[850] leading-snug mb-1.5">
              Branch
            </label>
            <CustomReactSelect
              value={selectedBranch}
              onChange={handleBranchChange}
              options={branchOptions}
              placeholder="Select branch..."
              aria-label="Branch"
              isClearable
              maxMenuHeight={220}
              isDisabled={!selectedOrg?.value}
            />
          </div>

           
        </div>

        <div className="px-3.5 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5 bg-white/95">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={isPending || selectedDepartmentIds.size === 0}
          >
            {isPending ? "Forwarding…" : "Forward Referral"}
          </Button>
        </div>
      </div>
    </div>
  );
}
