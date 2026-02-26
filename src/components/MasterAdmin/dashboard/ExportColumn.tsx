"use client";

import React, { useCallback, useState } from "react";
import { Button, CustomAsyncSelect } from "@/components";
import type { RcnSelectOption } from "@/components/CustomAsyncSelect";
import {
  getAdminReferralsExportExcelApi,
  getAdminOrganizationsApi,
  getAdminOrganizationBranchesApi,
  getAdminOrganizationDepartmentsApi,
} from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import { toastSuccess, toastError } from "@/utils/toast";
import type { AxiosResponse } from "axios";
import type {
  AdminOrganizationListItem,
  AdminBranchListItem,
  AdminDepartmentListItem,
} from "@/components/MasterAdmin/Organizations/types";
import PrintIcon from "@/assets/svg/PrintIcon";

export function ExportColumn() {
  const [exporting, setExporting] = useState(false);
  const [exportReferralType, setExportReferralType] = useState<"sent" | "received" | "">("");
  const [exportDays, setExportDays] = useState<number | "">("");
  const [selectedOrg, setSelectedOrg] = useState<RcnSelectOption[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<RcnSelectOption[]>([]);
  const [selectedDept, setSelectedDept] = useState<RcnSelectOption[]>([]);

  const selectedOrgId = selectedOrg[0]?.value ?? "";

  const loadOrgOptions = useCallback(async (inputValue: string): Promise<RcnSelectOption[]> => {
    const res = await getAdminOrganizationsApi({
      search: inputValue.trim() || undefined,
      limit: 50,
    });
    if (!checkResponse({ res })) return [];
    const raw = res.data as { data?: AdminOrganizationListItem[] };
    const list = raw?.data ?? [];
    return list
      .map((o) => {
        const id = o.organization_id ?? o._id ?? "";
        const label = o.organization?.name ?? "";
        return id && label ? { value: id, label } : null;
      })
      .filter((x): x is RcnSelectOption => x != null);
  }, []);

  const loadBranchOptions = useCallback(
    async (inputValue: string): Promise<RcnSelectOption[]> => {
      if (!selectedOrgId) return [];
      const res = await getAdminOrganizationBranchesApi(selectedOrgId, {
        search: inputValue.trim() || undefined,
        limit: 50,
        page: 1,
      });
      if (!checkResponse({ res })) return [];
      const raw = res.data as { data?: AdminBranchListItem[] };
      const list = raw?.data ?? [];
      return list
        .map((b) => {
          const id = (b as { _id?: string })._id ?? "";
          const label = (b as { name?: string }).name ?? "";
          return id && label ? { value: id, label } : null;
        })
        .filter((x): x is RcnSelectOption => x != null);
    },
    [selectedOrgId]
  );

  const loadDeptOptions = useCallback(
    async (inputValue: string): Promise<RcnSelectOption[]> => {
      if (!selectedOrgId) return [];
      const res = await getAdminOrganizationDepartmentsApi(selectedOrgId);
      if (!checkResponse({ res })) return [];
      const list = (res.data as { data?: AdminDepartmentListItem[] })?.data ?? [];
      const term = (inputValue ?? "").trim().toLowerCase();
      return list
        .map((d) => {
          const id = (d as { _id?: string })._id ?? "";
          const label = (d as { name?: string }).name ?? "";
          return id && label ? { value: id, label } : null;
        })
        .filter((x): x is RcnSelectOption => x != null)
        .filter((o) => !term || o.label.toLowerCase().includes(term));
    },
    [selectedOrgId]
  );

  const handleOrgChange = useCallback((options: RcnSelectOption[]) => {
    setSelectedOrg(options.length ? [options[options.length - 1]] : []);
    setSelectedBranch([]);
    setSelectedDept([]);
  }, []);

  const handleBranchChange = useCallback((options: RcnSelectOption[]) => {
    setSelectedBranch(options.length ? [options[options.length - 1]] : []);
  }, []);

  const handleDeptChange = useCallback((options: RcnSelectOption[]) => {
    setSelectedDept(options.length ? [options[options.length - 1]] : []);
  }, []);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params: {
        organization_id?: string;
        branch_id?: string;
        department_id?: string;
        referral_type?: "sent" | "received";
        days?: number;
      } = {};
      if (selectedOrgId) params.organization_id = selectedOrgId;
      if (selectedBranch[0]?.value) params.branch_id = selectedBranch[0].value;
      if (selectedDept[0]?.value) params.department_id = selectedDept[0].value;
      if (exportReferralType) params.referral_type = exportReferralType;
      if (exportDays !== "" && exportDays !== null) params.days = Number(exportDays);
      const res = (await getAdminReferralsExportExcelApi(
        Object.keys(params).length ? params : undefined
      )) as AxiosResponse<Blob>;
      if (res.status !== 200 || !(res.data instanceof Blob)) {
        const text = res.data instanceof Blob ? await res.data.text() : String(res.data);
        const err = text
          ? (() => {
            try {
              return JSON.parse(text)?.message ?? text;
            } catch {
              return text;
            }
          })()
          : "Export failed.";
        toastError(err);
        return;
      }
      const blob = res.data;
      const disposition = res.headers?.["content-disposition"];
      const filenameMatch =
        typeof disposition === "string" ? disposition.match(/filename="?([^";\n]+)"?/) : null;
      const filename =
        (filenameMatch && filenameMatch[1]?.trim()) ||
        `referrals-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toastSuccess("Referrals exported successfully.");
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const selectClass =
    "min-h-[42px] w-full min-w-0 rounded-xl border border-rcn-border bg-white pl-3 pr-8 py-2 text-sm text-rcn-text outline-none focus:ring-2 focus:ring-rcn-accent/30 focus:border-rcn-accent appearance-none bg-[length:12px] bg-[right_0.5rem_center] bg-no-repeat";

  return (
    <div className="border border-rcn-border rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] my-2 overflow-hidden">
      <div className="px-4 py-3 border-b border-rcn-border bg-slate-50/80">
        <h3 className="text-sm font-semibold text-rcn-dark-bg m-0">Export referrals</h3>
        <p className="text-xs text-rcn-muted mt-0.5 m-0">
          Filter by organization, branch, or department and download as Excel (.xlsx).
        </p>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rcn-muted">Organization</label>
            <div className="min-w-0">
              <CustomAsyncSelect
                value={selectedOrg}
                onChange={handleOrgChange}
                loadOptions={loadOrgOptions}
                placeholder="All organizations"
                aria-label="Filter by organization"
                defaultOptions={true}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rcn-muted">Branch</label>
            <div className="min-w-0">
              <CustomAsyncSelect
                value={selectedBranch}
                onChange={handleBranchChange}
                loadOptions={loadBranchOptions}
                placeholder="All branches"
                aria-label="Filter by branch"
                isDisabled={!selectedOrgId}
                defaultOptions={true}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rcn-muted">Department</label>
            <div className="min-w-0">
              <CustomAsyncSelect
                value={selectedDept}
                onChange={handleDeptChange}
                loadOptions={loadDeptOptions}
                placeholder="All departments"
                aria-label="Filter by department"
                isDisabled={!selectedOrgId}
                defaultOptions={true}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rcn-muted">Type</label>
            <select
              value={exportReferralType}
              onChange={(e) =>
                setExportReferralType((e.target.value || "") as "sent" | "received" | "")
              }
              className={selectClass}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="">All</option>
              <option value="sent">Sent</option>
              <option value="received">Received</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 pt-1">
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label className="text-xs font-medium text-rcn-muted">Period</label>
            <select
              value={exportDays === "" ? "" : String(exportDays)}
              onChange={(e) => setExportDays(e.target.value === "" ? "" : Number(e.target.value))}
              className={selectClass}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="">All time</option>
              <option value="1">Today</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportExcel}
            disabled={exporting}
            className="min-h-[42px] px-4"
          >
            {exporting ? "Exporting…" : <PrintIcon size={24} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
