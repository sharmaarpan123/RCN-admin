import React from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';

const PaymentSettings: React.FC = () => {
  const { db, showToast } = useApp();

  return (
    <>
      <TopBar 
        title="Payment Adjustment Settings" 
        subtitle="Configure payment methods, fees, and referral bonus rules." 
      />

      <div className="card">
        <div className="flex space">
          <div>
            <h3 style={{ margin: 0 }}>Payment Adjustment Settings</h3>
            <p className="hint">
              Toggle payment methods, configure fees, and set referral bonus rules. (Demo-only; stored locally in your browser.)
            </p>
          </div>
          <div className="flex">
            <button className="btn" onClick={() => showToast('Reset functionality not implemented in this demo')}>
              Reset defaults
            </button>
            <button className="btn primary" onClick={() => showToast('Save functionality not implemented in this demo')}>
              Save Settings
            </button>
          </div>
        </div>

        <div className="hr"></div>

        <div className="grid2">
          <div className="card" style={{ boxShadow: 'none' }}>
            <h3>Payment Methods</h3>
            <p className="hint">Enable/disable the payment methods available in the network.</p>

            <div className="pillRow" style={{ marginTop: '10px' }}>
              <label className="tag check"><input type="checkbox" defaultChecked /> Credit Card</label>
              <label className="tag check"><input type="checkbox" defaultChecked /> Debit Card</label>
              <label className="tag check"><input type="checkbox" defaultChecked /> Apple Pay</label>
              <label className="tag check"><input type="checkbox" defaultChecked /> PayPal</label>
              <label className="tag check"><input type="checkbox" defaultChecked /> Google Pay</label>
              <label className="tag check"><input type="checkbox" /> Bank Transfer</label>
              <label className="tag check"><input type="checkbox" /> ACH</label>
            </div>

            <div className="hr"></div>

            <h4 style={{ margin: '0 0 8px' }}>Transaction (Processing) Fee by Method (%)</h4>
            <div className="grid2">
              <div className="field"><label>Credit Card</label><input type="number" step="0.01" defaultValue="0.00" /></div>
              <div className="field"><label>Debit Card</label><input type="number" step="0.01" defaultValue="0.00" /></div>
              <div className="field"><label>Apple Pay</label><input type="number" step="0.01" defaultValue="0.00" /></div>
              <div className="field"><label>PayPal</label><input type="number" step="0.01" defaultValue="0.00" /></div>
              <div className="field"><label>Google Pay</label><input type="number" step="0.01" defaultValue="0.00" /></div>
              <div className="field"><label>Bank Transfer</label><input type="number" step="0.01" defaultValue="0.00" /></div>
              <div className="field"><label>ACH</label><input type="number" step="0.01" defaultValue="0.00" /></div>
            </div>
          </div>

          <div className="card" style={{ boxShadow: 'none' }}>
            <h3>Total Charge</h3>
            <p className="hint">Total = Service Fee + (Service Fee × Processing Fee %) — varies by payment method</p>

            <div className="grid2">
              <div className="field">
                <label>Service Fee ($)</label>
                <input type="number" step="0.01" defaultValue="5.00" />
              </div>
              <div className="field">
                <label>Preview Payment Method</label>
                <select>
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                  <option>Apple Pay</option>
                  <option>PayPal</option>
                  <option>Google Pay</option>
                </select>
              </div>
            </div>

            <div className="grid2">
              <div className="field">
                <label>Processing Fee (Selected Method) (% and $)</label>
                <input type="text" readOnly value="0.00% ($0.00)" />
              </div>
              <div className="field">
                <label>Total Charge (Selected Method) ($)</label>
                <input type="text" readOnly value="5.00" />
              </div>
            </div>

            <p className="hint">Tip: fees are used for calculation previews in this demo (no real payment processing).</p>
          </div>
        </div>

        <div className="hr"></div>

        <div className="card" style={{ boxShadow: 'none' }}>
          <h3>Referral & Purchase Bonus</h3>
          <p className="hint">
            Configure sender bonuses and bulk purchase discounts. In this demo, the default charge per action is $5.00.
          </p>

          <div className="grid3" style={{ marginTop: '10px' }}>
            <div className="field">
              <label>Sender Bonus per Receiver Paid Referral ($)</label>
              <input type="number" step="0.01" defaultValue="0.10" />
            </div>
            <div className="field">
              <label>Bulk Discount Threshold (credits)</label>
              <input type="number" step="1" defaultValue="10" />
            </div>
            <div className="field">
              <label>Bulk Discount (%)</label>
              <input type="number" step="0.1" defaultValue="10" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSettings;
