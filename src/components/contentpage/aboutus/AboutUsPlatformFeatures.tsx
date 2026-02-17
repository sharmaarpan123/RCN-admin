"use client";

import React from "react";
import { motion } from "framer-motion";

const ICON_WRAPPER_CLASS =
  "flex h-12 w-12 shrink-0 items-center justify-center  text-rcn-brand-light";

const PLATFORM_FEATURES = [
  {
    title: "Send & Receive Inboxes",
    description:
      "Dedicated Sender and Receiver Inboxes to manage referral flow without confusion.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="url(#paint0_linear_292_3702)" />
        <path d="M31.1663 22H25.6663L23.833 24.75H20.1663L18.333 22H12.833" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M15.9955 15.6845L12.833 22.0003V27.5003C12.833 27.9866 13.0262 28.4529 13.37 28.7967C13.7138 29.1405 14.1801 29.3337 14.6663 29.3337H29.333C29.8192 29.3337 30.2856 29.1405 30.6294 28.7967C30.9732 28.4529 31.1663 27.9866 31.1663 27.5003V22.0003L28.0038 15.6845C27.8521 15.379 27.6181 15.122 27.3282 14.9422C27.0383 14.7625 26.7041 14.6672 26.363 14.667H17.6363C17.2953 14.6672 16.961 14.7625 16.6711 14.9422C16.3813 15.122 16.1473 15.379 15.9955 15.6845Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="paint0_linear_292_3702" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" stop-opacity="0.2" />
            <stop offset="1" stop-color="#138652" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    title: "Branch-Based Routing",
    description:
      "Organize referrals by organization, branch, department, or service line for clean handoffs.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="url(#paint0_linear_292_3711)" />
        <path d="M16.5 13.75V24.75" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M27.5 19.25C29.0188 19.25 30.25 18.0188 30.25 16.5C30.25 14.9812 29.0188 13.75 27.5 13.75C25.9812 13.75 24.75 14.9812 24.75 16.5C24.75 18.0188 25.9812 19.25 27.5 19.25Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M16.5 30.25C18.0188 30.25 19.25 29.0188 19.25 27.5C19.25 25.9812 18.0188 24.75 16.5 24.75C14.9812 24.75 13.75 25.9812 13.75 27.5C13.75 29.0188 14.9812 30.25 16.5 30.25Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M27.5 19.25C27.5 21.438 26.6308 23.5365 25.0836 25.0836C23.5365 26.6308 21.438 27.5 19.25 27.5" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="paint0_linear_292_3711" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" stop-opacity="0.2" />
            <stop offset="1" stop-color="#138652" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    title: "Tracking & Visibility",
    description:
      "Know where every referral is—new, opened, in progress, completed—without chasing updates.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="url(#paint0_linear_292_3711)" />
        <path d="M16.5 13.75V24.75" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M27.5 19.25C29.0188 19.25 30.25 18.0188 30.25 16.5C30.25 14.9812 29.0188 13.75 27.5 13.75C25.9812 13.75 24.75 14.9812 24.75 16.5C24.75 18.0188 25.9812 19.25 27.5 19.25Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M16.5 30.25C18.0188 30.25 19.25 29.0188 19.25 27.5C19.25 25.9812 18.0188 24.75 16.5 24.75C14.9812 24.75 13.75 25.9812 13.75 27.5C13.75 29.0188 14.9812 30.25 16.5 30.25Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M27.5 19.25C27.5 21.438 26.6308 23.5365 25.0836 25.0836C23.5365 26.6308 21.438 27.5 19.25 27.5" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="paint0_linear_292_3711" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" stop-opacity="0.2" />
            <stop offset="1" stop-color="#138652" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    title: "Role-Based Access",
    description:
      "Control who can view, send, open, and manage referral across your organization.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Financial & Reporting",
    description:
      "Time-frame reporting, transparency in referral activity, and structured reporting for leadership.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
  },
  {
    title: "Audit-Ready Workflow",
    description:
      "Clear logs and referral history to support internal reviews and compliance needs.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },
];

export function AboutUsPlatformFeatures() {
  return (
    <section className="bg-rcn-border-light/50">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-rcn-accent"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
          >
            Platform Features
          </motion.p>
          <motion.h2
            className="mb-4 text-3xl font-bold leading-tight text-rcn-text md:text-4xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Everything You Need to{" "}
            <span className="text-rcn-brand-light">Coordinate Referrals</span>
          </motion.h2>
          <motion.p
            className="mb-10 text-base text-rcn-muted md:text-lg"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Built for real-world healthcare operations with features that
            eliminate delays and friction.
          </motion.p>


        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_FEATURES.map(({ title, description, icon }, i) => (
            <motion.div
              key={title}
              className="rounded-xl bg-[#FFFFFF33] border border-rcn-border-light  p-6 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.05 * i }} 
            >
              <div className={`${ICON_WRAPPER_CLASS} mb-4`}>{icon}</div>
              <h3 className="mb-2 text-lg font-bold text-rcn-text">{title}</h3>
              <p className="text-sm text-rcn-muted md:text-base">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
