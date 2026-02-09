"use client";

import type { AxiosResponse } from "axios";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components";
import {
  getAdminOrganizationsApi,
  postAdminOrganizationWalletTopupApi,
} from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import type { AdminOrganizationListItem } from "@/components/MasterAdmin/Organizations/types";

type OrganizationsApiResponse = {
  success?: boolean;
  data: AdminOrganizationListItem[];
};

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";

export function TopUpOrganizationBalance() {
  const queryClient = useQueryClient();
  const [organizationId, setOrganizationId] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const { data: orgsResponse } = useQuery({
    queryKey: defaultQueryKeys.organizationsList,
    queryFn: async () => {
      const res = await getAdminOrganizationsApi();
      if (!checkResponse({ res })) return { data: [] } as OrganizationsApiResponse;
      return res.data as OrganizationsApiResponse;
    },
  });

  const orgsList = orgsResponse?.data ?? [];

  const topUpMutation = useMutation<AxiosResponse | void, Error, void>({
    mutationFn: catchAsync(async () => {
      if (!organizationId) throw new Error("Please select an organization.");
      const num = Number(amount);
      if (!Number.isFinite(num) || num <= 0) throw new Error("Please enter a valid amount.");
      return postAdminOrganizationWalletTopupApi(organizationId, { amount: num });
    }),
    onSuccess: (res) => {
      if (res && checkResponse({ res, showSuccess: true })) {
        setAmount(0);
        queryClient.invalidateQueries({ queryKey: defaultQueryKeys.organizationsList });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    topUpMutation.mutate();
  };

  return (
    <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
      <h3 className="text-sm font-semibold m-0 mb-2.5">Top Up Organization Balance</h3>
      <p className="text-xs text-rcn-muted m-0 mb-3">Top up organization balance.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-rcn-muted font-semibold">Organization</label>
          <select
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select organization</option>
            {orgsList.map((org) => (
              <option key={org._id} value={org.organization_id}>
                {org.organization?.name ?? org._id} — {org.organization?.state ?? ""}{" "}
                {org.organization?.zip_code ?? ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-rcn-muted">Top Up credit amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount || ""}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className={inputClass}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full mt-1"
            disabled={topUpMutation.isPending}
          >
            {topUpMutation.isPending ? "Topping up…" : "Top Up"}
          </Button>
        </div>
      </form>
    </div>
  );
}
