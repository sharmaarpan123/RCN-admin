"use client";

import type { AxiosResponse } from "axios";
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, ConfirmModal, TableLayout, type TableColumn } from "@/components";
import {
  getAdminPaymentSettingsApi,
  updateAdminPaymentSettingsApi,
} from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastSuccess } from "@/utils/toast";
import { TopUpOrganizationBalance } from "@/components/MasterAdmin/payment-settings/TopUpOrganizationBalance";

type PaymentMethodItem = {
  id: string;
  name: string;
  key: string;
  is_active: boolean;
};

type DirectMethodItem = PaymentMethodItem & {
  base_amount: number;
  processing_fee_percent: number;
  processing_fee_amount: number;
  total: number;
};

type CreditMethodItem = PaymentMethodItem & {
  credit_price: number;
  processing_fee_percent: number;
  processing_fee_amount: number;
  total: number;
};

type PaymentSettingsData = {
  currency: string;
  credit_price: number;
  direct_base_amount: number;
  credit_threshold_amount: number | null;
  credit_threshold_percent_off: number | null;
  auto_send_invoice: boolean;
  all_methods: PaymentMethodItem[];
  direct_methods: DirectMethodItem[];
  credit_methods: CreditMethodItem[];
};

type PaymentSettingsApiResponse = {
  success: boolean;
  message: string;
  data: PaymentSettingsData;
};

const DEFAULT_SETTINGS: PaymentSettingsData = {
  currency: "USD",
  credit_price: 5,
  direct_base_amount: 5,
  credit_threshold_amount: null,
  credit_threshold_percent_off: null,
  auto_send_invoice: false,
  all_methods: [],
  direct_methods: [],
  credit_methods: [],
};

const PaymentSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";

  const [methodsById, setMethodsById] = useState<Record<string, boolean>>({});
  const [directFeeById, setDirectFeeById] = useState<Record<string, number>>({});
  const [creditFeeById, setCreditFeeById] = useState<Record<string, number>>({});
  const [creditPrice, setCreditPrice] = useState(5);
  const [directBaseAmount, setDirectBaseAmount] = useState(5);
  const [creditThresholdAmount, setCreditThresholdAmount] = useState<number>(10);
  const [creditThresholdPercentOff, setCreditThresholdPercentOff] = useState(10);
  const [autoSendInvoice, setAutoSendInvoice] = useState(true);
  const [previewMethodId, setPreviewMethodId] = useState<string>("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { data: queryData, isLoading } = useQuery({
    queryKey: defaultQueryKeys.paymentSettings,
    queryFn: async () => {
      const res = await getAdminPaymentSettingsApi();
      if (!checkResponse({ res })) return { data: DEFAULT_SETTINGS } as PaymentSettingsApiResponse;
      return res.data as PaymentSettingsApiResponse;
    },
  });

  const settings = queryData?.data ?? DEFAULT_SETTINGS;
  const allMethods = useMemo(() => settings.all_methods ?? [], [settings.all_methods]);
  const directMethods = useMemo(() => settings.direct_methods ?? [], [settings.direct_methods]);
  const creditMethods = useMemo(() => settings.credit_methods ?? [], [settings.credit_methods]);

  // Sync server data into form state when settings load/update (e.g. after refetch on reset).
  useEffect(() => {
    if (!queryData?.data) return;
    const d = queryData.data;
    const byId: Record<string, boolean> = {};
    d.all_methods?.forEach((m) => {
      byId[m.id] = m.is_active;
    });
    const directFees: Record<string, number> = {};
    d.direct_methods?.forEach((m) => {
      directFees[m.id] = m.processing_fee_percent ?? 0;
    });
    const creditFees: Record<string, number> = {};
    d.credit_methods?.forEach((m) => {
      creditFees[m.id] = m.processing_fee_percent ?? 0;
    });
    const firstEnabled = d.all_methods?.find((m) => m.is_active);
    const previewId = firstEnabled?.id ?? d.all_methods?.[0]?.id ?? "";

    queueMicrotask(() => {
      setMethodsById(byId);
      setDirectFeeById(directFees);
      setCreditFeeById(creditFees);
      setCreditPrice(d.credit_price ?? 5);
      setDirectBaseAmount(d.direct_base_amount ?? 5);
      setCreditThresholdAmount(d.credit_threshold_amount ?? 10);
      setCreditThresholdPercentOff(d.credit_threshold_percent_off ?? 10);
      setAutoSendInvoice(d.auto_send_invoice ?? false);
      setPreviewMethodId(previewId);
    });
  }, [queryData]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.paymentSettings });

  const saveMutation = useMutation<AxiosResponse | void, Error, void>({
    mutationFn: catchAsync(async () => {
      const current = queryClient.getQueryData<PaymentSettingsApiResponse>(
        defaultQueryKeys.paymentSettings
      );
      const data = current?.data ?? settings;
      const all = data.all_methods ?? [];
      const direct = data.direct_methods ?? [];
      const credit = data.credit_methods ?? [];

      const body = {
        credit_threshold_amount: creditThresholdAmount,
        credit_threshold_percent_off: creditThresholdPercentOff,
        auto_send_invoice: autoSendInvoice,
        methods: all.map((m) => ({
          payment_method_id: m.id,
          is_active: methodsById[m.id] ?? m.is_active,
        })),
        direct: {
          base_amount: directBaseAmount,
          methods: direct.map((m) => ({
            payment_method_id: m.id,
            processing_fee_percent: directFeeById[m.id] ?? m.processing_fee_percent ?? 0,
          })),
        },
        credit: {
          credit_price: creditPrice,
          methods: credit.map((m) => ({
            payment_method_id: m.id,
            processing_fee_percent: creditFeeById[m.id] ?? m.processing_fee_percent ?? 0,
          })),
        },
      };
      return updateAdminPaymentSettingsApi(body);
    }),
    onSuccess: (res) => {
      if (res && checkResponse({ res, showSuccess: true })) invalidate();
    },
  });

  const handleSave = () => saveMutation.mutate();

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    invalidate();
    toastSuccess("Settings reset to defaults.");
  };

  const enabledMethodIds = useMemo(
    () => allMethods.filter((m) => methodsById[m.id] !== false).map((m) => m.id),
    [allMethods, methodsById]
  );

  const calculateCreditProcessingFee = (methodId: string) => {
    const pct = creditFeeById[methodId] ?? 0;
    return creditPrice * (pct / 100);
  };

  const calculateCreditTotal = (methodId: string) =>
    creditPrice + calculateCreditProcessingFee(methodId);

  type PaymentMethodRow = {
    id: string;
    name: string;
    enabled: boolean;
    feePct: number;
    feeDollar: number;
    total: number;
  };

  const paymentMethodData: PaymentMethodRow[] = useMemo(() => {
    return creditMethods.map((m) => {
      const feePct = creditFeeById[m.id] ?? 0;
      const feeDollar = creditPrice * (feePct / 100);
      const total = creditPrice + feeDollar;
      return {
        id: m.id,
        name: m.name,
        enabled: methodsById[m.id] !== false,
        feePct,
        feeDollar,
        total,
      };
    });
  }, [creditMethods, methodsById, creditFeeById, creditPrice]);

  const paymentMethodColumns: TableColumn<PaymentMethodRow>[] = [
    {
      head: "Payment Method",
      component: (row) => (
        <>
          {row.name}
          {!row.enabled && (
            <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] opacity-70">
              Off
            </span>
          )}
        </>
      ),
    },
    {
      head: "Processing Fee (%)",
      component: (row) => <span className="font-mono">{row.feePct.toFixed(2)}</span>,
    },
    {
      head: "Processing Fee ($)",
      component: (row) => <span className="font-mono">{row.feeDollar.toFixed(2)}</span>,
    },
    {
      head: "Total ($)",
      component: (row) => <span className="font-mono">{row.total.toFixed(2)}</span>,
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <p className="text-sm text-rcn-muted">Loading payment settings…</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Payment Adjustment Settings</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">
              Toggle payment methods, configure fees, and set referral bonus rules.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Reset defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving…" : "Save Settings"}
            </Button>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3.5" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Payment Methods */}
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
            <h3 className="text-sm font-semibold m-0 mb-2.5">Payment Methods</h3>
            <p className="text-xs text-rcn-muted m-0 mb-2.5">
              Enable/disable the payment methods available in the network.
            </p>

            <div className="flex flex-wrap gap-2 mt-2.5">
              {allMethods.map((m) => (
                <label
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]"
                >
                  <input
                    type="checkbox"
                    checked={methodsById[m.id] !== false}
                    onChange={(e) =>
                      setMethodsById((prev) => ({ ...prev, [m.id]: e.target.checked }))
                    }
                  />
                  {m.name}
                </label>
              ))}
            </div>

            <div className="h-px bg-rcn-border my-3.5" />

            <h4 className="text-sm font-semibold m-0 mb-2.5">
              Direct Payment Methods — Processing Fee by Method (%)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {directMethods.map((m) => (
                <div key={m.id} className="flex flex-col gap-1.5">
                  <label className="text-xs text-rcn-muted">{m.name}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={directFeeById[m.id] ?? 0}
                    onChange={(e) =>
                      setDirectFeeById((prev) => ({
                        ...prev,
                        [m.id]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="h-px bg-rcn-border my-3.5" />
            <p className="text-xs text-rcn-muted m-0">
              Enabled:{" "}
              {enabledMethodIds.length
                ? allMethods
                  .filter((m) => enabledMethodIds.includes(m.id))
                  .map((m) => m.name)
                  .join(", ")
                : "—"}
            </p>
          </div>

          {/* Credit Methods Charges */}
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
            <h3 className="text-sm font-semibold m-0 mb-2.5">Credit Methods Charges</h3>
            <p className="text-xs text-rcn-muted m-0 mb-2.5">
              Total = Credit price + (Credit price × Processing Fee %) — varies by payment method.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Credit price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={creditPrice}
                  onChange={(e) => setCreditPrice(parseFloat(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Preview Payment Method</label>
                <select
                  value={previewMethodId}
                  onChange={(e) => setPreviewMethodId(e.target.value)}
                  className={inputClass}
                >
                  {creditMethods
                    .filter((m) => enabledMethodIds.includes(m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">
                  Processing Fee (Selected Method) (% and $)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${(creditFeeById[previewMethodId])}`}
                  className={inputClass}
                  onChange={(e) => setCreditFeeById((prev) => ({ ...prev, [previewMethodId]: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">
                  Total Charge (Selected Method) ($)
                </label>
                <input
                  type="text"
                  onChange={(e) => setCreditPrice(parseFloat(e.target.value) || 0)}
                  value={calculateCreditTotal(previewMethodId).toFixed(2)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="h-px bg-rcn-border my-3.5" />

            <div className="overflow-auto">
              <TableLayout
                columns={paymentMethodColumns}
                data={paymentMethodData}
                variant="bordered"
                size="sm"
                getRowKey={(row) => row.id}
              />
            </div>

            <p className="text-xs text-rcn-muted mt-2.5 mb-0">
              Fees are used for calculation previews.
            </p>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3.5" />

        {/* Referral & Purchase Bonus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
            <h3 className="text-sm font-semibold m-0 mb-2.5">Referral &amp; Purchase Bonus</h3>
            <p className="text-xs text-rcn-muted m-0 mb-3">
              Bulk purchase: A <strong>{creditThresholdPercentOff}% discount</strong> applies
              automatically when purchasing <strong>more than {creditThresholdAmount}</strong>{" "}
              referral credits.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted font-semibold">
                  Bulk Discount Threshold (credits)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={creditThresholdAmount}
                  onChange={(e) =>
                    setCreditThresholdAmount(parseInt(e.target.value, 10) || 0)
                  }
                  className={inputClass}
                />
                <p className="text-xs text-rcn-muted mt-1 mb-0">
                  Discount applies when quantity &gt; threshold.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted font-semibold">Bulk Discount (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={creditThresholdPercentOff}
                  onChange={(e) =>
                    setCreditThresholdPercentOff(parseFloat(e.target.value) || 0)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <TopUpOrganizationBalance />
        </div>

        {/* Invoice Automation */}
        <div
          className="bg-white border border-rcn-border rounded-xl mt-3 p-3"
          style={{ background: "rgba(255,255,255,.55)" }}
        >
          <div className="flex justify-between items-center">
            <div>
              <strong className="text-sm">Invoice Automation</strong>
              <div className="text-xs text-rcn-muted mt-1">
                Invoices are created automatically when an organization purchases credits. Option
                to open an email draft (mailto) after invoice creation.
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
              Auto
            </span>
          </div>
          <div className="h-px bg-rcn-border my-2" />
          <label className="inline-flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSendInvoice}
              onChange={(e) => setAutoSendInvoice(e.target.checked)}
              className="mt-0.5"
            />
            <div>
              <div className="text-sm font-bold">Auto-open email draft after invoice creation</div>
              <div className="text-xs text-rcn-muted mt-0.5">
                If your browser blocks popups, you can send later from Financials → Invoices.
              </div>
            </div>
          </label>
        </div>
      </div>

      <ConfirmModal
        type="delete"
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title="Reset defaults"
        message="Reset payment settings to defaults? This will refetch from the server."
        confirmLabel="Reset"
      />
    </>
  );
};

export default PaymentSettings;
