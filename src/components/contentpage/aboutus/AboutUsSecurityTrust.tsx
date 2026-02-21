"use client";

import React from "react";
import { motion } from "framer-motion";

const ITEMS = [
  {
    title: "Secure Access",
    description:
      "Role-based access controls ensure only authorized personnel can view and manage referrals.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="url(#paint0_linear_306_833)" />
        <path d="M25.8333 19.1665H14.1667C13.2462 19.1665 12.5 19.9127 12.5 20.8332V26.6665C12.5 27.587 13.2462 28.3332 14.1667 28.3332H25.8333C26.7538 28.3332 27.5 27.587 27.5 26.6665V20.8332C27.5 19.9127 26.7538 19.1665 25.8333 19.1665Z" stroke="#31A561" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M15.833 19.1665V15.8332C15.833 14.7281 16.272 13.6683 17.0534 12.8869C17.8348 12.1055 18.8946 11.6665 19.9997 11.6665C21.1047 11.6665 22.1646 12.1055 22.946 12.8869C23.7274 13.6683 24.1663 14.7281 24.1663 15.8332V19.1665" stroke="#31A561" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="paint0_linear_306_833" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" stop-opacity="0.2" />
            <stop offset="1" stop-color="#138652" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    title: "Activity Logs",
    description:
      "Complete audit trail of every action taken on every referral for full transparency.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="url(#paint0_linear_306_2042)" />
        <path d="M31.1663 21.9997H28.893C28.4924 21.9988 28.1025 22.1292 27.783 22.3709C27.4635 22.6126 27.232 22.9523 27.1238 23.338L24.9697 31.0013C24.9558 31.0489 24.9268 31.0908 24.8872 31.1205C24.8475 31.1503 24.7993 31.1663 24.7497 31.1663C24.7001 31.1663 24.6518 31.1503 24.6122 31.1205C24.5725 31.0908 24.5436 31.0489 24.5297 31.0013L19.4697 12.998C19.4558 12.9504 19.4268 12.9086 19.3872 12.8788C19.3475 12.8491 19.2993 12.833 19.2497 12.833C19.2001 12.833 19.1518 12.8491 19.1122 12.8788C19.0725 12.9086 19.0436 12.9504 19.0297 12.998L16.8755 20.6613C16.7678 21.0456 16.5376 21.3841 16.22 21.6257C15.9023 21.8672 15.5146 21.9985 15.1155 21.9997H12.833" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="paint0_linear_306_2042" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" stop-opacity="0.2" />
            <stop offset="1" stop-color="#138652" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    title: "Compliance-Ready",
    description:
      "Built to support internal reviews, audits, and regulatory compliance requirements.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="url(#paint0_linear_306_852)" />
        <path d="M21.667 11.6665V14.9998C21.667 15.4419 21.8426 15.8658 22.1551 16.1783C22.4677 16.4909 22.8916 16.6665 23.3337 16.6665H26.667" stroke="#31A561" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M13.5563 27.4998C13.7023 27.7526 13.912 27.9626 14.1646 28.1088C14.4171 28.2551 14.7037 28.3324 14.9955 28.3332H24.9997C25.4417 28.3332 25.8656 28.1576 26.1782 27.845C26.4907 27.5325 26.6663 27.1085 26.6663 26.6665V15.8332L22.4997 11.6665H14.9997C14.5576 11.6665 14.1337 11.8421 13.8212 12.1547C13.5086 12.4672 13.333 12.8911 13.333 13.3332V15.8332" stroke="#31A561" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M17.5 25L16.25 23.75" stroke="#31A561" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M14.167 24.1665C15.5477 24.1665 16.667 23.0472 16.667 21.6665C16.667 20.2858 15.5477 19.1665 14.167 19.1665C12.7863 19.1665 11.667 20.2858 11.667 21.6665C11.667 23.0472 12.7863 24.1665 14.167 24.1665Z" stroke="#31A561" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="paint0_linear_306_852" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" stop-opacity="0.2" />
            <stop offset="1" stop-color="#138652" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    title: "Healthcare-Grade Privacy",
    description:
      "Secure handling of referral information with encryption and data protection standards.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="url(#paint0_linear_306_864)" />
        <path d="M26.6663 20.8335C26.6663 25.0002 23.7497 27.0835 20.283 28.2919C20.1015 28.3534 19.9043 28.3505 19.7247 28.2835C16.2497 27.0835 13.333 25.0002 13.333 20.8335V15.0002C13.333 14.7792 13.4208 14.5672 13.5771 14.411C13.7334 14.2547 13.9453 14.1669 14.1663 14.1669C15.833 14.1669 17.9163 13.1669 19.3663 11.9002C19.5429 11.7494 19.7675 11.6665 19.9997 11.6665C20.2319 11.6665 20.4565 11.7494 20.633 11.9002C22.0913 13.1752 24.1663 14.1669 25.833 14.1669C26.054 14.1669 26.266 14.2547 26.4223 14.411C26.5785 14.5672 26.6663 14.7792 26.6663 15.0002V20.8335Z" stroke="#31A561" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="paint0_linear_306_864" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" stop-opacity="0.2" />
            <stop offset="1" stop-color="#138652" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

export function AboutUsSecurityTrust() {
  return (
    <section className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-6xl">
      <div className="text-center mb-10 md:mb-14">
        <p className="text-rcn-brand font-semibold text-xl text-rcn-gradient uppercase tracking-wide mb-2">Security & Trust</p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-rcn-text mb-3">
          Your data is <span className="text-rcn-gradient">always safe</span>
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
            <div className="w-12 h-12  flex items-center justify-center text-rcn-brand shrink-0">
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
