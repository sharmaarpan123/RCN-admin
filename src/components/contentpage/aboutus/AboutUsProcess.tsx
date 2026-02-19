"use client";

import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    step: 1,
    title: "Create",
    description: "Create the referral with required details and destination.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Route",
    description: "Automatically route to the correct receiving inbox based on rules.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Process",
    description: "Receiver opens and processes the referral with clear status tracking.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      </svg>
    ),
  },
  {
    step: 4,
    title: "Track",
    description: "Track progress and generate reports for operational insights.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const Arrow = () => (
  <svg className="w-4 h-4 text-rcn-muted shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export function AboutUsProcess() {
  return (
    <section className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-6xl">
      <div className="text-center mb-10 md:mb-14">
        <p className="text-rcn-brand font-semibold text-sm uppercase tracking-wide mb-2">Our Service</p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-rcn-text mb-3">
          How our <span className="text-rcn-brand">process works</span>
        </h2>
        <p className="text-rcn-text-faded text-base md:text-lg max-w-2xl mx-auto">
          A simple, dependable flow from referral creation to completion.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6 lg:gap-2">
        {STEPS.map(({ step, title, description, icon }, index) => (
          <React.Fragment key={step}>
            <motion.div
              className="flex-1 flex flex-col items-center text-center w-full max-w-[280px] lg:max-w-none"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <div className="w-12 h-12 rounded-xl bg-rcn-brand flex items-center justify-center text-white shadow-sm mb-4">
                {icon}
              </div>

            </motion.div>

          </React.Fragment>
        ))}


      </div>
      <hr className="my-2 border-rcn-border bg-rcn-brand-light/70 h-1 max-w-[80%] mx-auto rounded-full" />
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6 lg:gap-2">
        {STEPS.map(({ step, title, description, icon }, index) => (
          <React.Fragment key={step}>
            <motion.div
              className="flex-1 flex flex-col items-center text-center w-full max-w-[280px] lg:max-w-none"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >

              <div className="bg-white border border-rcn-border rounded-xl p-4 md:p-5 shadow-sm w-full">
                <p className="text-rcn-brand-light font-semibold text-sm mb-1 ">Step {step}</p>
                <h3 className="text-rcn-text font-bold text-lg mb-2">{title}</h3>
                <p className="text-rcn-text-faded text-sm leading-relaxed">{description}</p>
              </div>
            </motion.div>

          </React.Fragment>
        ))}


      </div>
    </section>
  );
}
