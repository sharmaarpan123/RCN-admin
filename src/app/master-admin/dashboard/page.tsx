"use client";

import React, { useState } from 'react';
import { Button, CustomReactSelect, optionsFromStrings } from '../../../components';
import {
  US_STATES,
  fmtDate
} from '../../../utils/database';
import { MOCK_ORGS_DASHBOARD, MOCK_PAYMENT_SETTINGS, MOCK_REFERRALS_DASHBOARD } from './mockData';

const STATE_OPTIONS = optionsFromStrings(US_STATES);

const safeLower = (s: any) => (s || "").toString().toLowerCase();

const Dashboard: React.FC = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [showToastFlag, setShowToastFlag] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowToastFlag(true);
    setTimeout(() => setShowToastFlag(false), 2600);
  };

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  // Mock data
  const orgs = MOCK_ORGS_DASHBOARD;
  const referrals = MOCK_REFERRALS_DASHBOARD;
  const paymentSettings = MOCK_PAYMENT_SETTINGS;
  const [senderFilterName, setSenderFilterName] = useState('');
  const [senderFilterState, setSenderFilterState] = useState('');
  const [senderFilterZip, setSenderFilterZip] = useState('');
  const [senderOrgId, setSenderOrgId] = useState('');

  const [receiverFilterName, setReceiverFilterName] = useState('');
  const [receiverFilterState, setReceiverFilterState] = useState('');
  const [receiverFilterZip, setReceiverFilterZip] = useState('');
  const [receiverOrgId, setReceiverOrgId] = useState('');

  const [showSenderInbox, setShowSenderInbox] = useState(false);
  const [showReceiverInbox, setShowReceiverInbox] = useState(false);
  // Filter update trigger forces component re-render when filters change
  const [filterUpdateTrigger, setFilterUpdateTrigger] = useState(0);

  // Function to trigger filter update
  const triggerFilterUpdate = () => setFilterUpdateTrigger(prev => prev + 1);

  // KPIs
  const totalOrgs = orgs.length;
  const totalRefs = referrals.length;
  const since7 = new Date();
  since7.setDate(since7.getDate() - 7);
  const refs7Days = referrals.filter((r: any) => new Date(r.createdAt) >= since7).length;
  const pendingRefs = referrals.filter((r: any) => r.status === "Pending").length;

  // Filter organizations
  const filteredSenderOrgs = orgs.filter((o: any) => {
    if (!o.enabled) return false;
    const name = safeLower(o.name);
    const zip = safeLower(o.address.zip);
    const state = o.address.state;
    return (
      (!senderFilterName || name.includes(safeLower(senderFilterName))) &&
      (!senderFilterState || state === senderFilterState) &&
      (!senderFilterZip || zip.includes(safeLower(senderFilterZip)))
    );
  });

  const filteredReceiverOrgs = orgs.filter((o: any) => {
    if (!o.enabled) return false;
    const name = safeLower(o.name);
    const zip = safeLower(o.address.zip);
    const state = o.address.state;
    return (
      (!receiverFilterName || name.includes(safeLower(receiverFilterName))) &&
      (!receiverFilterState || state === receiverFilterState) &&
      (!receiverFilterZip || zip.includes(safeLower(receiverFilterZip)))
    );
  });

  const getSenderReferrals = () => {
    if (!senderOrgId) return [];

    // Trigger re-render when filters change
    void filterUpdateTrigger;

    // Get filter values from inputs
    const idFilter = safeLower((document.getElementById('senderF_id') as HTMLInputElement)?.value || '');
    const fromFilter = (document.getElementById('senderF_from') as HTMLInputElement)?.value || '';
    const toFilter = (document.getElementById('senderF_to') as HTMLInputElement)?.value || '';
    const patientFilter = safeLower((document.getElementById('senderF_patient') as HTMLInputElement)?.value || '');
    const dobFilter = (document.getElementById('senderF_dob') as HTMLInputElement)?.value || '';

    const pendingChecked = (document.getElementById('senderF_st_pending') as HTMLInputElement)?.checked;
    const acceptedChecked = (document.getElementById('senderF_st_accepted') as HTMLInputElement)?.checked;
    const rejectedChecked = (document.getElementById('senderF_st_rejected') as HTMLInputElement)?.checked;

    return referrals
      .filter((r: any) => {
        // Organization filter
        if (r.senderOrgId !== senderOrgId) return false;

        // ID filter
        if (idFilter && !safeLower(r.id).includes(idFilter)) return false;

        // Date range filter
        const refDate = new Date(r.createdAt);
        if (fromFilter) {
          const fromDate = new Date(fromFilter + 'T00:00:00');
          if (refDate < fromDate) return false;
        }
        if (toFilter) {
          const toDate = new Date(toFilter + 'T23:59:59');
          if (refDate > toDate) return false;
        }

        // Patient name filter
        if (patientFilter) {
          const fullName = safeLower(`${r.patient?.first || ''} ${r.patient?.last || ''}`);
          const reverseName = safeLower(`${r.patient?.last || ''} ${r.patient?.first || ''}`);
          if (!fullName.includes(patientFilter) && !reverseName.includes(patientFilter)) return false;
        }

        // DOB filter
        if (dobFilter && r.patient?.dob !== dobFilter) return false;

        // Status filter
        const statusMatches =
          (r.status === 'Pending' && pendingChecked) ||
          (r.status === 'Accepted' && acceptedChecked) ||
          (r.status === 'Rejected' && rejectedChecked);
        if (!statusMatches) return false;

        return true;
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getReceiverReferrals = () => {
    if (!receiverOrgId) return [];

    // Trigger re-render when filters change
    void filterUpdateTrigger;

    // Get filter values from inputs
    const idFilter = safeLower((document.getElementById('receiverF_id') as HTMLInputElement)?.value || '');
    const fromFilter = (document.getElementById('receiverF_from') as HTMLInputElement)?.value || '';
    const toFilter = (document.getElementById('receiverF_to') as HTMLInputElement)?.value || '';
    const patientFilter = safeLower((document.getElementById('receiverF_patient') as HTMLInputElement)?.value || '');
    const dobFilter = (document.getElementById('receiverF_dob') as HTMLInputElement)?.value || '';

    const pendingChecked = (document.getElementById('receiverF_st_pending') as HTMLInputElement)?.checked;
    const acceptedChecked = (document.getElementById('receiverF_st_accepted') as HTMLInputElement)?.checked;
    const rejectedChecked = (document.getElementById('receiverF_st_rejected') as HTMLInputElement)?.checked;

    return referrals
      .filter((r: any) => {
        // Organization filter
        if (r.receiverOrgId !== receiverOrgId) return false;

        // ID filter
        if (idFilter && !safeLower(r.id).includes(idFilter)) return false;

        // Date range filter
        const refDate = new Date(r.createdAt);
        if (fromFilter) {
          const fromDate = new Date(fromFilter + 'T00:00:00');
          if (refDate < fromDate) return false;
        }
        if (toFilter) {
          const toDate = new Date(toFilter + 'T23:59:59');
          if (refDate > toDate) return false;
        }

        // Patient name filter
        if (patientFilter) {
          const fullName = safeLower(`${r.patient?.first || ''} ${r.patient?.last || ''}`);
          const reverseName = safeLower(`${r.patient?.last || ''} ${r.patient?.first || ''}`);
          if (!fullName.includes(patientFilter) && !reverseName.includes(patientFilter)) return false;
        }

        // DOB filter
        if (dobFilter && r.patient?.dob !== dobFilter) return false;

        // Status filter
        const statusMatches =
          (r.status === 'Pending' && pendingChecked) ||
          (r.status === 'Accepted' && acceptedChecked) ||
          (r.status === 'Rejected' && rejectedChecked);
        if (!statusMatches) return false;

        return true;
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getStatusClass = (status: string) => {
    if (status === 'Accepted') return 'border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]';
    if (status === 'Rejected') return 'border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]';
    if (status === 'Pending') return 'border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00]';
    return '';
  };

  // Handlers
  const handleViewReferral = (refId: string, isReceiver: boolean) => {
    const ref = referrals.find((r: any) => r.id === refId);
    if (!ref) return;

    const sender = orgs.find((o: any) => o.id === ref.senderOrgId);
    const receiver = orgs.find((o: any) => o.id === ref.receiverOrgId);

    openModal(
      <div>
        <h3 className="m-0 mb-3 text-lg font-semibold">Referral Details</h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-rcn-muted mb-1">Referral ID</div>
            <div className="text-sm font-mono">{ref.id}</div>
          </div>
          <div>
            <div className="text-xs text-rcn-muted mb-1">Date</div>
            <div className="text-sm">{fmtDate(ref.createdAt)}</div>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3"></div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-rcn-muted mb-1">Sender Organization</div>
            <div className="text-sm font-semibold">{sender?.name || "—"}</div>
            {sender && (
              <div className="text-xs text-rcn-muted">
                {sender.address.city}, {sender.address.state} {sender.address.zip}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-rcn-muted mb-1">Receiver Organization</div>
            <div className="text-sm font-semibold">{receiver?.name || "—"}</div>
            {receiver && (
              <div className="text-xs text-rcn-muted">
                {receiver.address.city}, {receiver.address.state} {receiver.address.zip}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3"></div>

        <div className="mb-4">
          <div className="text-xs text-rcn-muted mb-1">Patient Information</div>
          <div className="text-sm">
            <strong>Name:</strong> {ref.patient?.last || "—"}, {ref.patient?.first || "—"}<br />
            <strong>DOB:</strong> {ref.patient?.dob || "—"}<br />
            <strong>Gender:</strong> {ref.patient?.gender || "—"}<br />
            <strong>Insurance:</strong> {ref.insurance?.primary?.payer || "—"} ({ref.insurance?.primary?.policy || "—"})
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3"></div>

        <div className="mb-4">
          <div className="text-xs text-rcn-muted mb-1">Status</div>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(ref.status)}`}>
            {ref.status}
          </span>
        </div>

        <div className="mb-4">
          <div className="text-xs text-rcn-muted mb-1">Services Requested</div>
          <div className="text-sm bg-[#f6fbf7] border border-rcn-border rounded-xl p-3">
            {ref.services || ref.servicesData?.requested?.join('; ') || "—"}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-rcn-muted mb-1">Notes</div>
          <div className="text-sm bg-[#f6fbf7] border border-rcn-border rounded-xl p-3">
            {ref.notes || ref.servicesData?.otherInformation || "No notes provided."}
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3"></div>

        <div className="text-xs text-rcn-muted mb-2">Billing Status</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#f6fbf7] border border-rcn-border rounded-lg p-2 text-xs">
            <div className="font-semibold mb-1">Sender</div>
            <div>Send charged: {ref.billing?.senderSendCharged ? "✅ Yes" : "❌ No"}</div>
            <div>Credit used: {ref.billing?.senderUsedCredit ? "✅ Yes" : "❌ No"}</div>
          </div>
          <div className="bg-[#f6fbf7] border border-rcn-border rounded-lg p-2 text-xs">
            <div className="font-semibold mb-1">Receiver</div>
            <div>Open charged: {ref.billing?.receiverOpenCharged ? "✅ Yes" : "❌ No"}</div>
            <div>Credit used: {ref.billing?.receiverUsedCredit ? "✅ Yes" : "❌ No"}</div>
          </div>
        </div>

        {isReceiver && ref.status === "Pending" && (
          <>
            <div className="h-px bg-rcn-border my-3"></div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  showToast("Accept/Reject functionality will be available with API integration.");
                  closeModal();
                }}
                className="logo-gradient text-white border-0 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Accept Referral
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  showToast("Accept/Reject functionality will be available with API integration.");
                  closeModal();
                }}
              >
                Reject Referral
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";

  return (
    <>


      <div className="flex flex-wrap gap-3.5">
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 flex-1 min-w-[180px]">
          <div className="text-rcn-muted text-sm">Organizations</div>
          <div className="text-2xl font-extrabold mt-2">{totalOrgs}</div>
        </div>
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 flex-1 min-w-[180px]">
          <div className="text-rcn-muted text-sm">Referrals (All)</div>
          <div className="text-2xl font-extrabold mt-2">{totalRefs}</div>
        </div>
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 flex-1 min-w-[180px]">
          <div className="text-rcn-muted text-sm">Referrals (7 days)</div>
          <div className="text-2xl font-extrabold mt-2">{refs7Days}</div>
        </div>
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 flex-1 min-w-[180px]">
          <div className="text-rcn-muted text-sm">Pending</div>
          <div className="text-2xl font-extrabold mt-2">{pendingRefs}</div>
        </div>
      </div>

      <div className="h-px bg-rcn-border my-3.5"></div>

      <div className="banner-gradient border border-rcn-accent/20 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <strong className="text-rcn-dark-bg">Admin: Portal Selector</strong>
          <div className="text-xs text-rcn-muted mt-1">
            Select Sender and/or Receiver organizations using Name + State + Zip filters.
            Use the separate Apply buttons to generate each inbox.
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            onClick={() => {
              setSenderOrgId('');
              setReceiverOrgId('');
              setShowSenderInbox(false);
              setShowReceiverInbox(false);
            }}
          >
            Clear selection
          </Button>
        </div>
      </div>

      <div className="h-3"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
        {/* Sender Selection */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <div className="flex justify-between items-center">
            <h3 className="m-0 text-sm font-semibold">Find Sender Organization</h3>
            {senderOrgId && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Selected</span>}
          </div>

          <div className="flex flex-wrap gap-2.5 items-end mt-2.5">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
              <label className="text-xs text-rcn-muted">Name</label>
              <input
                placeholder="Search by org name"
                value={senderFilterName}
                onChange={(e) => setSenderFilterName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-xs text-rcn-muted">State</label>
              <CustomReactSelect
                options={STATE_OPTIONS}
                value={senderFilterState}
                onChange={setSenderFilterState}
                aria-label="Filter by state"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-xs text-rcn-muted">Zip</label>
              <input
                placeholder="e.g., 60601"
                value={senderFilterZip}
                onChange={(e) => setSenderFilterZip(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2.5">
            <label className="text-xs text-rcn-muted">Sender Organization</label>
            <select value={senderOrgId} onChange={(e) => setSenderOrgId(e.target.value)} className={inputClass}>
              <option value="">— Select Sender Organization —</option>
              {filteredSenderOrgs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.address.state} {o.address.zip})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end mt-2.5">
            <Button

              variant='primary' onClick={() => {
                if (!senderOrgId) {
                  alert('Please select a Sender organization.');
                  return;
                }
                setShowSenderInbox(true);
              }}
            >
              Apply Sender Inbox
            </Button>
          </div>
        </div>

        {/* Receiver Selection */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <div className="flex justify-between items-center">
            <h3 className="m-0 text-sm font-semibold">Find Receiver Organization</h3>
            {receiverOrgId && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Selected</span>}
          </div>

          <div className="flex flex-wrap gap-2.5 items-end mt-2.5">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
              <label className="text-xs text-rcn-muted">Name</label>
              <input
                placeholder="Search by org name"
                value={receiverFilterName}
                onChange={(e) => setReceiverFilterName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-xs text-rcn-muted">State</label>
              <CustomReactSelect
                options={STATE_OPTIONS}
                value={receiverFilterState}
                onChange={setReceiverFilterState}
                aria-label="Filter by state"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-xs text-rcn-muted">Zip</label>
              <input
                placeholder="e.g., 60563"
                value={receiverFilterZip}
                onChange={(e) => setReceiverFilterZip(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2.5">
            <label className="text-xs text-rcn-muted">Receiver Organization</label>
            <select value={receiverOrgId} onChange={(e) => setReceiverOrgId(e.target.value)} className={inputClass}>
              <option value="">— Select Receiver Organization —</option>
              {filteredReceiverOrgs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.address.state} {o.address.zip})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end mt-2.5">
            <Button
              variant='primary'
              onClick={() => {
                if (!receiverOrgId) {
                  alert('Please select a Receiver organization.');
                  return;
                }
                setShowReceiverInbox(true);
              }}
            >
              Apply Receiver Inbox
            </Button>
          </div>
        </div>
      </div>

      <div className="h-px bg-rcn-border my-3.5"></div>

      {/* Inboxes */}
      {(showSenderInbox || showReceiverInbox) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
          {/* Sender Inbox */}
          <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
            <div className="flex justify-between items-center">
              <h3 className="m-0 text-sm font-semibold">Sender Inbox</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
                {orgs.find((o: any) => o.id === senderOrgId)?.name || 'Sender'}
              </span>
            </div>

            {showSenderInbox ? (
              <>
                {/* Sender Filters */}
                <div className="flex flex-wrap gap-3 items-end mt-3 mb-3 p-3 bg-[#f6fbf7] border border-rcn-border rounded-xl">
                  <div className="flex flex-col gap-1.5 min-w-[120px]">
                    <label className="text-xs text-rcn-muted font-semibold">ID</label>
                    <input
                      id="senderF_id"
                      placeholder="e.g., ref_1001"
                      className={inputClass}
                      onInput={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <label className="text-xs text-rcn-muted font-semibold">Date From</label>
                    <input
                      id="senderF_from"
                      type="date"
                      className={inputClass}
                      onChange={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <label className="text-xs text-rcn-muted font-semibold">Date To</label>
                    <input
                      id="senderF_to"
                      type="date"
                      className={inputClass}
                      onChange={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                    <label className="text-xs text-rcn-muted font-semibold">Patient Name</label>
                    <input
                      id="senderF_patient"
                      placeholder="Last or First"
                      className={inputClass}
                      onInput={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <label className="text-xs text-rcn-muted font-semibold">DOB</label>
                    <input
                      id="senderF_dob"
                      type="date"
                      className={inputClass}
                      onChange={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[280px]">
                    <label className="text-xs text-rcn-muted font-semibold">Status</label>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border border-rcn-border bg-white cursor-pointer hover:border-[#b9d7c5]">
                        <input type="checkbox" id="senderF_st_pending" defaultChecked className="w-3.5 h-3.5" onChange={triggerFilterUpdate} />
                        Pending
                      </label>
                      <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border border-rcn-border bg-white cursor-pointer hover:border-[#b9d7c5]">
                        <input type="checkbox" id="senderF_st_accepted" defaultChecked className="w-3.5 h-3.5" onChange={triggerFilterUpdate} />
                        Accepted
                      </label>
                      <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border border-rcn-border bg-white cursor-pointer hover:border-[#b9d7c5]">
                        <input type="checkbox" id="senderF_st_rejected" defaultChecked className="w-3.5 h-3.5" onChange={triggerFilterUpdate} />
                        Rejected
                      </label>
                    </div>
                  </div>
                  <div>
                    <Button
                      className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors"
                      onClick={() => showToast('Export CSV functionality coming soon')}
                    >
                      Export CSV
                    </Button>
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
                    <thead>
                      <tr>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">ID</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Date</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Patient</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Receiver</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Status</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSenderReferrals().length === 0 ? (
                        <tr><td colSpan={6} className="px-2.5 py-2.5 text-xs text-rcn-muted">No referrals found.</td></tr>
                      ) : (
                        getSenderReferrals().map((ref: any) => {
                          const receiver = orgs.find((o: any) => o.id === ref.receiverOrgId);
                          return (
                            <tr key={ref.id}>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{ref.id}</td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{fmtDate(ref.createdAt)}</td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                                {ref.patient?.last || "—"}, {ref.patient?.first || "—"}
                                <div className="text-rcn-muted">{ref.patient?.dob || "—"} • {ref.patient?.gender || "—"}</div>
                              </td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                                {receiver?.name || '—'}
                                <div className="text-rcn-muted">
                                  {receiver ? `${receiver.address.city}, ${receiver.address.state}` : ''}
                                </div>
                              </td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(ref.status)}`}>
                                  {ref.status}
                                </span>
                              </td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                                <button
                                  onClick={() => handleViewReferral(ref.id, false)}
                                  className="border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-xs text-rcn-muted mt-2.5 p-2.5 border border-dashed border-rcn-border rounded-xl">
                Select a Sender organization and click <b>Apply Sender Inbox</b>.
              </div>
            )}
          </div>

          {/* Receiver Inbox */}
          <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
            <div className="flex justify-between items-center">
              <h3 className="m-0 text-sm font-semibold">Receiver Inbox</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
                {orgs.find((o: any) => o.id === receiverOrgId)?.name || 'Receiver'}
              </span>
            </div>

            {showReceiverInbox ? (
              <>
                {/* Receiver Filters */}
                <div className="flex flex-wrap gap-3 items-end mt-3 mb-3 p-3 bg-[#f6fbf7] border border-rcn-border rounded-xl">
                  <div className="flex flex-col gap-1.5 min-w-[120px]">
                    <label className="text-xs text-rcn-muted font-semibold">ID</label>
                    <input
                      id="receiverF_id"
                      placeholder="e.g., ref_1004"
                      className={inputClass}
                      onInput={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <label className="text-xs text-rcn-muted font-semibold">Date From</label>
                    <input
                      id="receiverF_from"
                      type="date"
                      className={inputClass}
                      onChange={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <label className="text-xs text-rcn-muted font-semibold">Date To</label>
                    <input
                      id="receiverF_to"
                      type="date"
                      className={inputClass}
                      onChange={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                    <label className="text-xs text-rcn-muted font-semibold">Patient Name</label>
                    <input
                      id="receiverF_patient"
                      placeholder="Last or First"
                      className={inputClass}
                      onInput={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <label className="text-xs text-rcn-muted font-semibold">DOB</label>
                    <input
                      id="receiverF_dob"
                      type="date"
                      className={inputClass}
                      onChange={triggerFilterUpdate}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[280px]">
                    <label className="text-xs text-rcn-muted font-semibold">Status</label>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border border-rcn-border bg-white cursor-pointer hover:border-[#b9d7c5]">
                        <input type="checkbox" id="receiverF_st_pending" defaultChecked className="w-3.5 h-3.5" onChange={triggerFilterUpdate} />
                        Pending
                      </label>
                      <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border border-rcn-border bg-white cursor-pointer hover:border-[#b9d7c5]">
                        <input type="checkbox" id="receiverF_st_accepted" defaultChecked className="w-3.5 h-3.5" onChange={triggerFilterUpdate} />
                        Accepted
                      </label>
                      <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border border-rcn-border bg-white cursor-pointer hover:border-[#b9d7c5]">
                        <input type="checkbox" id="receiverF_st_rejected" defaultChecked className="w-3.5 h-3.5" onChange={triggerFilterUpdate} />
                        Rejected
                      </label>
                    </div>
                  </div>
                  <div>
                    <button
                      className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors"
                      onClick={() => showToast('Export CSV functionality coming soon')}
                    >
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
                    <thead>
                      <tr>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">ID</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Date</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Patient</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Sender</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Status</th>
                        <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getReceiverReferrals().length === 0 ? (
                        <tr><td colSpan={6} className="px-2.5 py-2.5 text-xs text-rcn-muted">No referrals found.</td></tr>
                      ) : (
                        getReceiverReferrals().map((ref: any) => {
                          const sender = orgs.find((o: any) => o.id === ref.senderOrgId);
                          return (
                            <tr key={ref.id}>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{ref.id}</td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">{fmtDate(ref.createdAt)}</td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                                {ref.patient?.last || "—"}, {ref.patient?.first || "—"}
                                <div className="text-rcn-muted">{ref.patient?.dob || "—"} • {ref.patient?.gender || "—"}</div>
                              </td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                                {sender?.name || '—'}
                                <div className="text-rcn-muted">
                                  {sender ? `${sender.address.city}, ${sender.address.state}` : ''}
                                </div>
                              </td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(ref.status)}`}>
                                  {ref.status}
                                </span>
                              </td>
                              <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                                <button
                                  onClick={() => handleViewReferral(ref.id, true)}
                                  className="logo-gradient text-white border-0 px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-xs hover:opacity-90 transition-opacity"
                                >
                                  {ref.billing?.receiverOpenCharged ? 'View' : 'Open'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-xs text-rcn-muted mt-2.5 p-2.5 border border-dashed border-rcn-border rounded-xl">
                Select a Receiver organization and click <b>Apply Receiver Inbox</b>.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <h3 className="text-sm font-semibold m-0 mb-2.5">Side-by-side inbox view</h3>
          <p className="text-xs text-rcn-muted m-0">
            Use the Find Sender/Receiver selectors above. Click <b>Apply Sender Inbox</b> and/or{' '}
            <b>Apply Receiver Inbox</b> to load each inbox. You can load one side at a time.
          </p>
        </div>
      )}

      {/* Toast notification */}
      <div className={`fixed right-4 bottom-4 z-60 bg-rcn-dark-bg text-rcn-dark-text border border-white/15 px-3 py-2.5 rounded-2xl shadow-rcn max-w-[360px] text-sm transition-all duration-300 ${
        showToastFlag ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {toastMessage}
      </div>

      {/* Modal */}
      {modalContent && (
        <div 
          className="fixed inset-0 bg-black/55 flex items-center justify-center p-5 z-50" 
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains('bg-black/55')) {
              closeModal();
            }
          }}
        >
          <div className="max-w-[900px] w-full">
            <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 max-h-[80vh] overflow-auto">
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
