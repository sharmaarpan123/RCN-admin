import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { seedDemo } from '../utils/database';

const Login: React.FC = () => {
  const { login, showToast, refreshDB } = useApp();
  const [email, setEmail] = useState('sysadmin@rcn.local');
  const [password, setPassword] = useState('Admin123!');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      // Login successful - navigation will be handled by App component
    }
  };

  const handleResetDemo = () => {
    if (window.confirm("Reset demo data? This clears local changes.")) {
      seedDemo();
      showToast("Demo data reset.");
      refreshDB();
    }
  };

  return (
    <div className="loginWrap">
      <div className="loginCard">
        <div className="loginGrid">
          <div className="loginHero">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="logo" aria-hidden="true"></div>
              <div>
                <h2>Referral Coordination Network</h2>
                <p className="muted" style={{ color: 'rgba(231,245,236,.85)' }}>
                  Admin Panel (Demo — No API)
                </p>
              </div>
            </div>
            <div className="bul">
              <div><span className="dot"></span>Pick Sender & Receiver organizations from the master dashboard</div>
              <div><span className="dot"></span>Narrow results by Organization Name + State + Zip</div>
              <div><span className="dot"></span>See Sender Inbox & Receiver Inbox side-by-side after selection</div>
              <div><span className="dot"></span>Data stored locally in your browser (localStorage)</div>
            </div>
          </div>

          <div className="card">
            <h3>Sign in</h3>
            <p className="hint">
              Default password is <span className="mono">Admin123!</span> (unless changed in <b>Manage Password</b>).
            </p>

            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="admin@rcn.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="row" style={{ marginTop: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" className="btn" onClick={handleResetDemo}>
                  Reset demo data
                </button>
                <button type="submit" className="btn primary">
                  Login
                </button>
              </div>
            </form>

            <div className="hr"></div>

            <div className="card" style={{ boxShadow: 'none', borderRadius: '14px', border: '1px dashed var(--border)', background: '#fbfefc' }}>
              <h3 style={{ marginBottom: '6px' }}>Demo users</h3>
              <div style={{ display: 'grid', gap: '8px', fontSize: '12px' }}>
                <div><span className="tag ok">System Admin</span> <span className="mono">sysadmin@rcn.local</span></div>
                <div><span className="tag">Org Admin</span> <span className="mono">orgadmin@northlake.org</span></div>
                <div><span className="tag">Staff</span> <span className="mono">staff@northlake.org</span></div>
              </div>
            </div>
          </div>
        </div>
        <p className="hint" style={{ marginTop: '10px', textAlign: 'center' }}>
          Tip: open this in Chrome/Edge. Everything runs offline.
        </p>
      </div>
    </div>
  );
};

export default Login;
