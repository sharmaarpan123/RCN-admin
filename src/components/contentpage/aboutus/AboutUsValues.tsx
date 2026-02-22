"use client";

import React from "react";
import { motion } from "framer-motion";

const VALUES = [
  {
    title: "Patient-First Speed",
    description:
      "Faster coordination means fewer complications and better outcomes for patients.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Clarity & Accountability",
    description:
      "Everyone knows what happened, when, and who owns the next step in the referral process.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: "Operational Simplicity",
    description:
      "Less administrative work, fewer errors, and fewer lost referrals across your organization.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Scalable Design",
    description:
      "Built to support single clinics and multi-branch organizations with equal efficiency.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  },
];

export function AboutUsValues() {
  return (
    <section className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-6xl">
      <div className="text-center mb-10 md:mb-14">
        <p className="text-rcn-brand text-2xl font-semibold  text-rcn-gradient uppercase tracking-wide mb-2">Our Values</p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-rcn-text mb-3">
          Built on strong <span className="text-rcn-gradient">Principles</span>
        </h2>
        <p className="text-rcn-text-faded text-base md:text-lg max-w-2xl mx-auto">
          Every decision we make is guided by these core principles.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {VALUES.map(({ title, description, icon }, i) => (
          <motion.div
            key={title}
            className="bg-white border border-rcn-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div className="flex items-center justify-center">

            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-rcn-brand mb-4 shrink-0">
              {icon}
            </div>
            </div>
            <h3 className="font-bold text-rcn-text text-lg mb-2">{title}</h3>
            <p className="text-rcn-text-faded text-sm leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
