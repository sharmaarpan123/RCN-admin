"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Select, { type MultiValue } from "react-select";
import {
  getOrganizationBranchSearchApi,
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

const RCN_SELECT_CLASSES = {
  control: "!min-h-[42px] !rounded-xl !border-rcn-border !shadow-none !border",
  menu: "!rounded-xl !border !border-rcn-border",
};

export interface OrgBranchDeptOption {
  value: string;
  label: string;
}

/** API branch search item: branch (is_branch=1) or organization (is_organization=1). */
interface BranchSearchItem {
  _id: string;
  name: string;
  organization_id?: string;
  organization?: { _id: string; name: string };
  is_branch: 0 | 1;
  is_organization: 0 | 1;
}

interface ForwardRowState {
  rowId: string;
  orgId: string;
  orgName: string;
  branchId: string;
  branchName: string;
  selectedDepartments: OrgBranchDeptOption[];
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

function useBranchOptions(organizationId: string): OrgBranchDeptOption[] {
  const { data } = useQuery({
    queryKey: ["staff", "forward-branches", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
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

function useDepartmentOptions(branchId: string | null): OrgBranchDeptOption[] {
  const { data } = useQuery({
    queryKey: ["staff", "forward-departments", branchId],
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

function ForwardRow({
  row,
  onBranchChange,
  onDepartmentsChange,
  onRemove,
}: {
  row: ForwardRowState;
  onBranchChange: (branchId: string, branchName: string) => void;
  onDepartmentsChange: (opts: OrgBranchDeptOption[]) => void;
  onRemove: () => void;
}) {
  const branchOptions = useBranchOptions(row.orgId);
  const departmentOptions = useDepartmentOptions(row.branchId || null);

  const handleBranchChange = useCallback(
    (value: string) => {
      const opt = branchOptions.find((o) => o.value === value);
      onBranchChange(value, opt?.label ?? value);
    },
    [branchOptions, onBranchChange],
  );

  const handleDeptChange = useCallback(
    (opts: MultiValue<OrgBranchDeptOption>) => {
      onDepartmentsChange(opts ? [...opts] : []);
    },
    [onDepartmentsChange],
  );

  return (
    <tr className="border-b border-rcn-border last:border-b-0">
      <td className="py-2.5 px-2 align-top">
        <p className="m-0 text-sm font-medium text-rcn-text wrap-break-word">
          {row.orgName}
        </p>
      </td>
      <td className="py-2.5 px-2 min-w-[180px] align-top">
        <CustomReactSelect
          value={row.branchId}
          onChange={handleBranchChange}
          options={branchOptions}
          placeholder="Select branch..."
          aria-label="Branch"
          isClearable
          maxMenuHeight={220}
        />
      </td>
      <td className="py-2.5 px-2 min-w-[200px] align-top">
        <Select<OrgBranchDeptOption, true>
          isMulti
          value={row.selectedDepartments}
          onChange={handleDeptChange}
          options={departmentOptions}
          placeholder="Select departments..."
          isClearable
          maxMenuHeight={220}
          isDisabled={!row.branchId}
          classNames={{
            control: () => RCN_SELECT_CLASSES.control,
            menu: () => RCN_SELECT_CLASSES.menu,
          }}
          aria-label="Departments"
        />
      </td>
      <td className="py-2.5 px-2 w-24 align-top">
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </td>
    </tr>
  );
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
  const [forwardRows, setForwardRows] = useState<ForwardRowState[]>([]);
  const [branchSearchSelected, setBranchSearchSelected] = useState<
    OrgBranchDeptOption[]
  >([]);
  const branchSearchResultsRef = useRef<BranchSearchItem[]>([]);

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
    [stateOptionsFromApi],
  );

  const loadOrganizationOptions = useCallback(
    (inputValue: string) => {
      const stateParam =
        stateFilter && stateFilter !== "ALL"
          ? (stateOptionsFromApi.find((s) => s.value === stateFilter)?.label ??
            stateFilter)
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
    [stateFilter, stateOptionsFromApi],
  );

  const loadBranchSearchOptions = useCallback(
    (inputValue: string) => {
      const stateParam =
        stateFilter && stateFilter !== "ALL"
          ? (stateOptionsFromApi.find((s) => s.value === stateFilter)?.label ??
            stateFilter)
          : "";
      if (!stateParam) {
        if (inputValue?.trim()) toastWarning("Please select a state first");
        return Promise.resolve([]);
      }
      if (!inputValue?.trim()) return Promise.resolve([]);
      return getOrganizationBranchSearchApi({
        state: stateParam,
        name: inputValue.trim(),
      })
        .then((res) => {
          if (!checkResponse({ res })) return [];
          const data = res.data?.data ?? res.data;
          const list = Array.isArray(data) ? data : [];
          branchSearchResultsRef.current = list as BranchSearchItem[];
          return list.map((item: BranchSearchItem) => {
            const value = `${item._id}`;
            const label = item.is_branch
              ? `${item.name} (Branch)`
              : `${item.name} (Organization)`;
            return { value, label };
          });
        })
        .catch(() => []);
    },
    [stateFilter, stateOptionsFromApi],
  );

  const handleBranchSearchChange = useCallback(
    (options: OrgBranchDeptOption[]) => {
      if (!options?.length) return;
      const results = branchSearchResultsRef.current;
      const newRows: ForwardRowState[] = [];
      for (const opt of options) {
        const item = results.find((r) => `${r._id}` === opt.value);
        if (!item) continue;

        if (item.is_organization) {
          const isOrgAlreadyThere = forwardRows.find(
            (r) => r.orgId === opt.value,
          );
          if (!isOrgAlreadyThere) {
            newRows.push({
              rowId: crypto.randomUUID(),
              orgId: item._id,
              orgName: item.name,
              branchId: "",
              branchName: "",
              selectedDepartments: [],
            });
          }
        } else if (item.is_branch && item.organization) {
          const isBranchAlreadyThere = forwardRows.find(
            (r) => r.branchId === opt.value,
          );

          if (!isBranchAlreadyThere) {
            newRows.push({
              rowId: crypto.randomUUID(),
              orgId: item.organization._id,
              orgName: item.organization.name,
              branchId: item._id,
              branchName: item.name,
              selectedDepartments: [],
            });
          }
        }
      }
      if (newRows.length > 0) {
        setForwardRows((prev) => [...prev, ...newRows]);
      }
      setBranchSearchSelected([]);
    },
    [forwardRows],
  );

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
    () => {
      const seen = new Set<string>();
      return forwardRows.filter((r) => {
        if (seen.has(r.orgId)) return false;
        seen.add(r.orgId);
        return true;
      }).map((r) => ({ value: r.orgId, label: r.orgName }));
    },
    [forwardRows],
  );

  const handleOrgChange = useCallback((opts: OrgBranchDeptOption[]) => {
    setForwardRows((prev) =>
      (opts ?? []).map((opt) => {
        const existing = prev.find((r) => r.orgId === opt.value);
        return (
          existing ?? {
            rowId: crypto.randomUUID(),
            orgId: opt.value,
            orgName: opt.label,
            branchId: "",
            branchName: "",
            selectedDepartments: [],
          }
        );
      }),
    );
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setForwardRows((prev) => prev.filter((r) => r.rowId !== rowId));
  }, []);

  const updateRowBranch = useCallback(
    (rowId: string, branchId: string, branchName: string) => {
      const isBranchAlreadyThere = forwardRows.find(
        (r) => r.branchId === branchId,
      );
      if (isBranchAlreadyThere) {
        return;
      }
      setForwardRows((prev) =>
        prev.map((r) =>
          r.rowId === rowId
            ? { ...r, branchId, branchName, selectedDepartments: [] }
            : r,
        ),
      );
    },
    [forwardRows],
  );

  const updateRowDepartments = useCallback(
    (rowId: string, selectedDepartments: OrgBranchDeptOption[]) => {
      setForwardRows((prev) =>
        prev.map((r) =>
          r.rowId === rowId ? { ...r, selectedDepartments } : r,
        ),
      );
    },
    [],
  );

  const allDepartmentIds = useMemo(
    () => forwardRows.flatMap((r) => r.selectedDepartments.map((d) => d.value)),
    [forwardRows],
  );

  const showValidationError =
    forwardRows.length > 0 && allDepartmentIds.length === 0;
  const canSubmit =
    allDepartmentIds.length > 0 &&
    forwardRows.every((r) => r.selectedDepartments.length > 0);

  const handleConfirm = useCallback(() => {
    if (forwardRows.length === 0) {
      toastWarning("Please select at least one organization.");
      return;
    }
    if (!canSubmit) {
      toastWarning(
        "Select at least one receiver with branch and department, or add a receiver from the list above.",
      );
      return;
    }

    onForward(allDepartmentIds);
    onClose();
  }, [forwardRows.length, canSubmit, allDepartmentIds, onForward, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/55 flex items-center justify-center p-4 z-999"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-hidden="false"
    >
      <div
        className="w-[95vw] md:w-[85vw] min-h-[calc(100vh-2rem)] bg-white/98 border border-slate-200 rounded-[18px] shadow-[0_30px_80px_rgba(2,6,23,.35)] overflow-hidden"
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
              Select state, then search and select one or more organizations.
              Choose branch and departments (multiple) per row.
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
          <div className="border border-[#cfe6d6] bg-[#eef8f1] rounded-[14px] p-3 mb-2">
            <p className="m-0 text-sm text-rcn-text">
              Bulk referrals are supported. When a referral is sent to multiple
              receivers, each receiver will only be able to view their own
              referral and will not be able to see any other receivers or
              recipient details.
            </p>
          </div>

          {showValidationError && (
            <div
              className="border border-red-300 bg-red-50 rounded-[14px] p-3 mb-2 text-sm text-red-800"
              role="alert"
            >
              Select at least one receiver with branch and department, or add a
              receiver from the list above.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
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
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
                Organization (search and select)
              </label>
              <CustomAsyncSelect
                value={orgSelectValue}
                onChange={handleOrgChange}
                loadOptions={loadOrganizationOptions}
                placeholder="Type to search organizations..."
                aria-label="Organization"
                defaultOptions={true}
                maxMenuHeight={280}
              />
              <p className="text-xs text-rcn-muted mt-1.5">
                Select one or more organizations. Then choose branch and
                department per row below.
              </p>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
                Search by branch or organization
              </label>
              <CustomAsyncSelect
                value={branchSearchSelected}
                onChange={handleBranchSearchChange}
                loadOptions={loadBranchSearchOptions}
                placeholder="Type to search branches or organizations..."
                aria-label="Search by branch or organization"
                defaultOptions={false}
                maxMenuHeight={280}
              />
              <p className="text-xs text-rcn-muted mt-1.5">
                Select a state first, then search. Choosing an organization adds
                one row; choosing a branch adds a row with that branch
                preselected.
              </p>
            </div>
          </div>

          {forwardRows.length === 0 ? (
            <div className="py-4 text-center text-sm border rounded-xl border-rcn-border bg-slate-50/50 text-rcn-muted">
              <p className="m-0">
                No organizations selected. Use the search above to add
                organizations, then choose branch and departments for each row.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-rcn-border">
              <div className="min-w-[600px] ">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-rcn-border">
                      <th className="text-left px-2 py-2.5 text-xs font-semibold text-rcn-muted uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="text-left px-2 py-2.5 text-xs font-semibold text-rcn-muted uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="text-left px-2 py-2.5 text-xs font-semibold text-rcn-muted uppercase tracking-wider">
                        Department
                      </th>
                      <th className="text-left px-2 py-2.5 text-xs font-semibold text-rcn-muted uppercase tracking-wider w-24">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {forwardRows.map((row) => (
                      <ForwardRow
                        key={row.rowId}
                        row={row}
                        onBranchChange={(branchId, branchName) =>
                          updateRowBranch(row.rowId, branchId, branchName)
                        }
                        onDepartmentsChange={(opts) =>
                          updateRowDepartments(row.rowId, opts)
                        }
                        onRemove={() => removeRow(row.rowId)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
            disabled={isPending || !canSubmit}
          >
            {isPending ? "Forwarding…" : "Forward Referral"}
          </Button>
        </div>
      </div>
    </div>
  );
}
