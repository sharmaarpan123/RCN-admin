"use client";
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TableLayout, type TableColumn } from '../../../components';
import { toastSuccess, toastWarning } from '../../../utils/toast';
import { getAdminFinancialReportApi } from '@/apis/ApiCalls';
import defaultQueryKeys from '@/utils/adminQueryKeys';
import { checkResponse } from '@/utils/commonFunc';

type FinancialReportData = {
  total_referrals: number;
  total_income: number;
  payment_from_credit_purchase: number;
  payment_from_referrals_direct: number;
  payment_from_fees: number;
  organizations: Array<{
    id: string;
    name: string;
    sent: number;
    received: number;
    total: number;
    state: string;
  }>;
  state_wise_referrals_received: Array<{ state: string; count: number }>;
  state_wise_referrals_sent: Array<{ state: string; count: number }>;
};

type FinancialReportApiResponse = {
  success?: boolean;
  message?: string;
  data?: FinancialReportData;
  meta?: unknown;
};

const safeLower = (s: any) => (s || "").toString().toLowerCase();

const Financial: React.FC = () => {
  // API data
  const { data: financialRes, isLoading: financialLoading, refetch } = useQuery({
    queryKey: defaultQueryKeys.financialReportList,
    queryFn: async () => {
      const res = await getAdminFinancialReportApi();
      if (!checkResponse({ res })) return { data: undefined } as FinancialReportApiResponse;
      return (res.data ?? { data: undefined }) as FinancialReportApiResponse;
    },
  });

  const financialData = financialRes?.data;

  // Time frame state
  const [timePreset, setTimePreset] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
  const btnPrimaryClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";

  const setDateToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  };

  useEffect(() => {
    if (timePreset === 'all') {
      setFromDate('');
      setToDate('');
    } else if (timePreset === 'today') {
      const today = setDateToday();
      setFromDate(today);
      setToDate(today);
    } else if (timePreset === '7' || timePreset === '30' || timePreset === '90') {
      const days = parseInt(timePreset);
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - (days - 1));
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(today.toISOString().split('T')[0]);
    }
  }, [timePreset]);

  const getTimeRangeLabel = () => {
    if (timePreset === 'all' || (!fromDate && !toDate)) return 'All time';
    if (!fromDate) return `Up to ${new Date(toDate).toLocaleDateString()}`;
    if (!toDate) return `From ${new Date(fromDate).toLocaleDateString()}`;
    return `${new Date(fromDate).toLocaleDateString()} – ${new Date(toDate).toLocaleDateString()}`;
  };

  const centsToMoney = (cents: number) => (cents / 100).toFixed(2);

  // Get data from API
  const totalReferrals = financialData?.total_referrals ?? 0;
  const totalIncome = financialData?.total_income ?? 0;
  const paymentFromCreditPurchase = financialData?.payment_from_credit_purchase ?? 0;
  const paymentFromReferralsDirect = financialData?.payment_from_referrals_direct ?? 0;
  const paymentFromFees = financialData?.payment_from_fees ?? 0;

  // Organization data
  const orgRows = financialData?.organizations ?? [];
  
  type OrgRow = { id: string; name: string; state: string; sent: number; received: number; total: number };
  const orgTableColumns: TableColumn<OrgRow>[] = [
    {
      head: "Organization",
      component: (row) => (
        <>
          <b>{row.name}</b>
          <div className="text-rcn-muted font-mono text-[11px]">({row.id})</div>
        </>
      ),
    },
    { head: "State", accessor: "state", tdClassName: "font-mono" },
    { head: "Sent", accessor: "sent", tdClassName: "font-mono" },
    { head: "Received", accessor: "received", tdClassName: "font-mono" },
    { head: "Total", component: (row) => <b className="font-mono">{row.total}</b> },
  ];

  // State-wise data
  type StateRow = { state: string; count: number };
  const stateTableColumns: TableColumn<StateRow>[] = [
    { head: "State", accessor: "state", tdClassName: "font-mono" },
    { head: "Referrals", component: (row) => <b className="font-mono">{row.count}</b> },
  ];

  const receiverStateRows = financialData?.state_wise_referrals_received ?? [];
  const senderStateRows = financialData?.state_wise_referrals_sent ?? [];

  const handleApplyTime = () => {
    toastWarning('Time frame applied.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePDF = () => {
    toastWarning('PDF export: Use Print → Save as PDF');
    setTimeout(() => window.print(), 100);
  };

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-3.5">
        {/* Time Frame Filter */}
        <div className="bg-white border border-rcn-border rounded-xl p-3 mb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5 min-w-[220px]">
              <label className="text-xs text-rcn-muted font-semibold">Time frame</label>
              <select 
                value={timePreset} 
                onChange={(e) => setTimePreset(e.target.value)} 
                className={inputClass}
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[170px]">
              <label className="text-xs text-rcn-muted font-semibold">From</label>
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => { setFromDate(e.target.value); setTimePreset('custom'); }}
                disabled={timePreset !== 'custom'}
                className={inputClass}
                placeholder="dd-mm-yyyy"
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-[170px]">
              <label className="text-xs text-rcn-muted font-semibold">To</label>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => { setToDate(e.target.value); setTimePreset('custom'); }}
                disabled={timePreset !== 'custom'}
                className={inputClass}
                placeholder="dd-mm-yyyy"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleApplyTime} className={btnPrimaryClass}>Apply</button>
              <button onClick={handlePrint} className={btnClass}>Print</button>
              <button onClick={handlePDF} className={btnClass}>PDF</button>
            </div>

            <div className="ml-auto">
              <button onClick={() => refetch()} className={btnClass}>Refresh</button>
            </div>
          </div>
          <p className="text-xs text-rcn-muted mt-2 mb-0">
            Time frame: {getTimeRangeLabel()} • Tip: Print lets you "Save as PDF".
          </p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white border border-rcn-border rounded-xl p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs mb-1">Total referrals</div>
            <div className="text-3xl font-extrabold">{totalReferrals}</div>
            <div className="text-xs text-rcn-muted mt-1">All referrals created in the system.</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-xl p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs mb-1">Total income (net)</div>
            <div className="text-3xl font-extrabold">${centsToMoney(totalIncome)}</div>
            <div className="text-xs text-rcn-muted mt-1">Gross collected minus bonuses paid.</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-xl p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs mb-1">Credit purchases</div>
            <div className="text-3xl font-extrabold">${centsToMoney(paymentFromCreditPurchase)}</div>
            <div className="text-xs text-rcn-muted mt-1">Revenue from credit purchases.</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-xl p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs mb-1">Referrals direct</div>
            <div className="text-3xl font-extrabold">${centsToMoney(paymentFromReferralsDirect)}</div>
            <div className="text-xs text-rcn-muted mt-1">Direct referral payments.</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-xl p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs mb-1">Fees</div>
            <div className="text-3xl font-extrabold">${centsToMoney(paymentFromFees)}</div>
            <div className="text-xs text-rcn-muted mt-1">Revenue from fees.</div>
          </div>
        </div>
      </div>

      {/* Referrals by Organization and State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
        {/* Referrals by Organization */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold m-0">Referrals by organization</h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
              Sent vs received
            </span>
          </div>

          <TableLayout<OrgRow>
            columns={orgTableColumns}
            data={orgRows}
            loader={financialLoading}
            variant="bordered"
            size="sm"
            emptyMessage="No data."
            getRowKey={(row) => row.id}
          />
        </div>

        {/* Referrals by State */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold m-0">Referrals by state</h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
              Sender & receiver
            </span>
          </div>
          <p className="text-xs text-rcn-muted mb-3">Counts are based on the sender/receiver organization state.</p>

          {/* Receiver State */}
          <div className="bg-white border border-rcn-border rounded-xl p-3 mb-3" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs font-semibold mb-2">Receiver organization state</div>
            <TableLayout<StateRow>
              columns={stateTableColumns}
              data={receiverStateRows}
              loader={financialLoading}
              variant="bordered"
              size="sm"
              emptyMessage="No data."
            />
          </div>

          {/* Sender State */}
          <div className="bg-white border border-rcn-border rounded-xl p-3" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs font-semibold mb-2">Sender organization state</div>
            <TableLayout<StateRow>
              columns={stateTableColumns}
              data={senderStateRows}
              loader={financialLoading}
              variant="bordered"
              size="sm"
              emptyMessage="No data."
            />
          </div>
        </div>
      </div>

    </>
  );
};

export default Financial;
