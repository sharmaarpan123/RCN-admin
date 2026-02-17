"use client";

import React from "react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Real-Time Tracking",
    description: "Monitor every referral from creation to completion with live status updates.",
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Connected Teams",
    description: "Bring providers, care teams, and admin staff onto a single platform.",
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Complete Visibility",
    description: "Full audit trails and reporting for every referral action.",
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function AboutUsDescription() {
  return (
    <section className="bg-white container mx-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left column: copy + decorative background */}
          <div className="relative">
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              aria-hidden
            >
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-rcn-accent/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-rcn-brand-light/15 blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="relative">
              <motion.p
                className="text-rcn-accent font-semibold text-sm uppercase tracking-wide mb-3"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4 }}
              >
                About Us
              </motion.p>
              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-rcn-text leading-tight mb-6"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                Modern Referral{" "}
                <span className="text-rcn-brand-light">Coordination</span>
              </motion.h2>
              <motion.p
                className="text-rcn-muted text-base md:text-lg mb-4"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                RCN is a modern referral coordination platform built to make healthcare referrals fast, trackable, and reliable—from the moment a referral is created to the moment care is delivered.
              </motion.p>
              <motion.p
                className="text-rcn-muted text-base md:text-lg"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                We connect organizations, providers, and care teams in one secure workflow so patients don&apos;t get lost between &apos;sent&apos; and &apos;scheduled.&apos;
              </motion.p>
            </div>
          </div>

          {/* Right column: feature cards */}
          <div className="flex flex-col gap-4">
            {FEATURES.map(({ title, description, icon }, i) => (
              <motion.div
                key={title}
                className="flex gap-4 p-5 rounded-xl border border-rcn-border-light bg-rcn-card shadow-sm"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: 0.08 * i }}
              >
                <div className="w-12 h-12 shrink-0 rounded-lg bg-rcn-accent/10 flex items-center justify-center text-rcn-accent p-2.5">
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-rcn-text text-lg mb-1.5">{title}</h3>
                  <p className="text-rcn-muted text-sm md:text-base">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
