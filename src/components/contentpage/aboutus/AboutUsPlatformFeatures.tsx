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
      <rect width="44" height="44" rx="12" fill="url(#paint0_linear_292_3722)"/>
      <path d="M12.8903 22.3191C12.8139 22.1133 12.8139 21.8869 12.8903 21.6811C13.6344 19.877 14.8974 18.3344 16.5192 17.2489C18.141 16.1634 20.0486 15.584 22.0001 15.584C23.9517 15.584 25.8593 16.1634 27.4811 17.2489C29.1029 18.3344 30.3659 19.877 31.11 21.6811C31.1864 21.8869 31.1864 22.1133 31.11 22.3191C30.3659 24.1232 29.1029 25.6658 27.4811 26.7513C25.8593 27.8367 23.9517 28.4162 22.0001 28.4162C20.0486 28.4162 18.141 27.8367 16.5192 26.7513C14.8974 25.6658 13.6344 24.1232 12.8903 22.3191Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 24.75C23.5188 24.75 24.75 23.5188 24.75 22C24.75 20.4812 23.5188 19.25 22 19.25C20.4812 19.25 19.25 20.4812 19.25 22C19.25 23.5188 20.4812 24.75 22 24.75Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
      <linearGradient id="paint0_linear_292_3722" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
      <stop stop-color="#31A561" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#138652" stop-opacity="0.1"/>
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
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
<rect width="44" height="44" rx="12" fill="url(#paint0_linear_292_3731)"/>
<path d="M29.3337 22.9168C29.3337 27.5001 26.1253 29.7918 22.312 31.1209C22.1123 31.1886 21.8954 31.1853 21.6978 31.1118C17.8753 29.7918 14.667 27.5001 14.667 22.9168V16.5001C14.667 16.257 14.7636 16.0238 14.9355 15.8519C15.1074 15.68 15.3405 15.5834 15.5837 15.5834C17.417 15.5834 19.7087 14.4834 21.3037 13.0901C21.4979 12.9242 21.7449 12.833 22.0003 12.833C22.2558 12.833 22.5028 12.9242 22.697 13.0901C24.3012 14.4926 26.5837 15.5834 28.417 15.5834C28.6601 15.5834 28.8933 15.68 29.0652 15.8519C29.2371 16.0238 29.3337 16.257 29.3337 16.5001V22.9168Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19.25 22.0003L21.0833 23.8337L24.75 20.167" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
<defs>
<linearGradient id="paint0_linear_292_3731" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
<stop stop-color="#31A561" stop-opacity="0.2"/>
<stop offset="1" stop-color="#138652" stop-opacity="0.1"/>
</linearGradient>
</defs>
</svg>
    ),
  },
  {
    title: "Financial & Reporting",
    description:
      "Time-frame reporting, transparency in referral activity, and structured reporting for leadership.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="12" fill="url(#paint0_linear_292_3740)"/>
      <path d="M13.75 13.75V28.4167C13.75 28.9029 13.9432 29.3692 14.287 29.713C14.6308 30.0568 15.0971 30.25 15.5833 30.25H30.25" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27.5 26.5833V19.25" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22.917 26.583V15.583" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18.333 26.583V23.833" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
      <linearGradient id="paint0_linear_292_3740" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
      <stop stop-color="#31A561" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#138652" stop-opacity="0.1"/>
      </linearGradient>
      </defs>
      </svg>
    ),
  },
  {
    title: "Audit-Ready Workflow",
    description:
      "Clear logs and referral history to support internal reviews and compliance needs.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="12" fill="url(#paint0_linear_292_3751)"/>
      <path d="M24.7497 12.833H19.2497C18.7434 12.833 18.333 13.2434 18.333 13.7497V15.583C18.333 16.0893 18.7434 16.4997 19.2497 16.4997H24.7497C25.2559 16.4997 25.6663 16.0893 25.6663 15.583V13.7497C25.6663 13.2434 25.2559 12.833 24.7497 12.833Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25.667 14.667H27.5003C27.9866 14.667 28.4529 14.8601 28.7967 15.204C29.1405 15.5478 29.3337 16.0141 29.3337 16.5003V29.3337C29.3337 29.8199 29.1405 30.2862 28.7967 30.63C28.4529 30.9738 27.9866 31.167 27.5003 31.167H16.5003C16.0141 31.167 15.5478 30.9738 15.204 30.63C14.8601 30.2862 14.667 29.8199 14.667 29.3337V16.5003C14.667 16.0141 14.8601 15.5478 15.204 15.204C15.5478 14.8601 16.0141 14.667 16.5003 14.667H18.3337" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.25 23.8333L21.0833 25.6667L24.75 22" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
      <linearGradient id="paint0_linear_292_3751" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
      <stop stop-color="#31A561" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#138652" stop-opacity="0.1"/>
      </linearGradient>
      </defs>
      </svg>
    ),
  },
];

export function AboutUsPlatformFeatures() {
  return (
    <section className="bg-rcn-border-light/50 pb-20">
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
            <span className="text-rcn-gradient">Coordinate Referrals</span>
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
