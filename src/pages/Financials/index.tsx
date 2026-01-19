import React, { useState } from 'react';
import TopBar from '../../components/TopBar';
import { useApp } from '../../context/AppContext';
import { 
  centsToMoney, 
  moneyToCents, 
  adjustWallet, 
  createInvoice, 
  invoiceToEmail, 
  downloadTextFile,
  fmtDate,
  audit,
  saveDB
} from '../../utils/database';

const Financials: React.FC = () => {
  const { db, refreshDB, showToast, openModal, closeModal } = useApp();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  // Calculate financial totals
  const ledger = db.finance?.ledger || [];
  const grossCents = ledger
    .filter((e: any) => e.type === 'charge' || e.type === 'credit_purchase')
    .reduce((sum: number, e: any) => sum + (e.deltaCents || 0), 0);
  const bonusCents = ledger
    .filter((e: any) => e.type === 'sender_bonus')
    .reduce((sum: number, e: any) => sum + (e.deltaCents || 0), 0);
  const netCents = grossCents - bonusCents;
  const totalReferrals = db.referrals.length;

  // Handlers
  const handleAddFunds = (orgId: string) => {
    openModal(
      <div>
        <h3 className="m-0 mb-2 text-lg font-semibold">Add Wallet Funds</h3>
        <p className="text-sm text-rcn-muted mb-4">Add funds to organization wallet (demo: any amount accepted).</p>
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const amt = parseFloat(form.amount.value || "0");
          if (amt <= 0) {
            showToast("Amount must be positive.");
            return;
          }
          const cents = moneyToCents(amt);
          adjustWallet(db, orgId, cents, { type: "wallet_deposit", note: "Manual deposit" });
          saveDB(db);
          refreshDB();
          audit("wallet_deposit", { orgId, amount: amt });
          showToast(`Added $${centsToMoney(cents)} to wallet.`);
          closeModal();
        }}>
          <label className="block mb-2">
            <span className="text-xs font-semibold block mb-1">Amount ($)</span>
            <input 
              type="number" 
              name="amount" 
              step="0.01" 
              min="0.01" 
              required 
              className="w-full border border-rcn-border rounded-xl px-3 py-2.5 text-sm"
              placeholder="100.00"
            />
          </label>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="logo-gradient text-white border-0 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:opacity-90 transition-opacity">
              Add Funds
            </button>
            <button type="button" onClick={closeModal} className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const handlePurchaseCredits = (orgId: string) => {
    openModal(
      <div>
        <h3 className="m-0 mb-2 text-lg font-semibold">Purchase Referral Credits</h3>
        <p className="text-sm text-rcn-muted mb-4">Buy referral credits in bulk (demo: $0.10 per credit, 10% discount for 10+).</p>
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const qty = parseInt(form.quantity.value || "0", 10);
          if (qty <= 0) {
            showToast("Quantity must be positive.");
            return;
          }
          
          const ps = db.paymentSettings || {};
          const unitCents = moneyToCents(0.10);
          const subtotalCents = qty * unitCents;
          
          // Apply bulk discount if threshold met
          const threshold = ps.bonus?.bulkThreshold || 10;
          const discountPct = ps.bonus?.bulkDiscountPct || 10;
          const discountCents = qty >= threshold ? Math.round(subtotalCents * (discountPct / 100)) : 0;
          const totalCents = subtotalCents - discountCents;
          
          // Adjust wallet and credits
          const org = db.orgs.find((o: any) => o.id === orgId);
          if (!org) return;
          
          adjustWallet(db, orgId, totalCents, { 
            type: "credit_purchase", 
            creditQty: qty,
            note: `Purchased ${qty} credits` 
          });
          org.referralCredits = (org.referralCredits || 0) + qty;
          
          // Create invoice
          const invoice = createInvoice(db, {
            orgId,
            kind: "CREDIT_PURCHASE",
            lines: [{
              desc: "Referral credits",
              qty,
              unitCents,
              amountCents: subtotalCents
            }],
            subtotalCents,
            discountCents,
            totalCents,
            meta: { discountPct: qty >= threshold ? discountPct : 0 }
          });
          
          saveDB(db);
          refreshDB();
          audit("credit_purchase", { orgId, qty, total: centsToMoney(totalCents), invoiceNumber: invoice.number });
          showToast(`Purchased ${qty} credits. Invoice ${invoice.number} created.`);
          closeModal();
        }}>
          <label className="block mb-2">
            <span className="text-xs font-semibold block mb-1">Quantity</span>
            <input 
              type="number" 
              name="quantity" 
              min="1" 
              required 
              className="w-full border border-rcn-border rounded-xl px-3 py-2.5 text-sm"
              placeholder="10"
            />
          </label>
          <div className="text-xs text-rcn-muted mb-4">
            $0.10 per credit. 10% discount for 10+ credits.
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="logo-gradient text-white border-0 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:opacity-90 transition-opacity">
              Purchase
            </button>
            <button type="button" onClick={closeModal} className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const handleViewInvoice = (inv: any) => {
    const email = invoiceToEmail(inv);
    openModal(
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="m-0 text-lg font-semibold">Invoice {inv.number}</h3>
            <p className="text-sm text-rcn-muted m-0">{fmtDate(inv.createdAt)}</p>
          </div>
          <button 
            onClick={() => {
              downloadTextFile(`${inv.number}.txt`, email.body);
              showToast("Invoice downloaded.");
            }}
            className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors"
          >
            Download
          </button>
        </div>
        <div className="bg-[#f6fbf7] border border-rcn-border rounded-xl p-3 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96">
          {email.body}
        </div>
      </div>
    );
  };

  const filteredLedger = selectedOrgId 
    ? ledger.filter((e: any) => e.orgId === selectedOrgId)
    : ledger;

  return (
    <>
      <TopBar 
        title="Financials" 
        subtitle="Organization wallets, ledger, invoices, and income summary." 
      />

      {/* Financial Summary */}
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-3.5">
        <div className="flex justify-between items-start flex-wrap gap-3 mb-3.5">
          <div>
            <h3 className="m-0 text-sm font-semibold">Financial Summary</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">Totals for referrals and income across the network.</p>
          </div>
          <button 
            onClick={refreshDB}
            className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs">Total referrals</div>
            <div className="text-3xl font-extrabold mt-1">{totalReferrals}</div>
            <div className="text-xs text-rcn-muted mt-1">All referrals in system</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs">Gross collected</div>
            <div className="text-3xl font-extrabold mt-1">${centsToMoney(grossCents)}</div>
            <div className="text-xs text-rcn-muted mt-1">Fees + credit purchases</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs">Bonuses paid</div>
            <div className="text-3xl font-extrabold mt-1">${centsToMoney(bonusCents)}</div>
            <div className="text-xs text-rcn-muted mt-1">Sender bonuses</div>
          </div>

          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4" style={{background: 'rgba(255,255,255,0.55)'}}>
            <div className="text-rcn-muted text-xs">Net income</div>
            <div className="text-3xl font-extrabold mt-1">${centsToMoney(netCents)}</div>
            <div className="text-xs text-rcn-muted mt-1">Gross - bonuses</div>
          </div>
        </div>
      </div>

      {/* Organization Wallets */}
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-3.5">
        <h3 className="m-0 mb-3 text-sm font-semibold">Organization Wallets & Credits</h3>
        <div className="overflow-auto">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
            <thead>
              <tr>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Organization</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Wallet Balance</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Referral Credits</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {db.orgs.map((org: any) => (
                <tr key={org.id}>
                  <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                    <b>{org.name}</b>
                  </td>
                  <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">
                    ${centsToMoney(org.walletCents || 0)}
                  </td>
                  <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">
                    {org.referralCredits || 0}
                  </td>
                  <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => handleAddFunds(org.id)}
                        className="border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
                      >
                        + Funds
                      </button>
                      <button 
                        onClick={() => handlePurchaseCredits(org.id)}
                        className="logo-gradient text-white border-0 px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-xs hover:opacity-90 transition-opacity"
                      >
                        + Credits
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-3.5">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <h3 className="m-0 text-sm font-semibold">Ledger Transactions</h3>
          <select 
            value={selectedOrgId} 
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="border border-rcn-border rounded-xl px-3 py-2 text-sm"
          >
            <option value="">All Organizations</option>
            {db.orgs.map((org: any) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        <div className="overflow-auto max-h-96">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
            <thead>
              <tr>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider sticky top-0">Date</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider sticky top-0">Organization</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider sticky top-0">Type</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider sticky top-0">Amount</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider sticky top-0">Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2.5 py-3 text-xs text-rcn-muted text-center">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((entry: any) => {
                  const org = db.orgs.find((o: any) => o.id === entry.orgId);
                  return (
                    <tr key={entry.id}>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">
                        {fmtDate(entry.at)}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        {org?.name || entry.orgId}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
                          {entry.type || "—"}
                        </span>
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono font-semibold">
                        {entry.deltaCents >= 0 ? '+' : ''}${centsToMoney(entry.deltaCents || 0)}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top text-rcn-muted">
                        {entry.note || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <h3 className="m-0 mb-3 text-sm font-semibold">Invoices</h3>
        <div className="overflow-auto">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
            <thead>
              <tr>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Invoice #</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Date</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Organization</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Type</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Total</th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(db.finance?.invoices || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2.5 py-3 text-xs text-rcn-muted text-center">
                    No invoices yet.
                  </td>
                </tr>
              ) : (
                (db.finance?.invoices || []).map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono font-semibold">
                      {inv.number}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">
                      {fmtDate(inv.createdAt)}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      {inv.orgName}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      {inv.kind === 'CREDIT_PURCHASE' ? 'Credit Purchase' : inv.kind}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono font-semibold">
                      ${centsToMoney(inv.totalCents)}
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                      <button 
                        onClick={() => handleViewInvoice(inv)}
                        className="border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Financials;
