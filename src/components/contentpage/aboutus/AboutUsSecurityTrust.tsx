"use client";

import React from "react";
import { motion } from "framer-motion";

const ITEMS = [
  {
    title: "Secure Access",
    description:
      "Role-based access controls ensure only authorized personnel can view and manage referrals.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Activity Logs",
    description:
      "Complete audit trail of every action taken on every referral for full transparency.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Compliance-Ready",
    description:
      "Built to support internal reviews, audits, and regulatory compliance requirements.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Healthcare-Grade Privacy",
    description:
      "Secure handling of referral information with encryption and data protection standards.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export function AboutUsSecurityTrust() {
  return (
    <section className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-6xl">
      <div className="text-center mb-10 md:mb-14">
        <p className="text-rcn-brand font-semibold text-sm uppercase tracking-wide mb-2">Security & Trust</p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-rcn-text mb-3">
          Your data is <span className="text-rcn-brand">always safe</span>
        </h2>
        <p className="text-rcn-text-faded text-base md:text-lg max-w-2xl mx-auto">
          RCN is built with healthcare-grade privacy and security so organizations can operate with confidence.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
        {ITEMS.map(({ title, description, icon }, i) => (
          <motion.div
            key={title}
            className="flex gap-4 p-5 rounded-xl border border-rcn-border bg-white shadow-sm"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-rcn-brand shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-rcn-text text-lg mb-1.5">{title}</h3>
              <p className="text-rcn-text-faded text-sm leading-relaxed">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
