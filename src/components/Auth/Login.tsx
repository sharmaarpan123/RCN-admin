"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useApp } from '../../context/AppContext';
import Button from '../Button';
import CustomNextLink from '../CustomNextLink';

const Login: React.FC = () => {
  const { login, showToast } = useApp();
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
      showToast("Demo data reset.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 login-bg">
      <div className="max-w-[980px] w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-rcn-lg p-5 login-hero-gradient text-rcn-dark-text shadow-rcn min-h-[280px]">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl relative shrink-0 overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
                <Image src="/logo.jpeg" alt="RCN Logo" fill className="object-cover" />
              </div>
              <div>
                <h2 className="text-lg font-semibold m-0 mb-2">Referral Coordination Network</h2>
                <p className="text-rcn-dark-text/85 text-sm m-0">
                  Admin Panel (Demo — No API)
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Pick Sender & Receiver organizations from the master dashboard</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Narrow results by Organization Name + State + Zip</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">See Sender Inbox & Receiver Inbox side-by-side after selection</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">Data stored locally in your browser (localStorage)</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
            <h3 className="text-sm font-semibold m-0 mb-3">Sign in</h3>
            <p className="text-xs text-rcn-muted m-0 mb-4">
              Default password is <span className="font-mono">Admin123!</span> (unless changed in <b>Manage Password</b>).
            </p>

            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-1.5 my-2.5">
                <label className="text-xs text-rcn-muted">Email</label>
                <input
                  type="email"
                  placeholder="admin@rcn.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5 my-2.5">
                <label className="text-xs text-rcn-muted">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)] transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-3 mt-3 justify-between items-center">
                <Button
                  variant="secondary"
                  onClick={handleResetDemo}
                >
                  Reset demo data
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                >
                  Login
                </Button>
              </div>
            </form>

            <div className="h-px bg-rcn-border my-4"></div>

            <div className="mb-4">
              <p className="text-xs text-rcn-muted m-0 mb-3">
                Don&apos;t have an organization account?
              </p>
              <CustomNextLink href="/org-signup" variant="primary" size="sm" className="w-full justify-center">
                Register Your Organization
              </CustomNextLink>
            </div>

            <div className="h-px bg-rcn-border my-4"></div>

            <div className="bg-white shadow-none rounded-2xl border border-dashed border-rcn-border p-4" style={{ background: '#fbfefc' }}>
              <h3 className="text-sm font-semibold m-0 mb-2">Demo users</h3>
              <div className="grid gap-2 text-xs">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">System Admin</span>
                  {' '}
                  <span className="font-mono">sysadmin@rcn.local</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">Org Admin</span>
                  {' '}
                  <span className="font-mono">orgadmin@northlake.org</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">Staff</span>
                  {' '}
                  <span className="font-mono">staff@northlake.org</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-rcn-muted mt-3 text-center">
          Tip: open this in Chrome/Edge. Everything runs offline.
        </p>
      </div>
    </div>
  );
};

export default Login;
