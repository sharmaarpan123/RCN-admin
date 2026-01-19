import React from 'react';
import TopBar from '../../components/TopBar';
import { useApp } from '../../context/AppContext';

const PaymentSettings: React.FC = () => {
  const { showToast } = useApp();

  return (
    <>
      <TopBar 
        title="Payment Adjustment Settings" 
        subtitle="Configure payment methods, fees, and referral bonus rules." 
      />

      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Payment Adjustment Settings</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">
              Toggle payment methods, configure fees, and set referral bonus rules. (Demo-only; stored locally in your browser.)
            </p>
          </div>
          <div className="flex gap-2.5">
            <button 
              className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors"
              onClick={() => showToast('Reset functionality not implemented in this demo')}
            >
              Reset defaults
            </button>
            <button 
              className="bg-rcn-accent border-rcn-accent text-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:bg-rcn-accent-dark transition-colors"
              onClick={() => showToast('Save functionality not implemented in this demo')}
            >
              Save Settings
            </button>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
            <h3 className="text-sm font-semibold m-0 mb-2.5">Payment Methods</h3>
            <p className="text-xs text-rcn-muted m-0 mb-2.5">Enable/disable the payment methods available in the network.</p>

            <div className="flex flex-wrap gap-2 mt-2.5">
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" defaultChecked className="mr-1.5" /> Credit Card
              </label>
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" defaultChecked className="mr-1.5" /> Debit Card
              </label>
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" defaultChecked className="mr-1.5" /> Apple Pay
              </label>
              <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9] cursor-pointer hover:border-[#b9d7c5]">
                <input type="checkbox" defaultChecked className="mr-1.5" /> PayPal
              </label>
            </div>
          </div>

          <div className="bg-white border border-rcn-border rounded-2xl shadow-none p-4">
            <h3 className="text-sm font-semibold m-0 mb-2.5">Total Charge</h3>
            <p className="text-xs text-rcn-muted m-0 mb-2.5">Total = Service Fee + (Service Fee × Processing Fee %) — varies by payment method</p>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Service Fee ($)</label>
                <input type="number" step="0.01" defaultValue="5.00" className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-rcn-muted">Preview Payment Method</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5]">
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                  <option>Apple Pay</option>
                  <option>PayPal</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSettings;
