"use client";

import { getAuthProfileApi, getStatesApi, getStaffOrganizationsApi, postStaffBranchesByOrganizationsApi, postStaffDepartmentsByBranchesApi, putUserProfileApi } from "@/apis/ApiCalls";
import { Button } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import defaultStaffQueryKeys from "@/utils/staffQueryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type Option = { label: string; value: string };

type StateApiItem = { id: number | string; name: string; code?: string };

type OrganizationItem = {
  _id: string;
  name: string;
};

type BranchApiItem = {
  _id: string;
  name: string;
};

type DepartmentApiItem = {
  _id: string;
  name: string;
};

interface StaffProfile {
  join_request?: {
    status?: string;
    organization?: { name?: string };
    branch?: { name?: string };
    department?: { name?: string };
  } | null;
  is_guest?: boolean;
}

export default function StaffLinkOrganizationPage() {
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: defaultStaffQueryKeys.profile,
    queryFn: async () => {
      const res = await getAuthProfileApi();
      if (!checkResponse({ res })) return null;
      const raw = res.data as { data?: StaffProfile };
      return raw?.data ?? null;
    },
  });

  const joinRequest = profileData?.join_request ?? null;
  const hasJoinRequest =
    !!joinRequest && typeof joinRequest === "object" && Object.keys(joinRequest).length > 0;
  const joinStatus = (joinRequest?.status || "pending").toString().toLowerCase();
  const isRejected = hasJoinRequest && joinStatus === "rejected";

  const [selectedState, setSelectedState] = useState<Option | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Option | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Option | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Option | null>(null);
  const [branches, setBranches] = useState<BranchApiItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentApiItem[]>([]);

  const { data: statesData } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const res = await getStatesApi();
      if (!checkResponse({ res })) return { data: [] as StateApiItem[] };
      return res.data as { data?: StateApiItem[] };
    },
  });

  const stateOptions: Option[] = useMemo(
    () =>
      statesData?.data && Array.isArray(statesData.data) && statesData.data.length
        ? statesData.data.map((s) => ({
            label: s.name,
            value: s.name,
          }))
        : [],
    [statesData],
  );

  const { data: orgsData, isLoading: isLoadingOrganizations } = useQuery({
    queryKey: ["staff-organizations", selectedState?.value],
    queryFn: async () => {
      const res = await getStaffOrganizationsApi({
        state: selectedState?.value ?? "",
      });
      if (!checkResponse({ res })) return { data: [] as OrganizationItem[] };
      return res.data as { data?: OrganizationItem[] };
    },
    enabled: !!selectedState?.value,
  });

  const organizationOptions: Option[] = useMemo(() => {
    const list = orgsData?.data ?? [];
    if (!Array.isArray(list)) return [];
    return list.map((org) => ({
      label: org.name,
      value: org._id,
    }));
  }, [orgsData]);

  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["staff-branches-by-org", selectedOrganization?.value],
    queryFn: async () => {
      if (!selectedOrganization?.value) return { data: [] as BranchApiItem[] };
      const res = await postStaffBranchesByOrganizationsApi({
        organization_ids: [selectedOrganization.value],
      });
      if (!checkResponse({ res })) return { data: [] as BranchApiItem[] };
      return res.data as { data?: BranchApiItem[] };
    },
    enabled: !!selectedOrganization?.value,
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["staff-departments-by-branch", selectedBranch?.value],
    queryFn: async () => {
      if (!selectedBranch?.value) return { data: [] as DepartmentApiItem[] };
      const res = await postStaffDepartmentsByBranchesApi({
        branch_ids: [selectedBranch.value],
      });
      if (!checkResponse({ res })) return { data: [] as DepartmentApiItem[] };
      return res.data as { data?: DepartmentApiItem[] };
    },
    enabled: !!selectedBranch?.value,
  });

  // Keep local branch & department arrays in sync with queries
  useMemo(() => {
    const apiBranches = (branchesData?.data ?? []) as BranchApiItem[];
    setBranches(Array.isArray(apiBranches) ? apiBranches : []);
  }, [branchesData]);

  useMemo(() => {
    const apiDepartments = (departmentsData?.data ?? []) as DepartmentApiItem[];
    setDepartments(Array.isArray(apiDepartments) ? apiDepartments : []);
  }, [departmentsData]);

  const branchOptions: Option[] = useMemo(
    () =>
      branches.map((b) => ({
        label: b.name,
        value: b._id,
      })),
    [branches],
  );

  const departmentOptions: Option[] = useMemo(
    () =>
      departments.map((d) => ({
        label: d.name,
        value: d._id,
      })),
    [departments],
  );

  const { isPending: isSubmitting, mutate: submitMutation } = useMutation({
    mutationFn: catchAsync(async () => {
      if (!selectedOrganization || !selectedBranch || !selectedDepartment) {
        return;
      }

      const res = await putUserProfileApi({
        organization_id: selectedOrganization.value,
        branch_id: selectedBranch.value,
        department_id: selectedDepartment.value,
      });

      if (checkResponse({ res, showSuccess: true })) {
        queryClient.invalidateQueries({ queryKey: defaultStaffQueryKeys.profile });
      }
    }),
  });

  const isLoading =
    isProfileLoading || isLoadingOrganizations || isLoadingBranches || isLoadingDepartments || isSubmitting;

  const handleSubmit = () => {
    if (!selectedOrganization || !selectedBranch || !selectedDepartment) {
      // simple browser alert; in this app, toasts are already used via checkResponse/catchAsync
      window.alert("Please fill all fields.");
      return;
    }
    submitMutation();
  };

  const canEditSelection = !hasJoinRequest || isRejected;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold m-0">Link organization</h1>
        <p className="text-sm text-rcn-muted m-0 mt-1">
          Choose your organization, then branch and department so an admin can connect your account.
        </p>
      </div>

      {isLoading && (
        <div className="mb-4 text-sm text-rcn-muted">Loading…</div>
      )}

      {hasJoinRequest && (
        <div className="mb-6 rounded-2xl border border-rcn-border bg-white shadow-rcn p-4">
          <h2 className="text-sm font-semibold mb-2">Current request</h2>
          <p className="text-xs text-rcn-muted m-0 mb-3">
            {isRejected
              ? "Your previous request was rejected. You can review the details below and send a new request."
              : "Your request is being reviewed. You’ll be notified once it’s approved."}
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <dt className="font-medium text-rcn-muted">Organization</dt>
              <dd className="m-0">{joinRequest?.organization?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-rcn-muted">Branch</dt>
              <dd className="m-0">{joinRequest?.branch?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-rcn-muted">Department</dt>
              <dd className="m-0">{joinRequest?.department?.name ?? "—"}</dd>
            </div>
          </dl>
          <div
            className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              joinStatus === "approved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : joinStatus === "rejected"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {joinStatus.toUpperCase()}
          </div>
        </div>
      )}

      {canEditSelection && (
        <div className="rounded-2xl border border-rcn-border bg-white shadow-rcn p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-rcn-muted mb-1">
              State (business location)
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none"
              value={selectedState?.value ?? ""}
              onChange={(e) => {
                const value = e.target.value || "";
                const next = stateOptions.find((o) => o.value === value) ?? null;
                setSelectedState(next);
                setSelectedOrganization(null);
                setSelectedBranch(null);
                setSelectedDepartment(null);
              }}
            >
              <option value="">Select state</option>
              {stateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-rcn-muted mb-1">
              Organization (receiver)
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none disabled:bg-rcn-bg disabled:text-rcn-muted"
              value={selectedOrganization?.value ?? ""}
              onChange={(e) => {
                const value = e.target.value || "";
                const next =
                  organizationOptions.find((o) => o.value === value) ?? null;
                setSelectedOrganization(next);
                setSelectedBranch(null);
                setSelectedDepartment(null);
              }}
              disabled={!selectedState}
            >
              <option value="">Select organization</option>
              {organizationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-rcn-muted mb-1">
                Branch
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none disabled:bg-rcn-bg disabled:text-rcn-muted"
                value={selectedBranch?.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value || "";
                  const next = branchOptions.find((o) => o.value === value) ?? null;
                  setSelectedBranch(next);
                  setSelectedDepartment(null);
                }}
                disabled={!selectedOrganization}
              >
                <option value="">Select branch</option>
                {branchOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-rcn-muted mb-1">
                Department
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none disabled:bg-rcn-bg disabled:text-rcn-muted"
                value={selectedDepartment?.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value || "";
                  const next =
                    departmentOptions.find((o) => o.value === value) ?? null;
                  setSelectedDepartment(next);
                }}
                disabled={!selectedBranch}
              >
                <option value="">Select department</option>
                {departmentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !selectedOrganization ||
                !selectedBranch ||
                !selectedDepartment
              }
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

