import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { saveDB, audit } from '../../utils/database';

const PaymentSettings: React.FC = () => {
  const { db, refreshDB, showToast } = useApp();
  
  // Payment Settings State
  const [methods, setMethods] = useState({
    creditCard: true,
    debitCard: true,
    applePay: true,
    paypal: true,
    googlePay: true,
    bankTransfer: false,
    ach: false,
  });

  const [serviceFee, setServiceFee] = useState(5.00);
  const [previewMethod, setPreviewMethod] = useState('creditCard');
  
  const [processingFees, setProcessingFees] = useState({
    creditCard: 0.00,
    debitCard: 0.00,
    applePay: 0.00,
    paypal: 0.00,
    googlePay: 0.00,
    bankTransfer: 0.00,
    ach: 0.00,
  });

  const [senderBonus, setSenderBonus] = useState(0.10);
  const [applyToAll, setApplyToAll] = useState(true);
  const [bulkThreshold, setBulkThreshold] = useState(10);
  const [bulkDiscount, setBulkDiscount] = useState(10);
  const [autoEmail, setAutoEmail] = useState(true);

  // Bulk Purchase Calculator State
  const [bulkBuyer, setBulkBuyer] = useState('');
  const [bulkQty, setBulkQty] = useState(0);
  const [bulkPayMethod, setBulkPayMethod] = useState('creditCard');
  const [bulkUnitPrice, setBulkUnitPrice] = useState(5.00);

  // Pair Bonus Calculator State
  const [pairSender, setPairSender] = useState('');
  const [pairReceiver, setPairReceiver] = useState('');
  const [pairCount, setPairCount] = useState(0);

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";
  const btnPrimaryClass = "bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors";

  // Load settings from database
  useEffect(() => {
    const ps = db.paymentSettings || {};
    if (ps.methods) setMethods(ps.methods);
    if (ps.fees) {
      setServiceFee(ps.fees.serviceFee || 5.00);
      if (ps.fees.processingByMethod) setProcessingFees(ps.fees.processingByMethod);
    }
    if (ps.bonus) {
      setSenderBonus(ps.bonus.senderPerReceiverPaid || 0.10);
      setApplyToAll(ps.bonus.applyToAllSenders !== false);
      setBulkThreshold(ps.bonus.bulkThreshold || 10);
      setBulkDiscount(ps.bonus.bulkDiscountPct || 10);
    }
    if (ps.invoice) {
      setAutoEmail(ps.invoice.autoEmail !== false);
    }
  }, [db]);

  const enabledMethods = () => {
    return Object.entries(methods).filter(([_, enabled]) => enabled).map(([key]) => key);
  };

  const calculateProcessingFee = (method: string) => {
    const pct = processingFees[method as keyof typeof processingFees] || 0;
    return serviceFee * (pct / 100);
  };

  const calculateTotal = (method: string) => {
    return serviceFee + calculateProcessingFee(method);
  };

  const payMethodLabel = (key: string) => {
    const labels: Record<string, string> = {
      creditCard: 'Credit Card',
      debitCard: 'Debit Card',
      applePay: 'Apple Pay',
      paypal: 'PayPal',
      googlePay: 'Google Pay',
      bankTransfer: 'Bank Transfer',
      ach: 'ACH',
    };
    return labels[key] || key;
  };

  const calculateBulkFinal = () => {
    const subtotal = bulkQty * bulkUnitPrice;
    const eligible = bulkQty > bulkThreshold;
    const discount = eligible ? subtotal * (bulkDiscount / 100) : 0;
    return Math.max(0, subtotal - discount);
  };

  const calculatePairBonus = () => {
    return pairCount * senderBonus;
  };

  const handleSave = () => {
    const paymentSettings = {
      version: 4,
      methods,
      fees: {
        serviceFee,
        processingByMethod: processingFees,
      },
      bonus: {
        senderPerReceiverPaid: senderBonus,
        applyToAllSenders: applyToAll,
        bulkThreshold,
        bulkDiscountPct: bulkDiscount,
      },
      invoice: {
        autoEmail,
      },
    };

    db.paymentSettings = paymentSettings;
    saveDB(db);
    audit('payment_settings_save', {});
    refreshDB();
    showToast('Payment Adjustment Settings saved.');
  };

  const handleReset = () => {
    if (!window.confirm('Reset payment settings to defaults?')) return;
    
    setMethods({
      creditCard: true,
      debitCard: true,
      applePay: true,
      paypal: true,
      googlePay: true,
      bankTransfer: false,
      ach: false,
    });
    setServiceFee(5.00);
    setProcessingFees({
      creditCard: 0.00,
      debitCard: 0.00,
      applePay: 0.00,
      paypal: 0.00,
      googlePay: 0.00,
      bankTransfer: 0.00,
      ach: 0.00,
    });
    setSenderBonus(0.10);
    setApplyToAll(true);
    setBulkThreshold(10);
    setBulkDiscount(10);
    setAutoEmail(true);
    
    showToast('Settings reset to defaults.');
  };

  const useLivePairCount = () => {
    if (!pairSender || !pairReceiver) {
      showToast('Select both sender and receiver organizations.');
      return;
    }
    const key = `${pairSender}__${pairReceiver}`;
    const count = db.finance?.pairCounts?.[key] || 0;
    setPairCount(count);
  };

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Payment Adjustment Settings</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">
              Toggle payment methods, configure fees, and set referral bonus rules. (Demo-only; stored locally in your browser.)
            </p>
          </div>
          <div className="flex gap-2.5">
            <button onClick={handleReset} className={btnClass}>Reset defaults</button>
            <button onClick={handleSave} className={btnPrimaryClass}>Save Settings</button>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Payment Methods */}
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
            <h3 className="text-sm font-semibold m-0 mb-2.5">Payment Methods</h3>
            <p className="text-xs text-rcn-muted m-0 mb-2.5">Enable/disable the payment methods available in the network.</p>

            <div className="flex flex-wrap gap-2 mt-2.5">
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" checked={methods.creditCard} onChange={(e) => setMethods({...methods, creditCard: e.target.checked})} />
                Credit Card
              </label>
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" checked={methods.debitCard} onChange={(e) => setMethods({...methods, debitCard: e.target.checked})} />
                Debit Card
              </label>
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" checked={methods.applePay} onChange={(e) => setMethods({...methods, applePay: e.target.checked})} />
                Apple Pay
              </label>
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" checked={methods.paypal} onChange={(e) => setMethods({...methods, paypal: e.target.checked})} />
                PayPal
              </label>
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" checked={methods.googlePay} onChange={(e) => setMethods({...methods, googlePay: e.target.checked})} />
                Google Pay
              </label>
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" checked={methods.bankTransfer} onChange={(e) => setMethods({...methods, bankTransfer: e.target.checked})} />
                Bank Transfer
              </label>
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" checked={methods.ach} onChange={(e) => setMethods({...methods, ach: e.target.checked})} />
                ACH
              </label>
            </div>

            <div className="h-px bg-rcn-border my-3.5"></div>

            <h4 className="text-sm font-semibold m-0 mb-2.5">Transaction (Processing) Fee by Method (%)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Credit Card</label>
                <input type="number" step="0.01" min="0" max="100" value={processingFees.creditCard} onChange={(e) => setProcessingFees({...processingFees, creditCard: parseFloat(e.target.value) || 0})} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Debit Card</label>
                <input type="number" step="0.01" min="0" max="100" value={processingFees.debitCard} onChange={(e) => setProcessingFees({...processingFees, debitCard: parseFloat(e.target.value) || 0})} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Apple Pay</label>
                <input type="number" step="0.01" min="0" max="100" value={processingFees.applePay} onChange={(e) => setProcessingFees({...processingFees, applePay: parseFloat(e.target.value) || 0})} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">PayPal</label>
                <input type="number" step="0.01" min="0" max="100" value={processingFees.paypal} onChange={(e) => setProcessingFees({...processingFees, paypal: parseFloat(e.target.value) || 0})} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Google Pay</label>
                <input type="number" step="0.01" min="0" max="100" value={processingFees.googlePay} onChange={(e) => setProcessingFees({...processingFees, googlePay: parseFloat(e.target.value) || 0})} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Bank Transfer</label>
                <input type="number" step="0.01" min="0" max="100" value={processingFees.bankTransfer} onChange={(e) => setProcessingFees({...processingFees, bankTransfer: parseFloat(e.target.value) || 0})} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">ACH</label>
                <input type="number" step="0.01" min="0" max="100" value={processingFees.ach} onChange={(e) => setProcessingFees({...processingFees, ach: parseFloat(e.target.value) || 0})} className={inputClass} />
              </div>
            </div>

            <div className="h-px bg-rcn-border my-3.5"></div>
            <p className="text-xs text-rcn-muted m-0">
              Enabled: {enabledMethods().map(k => payMethodLabel(k)).join(', ') || '—'}
            </p>
          </div>

          {/* Total Charge */}
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
            <h3 className="text-sm font-semibold m-0 mb-2.5">Total Charge</h3>
            <p className="text-xs text-rcn-muted m-0 mb-2.5">Total = Service Fee + (Service Fee × Processing Fee %) — varies by payment method</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Service Fee ($)</label>
                <input type="number" step="0.01" min="0" value={serviceFee} onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Preview Payment Method</label>
                <select value={previewMethod} onChange={(e) => setPreviewMethod(e.target.value)} className={inputClass}>
                  {enabledMethods().map(key => (
                    <option key={key} value={key}>{payMethodLabel(key)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Processing Fee (Selected Method) (% and $)</label>
                <input type="text" readOnly value={`${processingFees[previewMethod as keyof typeof processingFees].toFixed(2)}% ($${calculateProcessingFee(previewMethod).toFixed(2)})`} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Total Charge (Selected Method) ($)</label>
                <input type="text" readOnly value={calculateTotal(previewMethod).toFixed(2)} className={inputClass} />
              </div>
            </div>

            <div className="h-px bg-rcn-border my-3.5"></div>

            <div className="overflow-auto">
              <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
                <thead>
                  <tr>
                    <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Payment Method</th>
                    <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Processing Fee (%)</th>
                    <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Processing Fee ($)</th>
                    <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">Total ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(processingFees).map((key) => {
                    const enabled = methods[key as keyof typeof methods];
                    return (
                      <tr key={key}>
                        <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                          {payMethodLabel(key)}
                          {!enabled && <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] opacity-70">Off</span>}
                        </td>
                        <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{processingFees[key as keyof typeof processingFees].toFixed(2)}</td>
                        <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{calculateProcessingFee(key).toFixed(2)}</td>
                        <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">{calculateTotal(key).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-rcn-muted mt-2.5 mb-0">Tip: fees are used for calculation previews in this demo (no real payment processing).</p>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        {/* Referral & Purchase Bonus */}
        <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
          <h3 className="text-sm font-semibold m-0 mb-2.5">Referral &amp; Purchase Bonus</h3>
          <p className="text-xs text-rcn-muted m-0 mb-3">
            Rules: To <strong>send</strong> a referral or <strong>open</strong> a referral costs <strong>${serviceFee.toFixed(2)}</strong> (default).
            In this demo, the charge per action is <strong>${serviceFee.toFixed(2)}</strong> + processing fee ({payMethodLabel(previewMethod)}) <strong>{processingFees[previewMethod as keyof typeof processingFees].toFixed(2)}%</strong> (<strong>${calculateProcessingFee(previewMethod).toFixed(2)}</strong>) = <strong>${calculateTotal(previewMethod).toFixed(2)}</strong>.
            <br />
            Sender bonus (Per Sender ↔ Receiver): (Applies to all referral senders by default.) Each time a <strong>receiver pays</strong> for a referral (tracked when the receiver opens it),
            the sender earns <strong>${senderBonus.toFixed(2)}</strong> by default.
            <br />
            Bulk purchase: A <strong>{bulkDiscount}% discount</strong> applies automatically for any organization when purchasing <strong>more than {bulkThreshold}</strong> referral credits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-rcn-muted font-semibold">Sender Bonus per Receiver Paid Referral ($)</label>
              <input type="number" step="0.01" min="0" value={senderBonus} onChange={(e) => setSenderBonus(parseFloat(e.target.value) || 0)} className={inputClass} />
              <label className="inline-flex items-center gap-2 mt-1 text-xs text-rcn-muted cursor-pointer">
                <input type="checkbox" checked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)} />
                Apply sender bonus to all referral senders (default)
              </label>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-rcn-muted font-semibold">Bulk Discount Threshold (credits)</label>
              <input type="number" step="1" min="0" value={bulkThreshold} onChange={(e) => setBulkThreshold(parseInt(e.target.value) || 0)} className={inputClass} />
              <p className="text-xs text-rcn-muted mt-1 mb-0">Discount applies when quantity &gt; threshold.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-rcn-muted font-semibold">Bulk Discount (%)</label>
              <input type="number" step="0.1" min="0" max="100" value={bulkDiscount} onChange={(e) => setBulkDiscount(parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
          </div>

          <div className="h-px bg-rcn-border my-3.5"></div>

        

          {/* Invoice Automation */}
          {/* <div className="bg-white border border-rcn-border rounded-xl mt-3 p-3" style={{background: 'rgba(255,255,255,.55)'}}>
            <div className="flex justify-between items-center">
              <div>
                <strong className="text-sm">Invoice Automation</strong>
                <div className="text-xs text-rcn-muted mt-1">
                  Invoices are created automatically when an organization purchases credits. This demo can open an email draft addressed to the organization email (mailto).
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">Auto</span>
            </div>
            <div className="h-px bg-rcn-border my-2"></div>
            <label className="inline-flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={autoEmail} onChange={(e) => setAutoEmail(e.target.checked)} className="mt-0.5" />
              <div>
                <div className="text-sm font-bold">Auto-open email draft after invoice creation</div>
                <div className="text-xs text-rcn-muted mt-0.5">
                  If your browser blocks popups, you can send later from Financials → Invoices.
                </div>
              </div>
            </label>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default PaymentSettings;
