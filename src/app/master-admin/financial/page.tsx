"use client";
import React, { useState, useEffect } from 'react';
import { TableLayout, type TableColumn } from '../../../components';
import { toastSuccess, toastWarning } from '../../../utils/toast';
import { MOCK_FINANCIAL_ORGS, MOCK_FINANCIAL_REFERRALS, MOCK_LEDGER, MOCK_INVOICES } from './mockData';

const safeLower = (s: any) => (s || "").toString().toLowerCase();

const Financial: React.FC = () => {
  // Mock data
  const orgs = MOCK_FINANCIAL_ORGS;
  const referralsData = MOCK_FINANCIAL_REFERRALS;
  const ledger = MOCK_LEDGER;
  const invoices = MOCK_INVOICES;

  // Time frame state
  const [timePreset, setTimePreset] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Invoice filters
  const [invSearch, setInvSearch] = useState('');
  const [invFromDate, setInvFromDate] = useState('');
  const [invToDate, setInvToDate] = useState('');
  const [invStatus, setInvStatus] = useState('All');

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

  const isInTimeRange = (dateStr: string) => {
    if (!fromDate && !toDate) return true;
    const date = new Date(dateStr);
    if (fromDate) {
      const from = new Date(fromDate + 'T00:00:00');
      if (date < from) return false;
    }
    if (toDate) {
      const to = new Date(toDate + 'T23:59:59');
      if (date > to) return false;
    }
    return true;
  };

  const getTimeRangeLabel = () => {
    if (timePreset === 'all' || (!fromDate && !toDate)) return 'All time';
    if (!fromDate) return `Up to ${new Date(toDate).toLocaleDateString()}`;
    if (!toDate) return `From ${new Date(fromDate).toLocaleDateString()}`;
    return `${new Date(fromDate).toLocaleDateString()} – ${new Date(toDate).toLocaleDateString()}`;
  };

  // Calculate financial
  const referrals = referralsData.filter((r: any) => isInTimeRange(r.createdAt));
  const ledgerFiltered = ledger.filter((e: any) => isInTimeRange(e.at));
  
  const grossCents = ledgerFiltered
    .filter((e: any) => e.deltaCents < 0)
    .reduce((sum: number, e: any) => sum + Math.abs(e.deltaCents || 0), 0);
  
  const bonusCents = ledgerFiltered
    .filter((e: any) => e.type === 'sender_bonus')
    .reduce((sum: number, e: any) => sum + Math.abs(e.deltaCents || 0), 0);
  
  const netCents = grossCents - bonusCents;

  const centsToMoney = (cents: number) => (cents / 100).toFixed(2);

  // Referrals by organization
  const orgStats: Record<string, { sent: number; received: number; total: number; state: string }> = {};
  orgs.forEach((o: any) => {
    orgStats[o.id] = { sent: 0, received: 0, total: 0, state: o.address?.state || '' };
  });

  referrals.forEach((r: any) => {
    if (orgStats[r.senderOrgId]) {
      orgStats[r.senderOrgId].sent++;
      orgStats[r.senderOrgId].total++;
    }
    if (orgStats[r.receiverOrgId]) {
      orgStats[r.receiverOrgId].received++;
      orgStats[r.receiverOrgId].total++;
    }
  });

  const orgRows = orgs.map((o: any) => ({
    id: o.id,
    name: o.name,
    ...orgStats[o.id]
  })).sort((a: any, b: any) => b.total - a.total);

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

  type StateRow = { state: string; count: number };
  const stateTableColumns: TableColumn<StateRow>[] = [
    { head: "State", accessor: "state", tdClassName: "font-mono" },
    { head: "Referrals", component: (row) => <b className="font-mono">{row.count}</b> },
  ];

  // Referrals by state
  const receiverStateCount: Record<string, number> = {};
  const senderStateCount: Record<string, number> = {};

  referrals.forEach((r: any) => {
    const senderOrg = orgs.find((o: any) => o.id === r.senderOrgId);
    const receiverOrg = orgs.find((o: any) => o.id === r.receiverOrgId);
    
    const sState = senderOrg?.address?.state || '—';
    const rState = receiverOrg?.address?.state || '—';
    
    senderStateCount[sState] = (senderStateCount[sState] || 0) + 1;
    receiverStateCount[rState] = (receiverStateCount[rState] || 0) + 1;
  });

  const receiverStateRows = Object.entries(receiverStateCount)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  const senderStateRows = Object.entries(senderStateCount)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv: any) => {
    if (!isInTimeRange(inv.createdAt)) return false;
    
    if (invSearch) {
      const searchLower = safeLower(invSearch);
      const hay = safeLower(
        (inv.number || '') + ' ' + 
        (inv.orgName || '') + ' ' + 
        (inv.orgEmail || '')
      );
      if (!hay.includes(searchLower)) return false;
    }

    if (invFromDate) {
      const invDate = new Date(inv.createdAt);
      const from = new Date(invFromDate + 'T00:00:00');
      if (invDate < from) return false;
    }

    if (invToDate) {
      const invDate = new Date(inv.createdAt);
      const to = new Date(invToDate + 'T23:59:59');
      if (invDate > to) return false;
    }

    if (invStatus !== 'All' && inv.emailStatus !== invStatus.toUpperCase()) return false;

    return true;
  });

  type InvoiceRow = { id: string; number?: string; orgName?: string; orgEmail?: string; createdAt: string; totalCents?: number; emailStatus?: string };
  const invoiceTableColumns: TableColumn<InvoiceRow>[] = [
    { head: "Invoice #", component: (inv) => <span className="font-mono font-semibold">{inv.number}</span> },
    { head: "Organization", accessor: "orgName" },
    { head: "Email", component: (inv) => <span className="font-mono">{inv.orgEmail || '—'}</span> },
    { head: "Date", component: (inv) => <span className="font-mono">{new Date(inv.createdAt).toLocaleDateString()}</span> },
    { head: "Total", component: (inv) => <span className="font-mono font-semibold">${centsToMoney(inv.totalCents || 0)}</span> },
    { head: "Status", component: (inv) => <span className="font-mono">{inv.emailStatus || 'PENDING'}</span> },
    {
      head: "Actions",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Actions column does not use row
      component: (_inv: InvoiceRow) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => toastWarning('View invoice functionality not implemented')}
            className="border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => toastWarning('Email functionality not implemented')}
            className="border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
          >
            Email
          </button>
        </div>
      ),
    },
  ];

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

  const handleClearInvoiceFilters = () => {
    setInvSearch('');
    setInvFromDate('');
    setInvToDate('');
    setInvStatus('All');
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
              <button onClick={() => toastWarning('Data refreshed.')} className={btnClass}>Refresh</button>
            </div>
          </div>
          <p className="text-xs text-rcn-muted mt-2 mb-0">
            Time frame: {getTimeRangeLabel()} • Tip: Print lets you "Save as PDF".
          </p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-rcn-border rounded-xl p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs mb-1">Total referrals</div>
            <div className="text-3xl font-extrabold">{referrals.length}</div>
            <div className="text-xs text-rcn-muted mt-1">All referrals created in the system.</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-xl p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs mb-1">Total income (net)</div>
            <div className="text-3xl font-extrabold">${centsToMoney(netCents)}</div>
            <div className="text-xs text-rcn-muted mt-1">Gross collected minus bonuses paid.</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-xl p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs mb-1">Gross collected</div>
            <div className="text-3xl font-extrabold">${centsToMoney(grossCents)}</div>
            <div className="text-xs text-rcn-muted mt-1">Fees + credit purchases recorded in the ledger.</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-xl p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs mb-1">Bonuses paid out</div>
            <div className="text-3xl font-extrabold">${centsToMoney(bonusCents)}</div>
            <div className="text-xs text-rcn-muted mt-1">Sender bonuses from receiver-paid referrals.</div>
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
              Sender &amp; receiver
            </span>
          </div>
          <p className="text-xs text-rcn-muted mb-3">Counts are based on the sender/receiver organization state.</p>

          {/* Receiver State */}
          <div className="bg-white border border-rcn-border rounded-xl p-3 mb-3" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs font-semibold mb-2">Receiver organization state</div>
            <TableLayout<StateRow>
              columns={stateTableColumns}
              data={receiverStateRows}
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
              variant="bordered"
              size="sm"
              emptyMessage="No data."
            />
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold m-0 mb-1">Invoices</h3>
            <p className="text-xs text-rcn-muted m-0">
              Invoices are generated automatically when an organization purchases credits. Use Email to open a draft addressed to the organization email.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
              Count: {filteredInvoices.length}
            </span>
          </div>
        </div>

        {/* Invoice Filters */}
        <div className="flex flex-wrap gap-3 items-end mb-3">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
            <label className="text-xs text-rcn-muted font-semibold">Search</label>
            <input 
              value={invSearch}
              onChange={(e) => setInvSearch(e.target.value)}
              placeholder="Invoice #, organization, email..."
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-xs text-rcn-muted font-semibold">From</label>
            <input 
              type="date"
              value={invFromDate}
              onChange={(e) => setInvFromDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-xs text-rcn-muted font-semibold">To</label>
            <input 
              type="date"
              value={invToDate}
              onChange={(e) => setInvToDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-xs text-rcn-muted font-semibold">Status</label>
            <select 
              value={invStatus}
              onChange={(e) => setInvStatus(e.target.value)}
              className={inputClass}
            >
              <option value="All">All</option>
              <option value="PENDING">PENDING</option>
              <option value="SENT">SENT</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={() => toastWarning('Filters applied.')} className={btnPrimaryClass}>Apply</button>
            <button onClick={handleClearInvoiceFilters} className={btnClass}>Clear</button>
          </div>
        </div>

        {/* Invoice Table */}
        <TableLayout<InvoiceRow>
          columns={invoiceTableColumns}
          data={filteredInvoices}
          variant="bordered"
          size="sm"
          emptyMessage="No invoices found."
          getRowKey={(row) => row.id}
        />
      </div>

    </>
  );
};

export default Financial;
