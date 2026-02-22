"use client";

import React from "react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Real-Time Tracking",
    description: "Monitor every referral from creation to completion with live status updates.",
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
    title: "Connected Teams",
    description: "Bring providers, care teams, and admin staff onto a single platform.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="url(#paint0_linear_306_2051)" />
        <path d="M25.6663 30.25V28.4167C25.6663 27.4442 25.28 26.5116 24.5924 25.8239C23.9048 25.1363 22.9721 24.75 21.9997 24.75H16.4997C15.5272 24.75 14.5946 25.1363 13.9069 25.8239C13.2193 26.5116 12.833 27.4442 12.833 28.4167V30.25" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M19.2497 21.0833C21.2747 21.0833 22.9163 19.4417 22.9163 17.4167C22.9163 15.3916 21.2747 13.75 19.2497 13.75C17.2246 13.75 15.583 15.3916 15.583 17.4167C15.583 19.4417 17.2246 21.0833 19.2497 21.0833Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M31.167 30.25V28.4166C31.1664 27.6042 30.896 26.815 30.3982 26.1729C29.9005 25.5308 29.2036 25.0722 28.417 24.8691" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M25.667 13.8691C26.4557 14.0711 27.1548 14.5298 27.654 15.1729C28.1532 15.8161 28.4242 16.6071 28.4242 17.4212C28.4242 18.2354 28.1532 19.0264 27.654 19.6695C27.1548 20.3127 26.4557 20.7714 25.667 20.9733" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="paint0_linear_306_2051" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" stop-opacity="0.2" />
            <stop offset="1" stop-color="#138652" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    title: "Complete Visibility",
    description: "Full audit trails and reporting for every referral action.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="url(#paint0_linear_306_2063)" />
        <path d="M24.7503 12.833H16.5003C16.0141 12.833 15.5478 13.0262 15.204 13.37C14.8601 13.7138 14.667 14.1801 14.667 14.6663V29.333C14.667 29.8192 14.8601 30.2856 15.204 30.6294C15.5478 30.9732 16.0141 31.1663 16.5003 31.1663H27.5003C27.9866 31.1663 28.4529 30.9732 28.7967 30.6294C29.1405 30.2856 29.3337 29.8192 29.3337 29.333V17.4163L24.7503 12.833Z" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M23.833 12.833V16.4997C23.833 16.9859 24.0262 17.4522 24.37 17.796C24.7138 18.1399 25.1801 18.333 25.6663 18.333H29.333" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M19.25 24.7503L21.0833 26.5837L24.75 22.917" stroke="#31A561" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
          <linearGradient id="paint0_linear_306_2063" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" stop-opacity="0.2" />
            <stop offset="1" stop-color="#138652" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

export function AboutUsDescription() {
  return (
    <section className=" container mx-auto">
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
                className="text-xl md:text-4xl font-bold text-rcn-text leading-tight mb-6"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                Modern Referral{" "}
                <span className="text-rcn-gradient">Coordination</span>
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
                className="flex gap-4 p-5 rounded-xl border border-rcn-border-light bg-rcn-card shadow-sm items-center"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: 0.08 * i }}
              >
                <div className="w-12 h-12 ">
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-rcn-text text-sm mb-1.5">{title}</h3>
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
