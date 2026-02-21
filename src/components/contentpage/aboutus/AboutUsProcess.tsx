"use client";

import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    step: 1,
    title: "Create",
    description: "Create the referral with required details and destination.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
        <g filter="url(#filter0_dd_306_1909)">
          <rect x="12" y="2" width="56" height="56" rx="16" fill="url(#paint0_linear_306_1909)" />
          <path d="M43 20H34C33.4696 20 32.9609 20.2107 32.5858 20.5858C32.2107 20.9609 32 21.4696 32 22V38C32 38.5304 32.2107 39.0391 32.5858 39.4142C32.9609 39.7893 33.4696 40 34 40H46C46.5304 40 47.0391 39.7893 47.4142 39.4142C47.7893 39.0391 48 38.5304 48 38V25L43 20Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M42 20V24C42 24.5304 42.2107 25.0391 42.5858 25.4142C42.9609 25.7893 43.4696 26 44 26H48" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M37 33H43" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M40 36V30" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
          <filter id="filter0_dd_306_1909" x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect1_dropShadow_306_1909" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.192157 0 0 0 0 0.647059 0 0 0 0 0.380392 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_306_1909" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2_dropShadow_306_1909" />
            <feOffset dy="10" />
            <feGaussianBlur stdDeviation="7.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.192157 0 0 0 0 0.647059 0 0 0 0 0.380392 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_306_1909" result="effect2_dropShadow_306_1909" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_306_1909" result="shape" />
          </filter>
          <linearGradient id="paint0_linear_306_1909" x1="12" y1="2" x2="68" y2="58" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" />
            <stop offset="1" stop-color="#138652" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    step: 2,
    title: "Route",
    description: "Automatically route to the correct receiving inbox based on rules.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
        <g filter="url(#filter0_dd_306_1928)">
          <rect x="12" y="2" width="56" height="56" rx="16" fill="url(#paint0_linear_306_1928)" />
          <path d="M34 40C35.6569 40 37 38.6569 37 37C37 35.3431 35.6569 34 34 34C32.3431 34 31 35.3431 31 37C31 38.6569 32.3431 40 34 40Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M37 37H45.5C46.4283 37 47.3185 36.6313 47.9749 35.9749C48.6313 35.3185 49 34.4283 49 33.5C49 32.5717 48.6313 31.6815 47.9749 31.0251C47.3185 30.3687 46.4283 30 45.5 30H34.5C33.5717 30 32.6815 29.6313 32.0251 28.9749C31.3687 28.3185 31 27.4283 31 26.5C31 25.5717 31.3687 24.6815 32.0251 24.0251C32.6815 23.3687 33.5717 23 34.5 23H43" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M46 26C47.6569 26 49 24.6569 49 23C49 21.3431 47.6569 20 46 20C44.3431 20 43 21.3431 43 23C43 24.6569 44.3431 26 46 26Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
          <filter id="filter0_dd_306_1928" x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect1_dropShadow_306_1928" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.192157 0 0 0 0 0.647059 0 0 0 0 0.380392 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_306_1928" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2_dropShadow_306_1928" />
            <feOffset dy="10" />
            <feGaussianBlur stdDeviation="7.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.192157 0 0 0 0 0.647059 0 0 0 0 0.380392 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_306_1928" result="effect2_dropShadow_306_1928" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_306_1928" result="shape" />
          </filter>
          <linearGradient id="paint0_linear_306_1928" x1="12" y1="2" x2="68" y2="58" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" />
            <stop offset="1" stop-color="#138652" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    step: 3,
    title: "Process",
    description: "Receiver opens and processes the referral with clear status tracking.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
        <g filter="url(#filter0_dd_306_1946)">
          <rect x="12" y="2" width="56" height="56" rx="16" fill="url(#paint0_linear_306_1946)" />
          <path d="M34 32.0001L35.5 29.1001C35.6631 28.7762 35.9111 28.5028 36.2176 28.309C36.5241 28.1153 36.8775 28.0085 37.24 28.0001H48M48 28.0001C48.3055 27.9996 48.6071 28.069 48.8816 28.2032C49.1561 28.3373 49.3963 28.5326 49.5836 28.774C49.7709 29.0153 49.9004 29.2964 49.9622 29.5956C50.024 29.8949 50.0164 30.2043 49.94 30.5001L48.4 36.5001C48.2886 36.9317 48.0362 37.3136 47.6829 37.5854C47.3296 37.8571 46.8957 38.0031 46.45 38.0001H32C31.4696 38.0001 30.9609 37.7894 30.5858 37.4143C30.2107 37.0392 30 36.5305 30 36.0001V23.0001C30 22.4697 30.2107 21.961 30.5858 21.5859C30.9609 21.2108 31.4696 21.0001 32 21.0001H35.9C36.2345 20.9968 36.5645 21.0775 36.8597 21.2347C37.1549 21.3919 37.406 21.6207 37.59 21.9001L38.4 23.1001C38.5821 23.3766 38.83 23.6036 39.1215 23.7607C39.413 23.9178 39.7389 24 40.07 24.0001H46C46.5304 24.0001 47.0391 24.2108 47.4142 24.5859C47.7893 24.961 48 25.4697 48 26.0001V28.0001Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
          <filter id="filter0_dd_306_1946" x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect1_dropShadow_306_1946" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.192157 0 0 0 0 0.647059 0 0 0 0 0.380392 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_306_1946" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2_dropShadow_306_1946" />
            <feOffset dy="10" />
            <feGaussianBlur stdDeviation="7.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.192157 0 0 0 0 0.647059 0 0 0 0 0.380392 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_306_1946" result="effect2_dropShadow_306_1946" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_306_1946" result="shape" />
          </filter>
          <linearGradient id="paint0_linear_306_1946" x1="12" y1="2" x2="68" y2="58" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" />
            <stop offset="1" stop-color="#138652" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    step: 4,
    title: "Track",
    description: "Track progress and generate reports for operational insights.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
        <g filter="url(#filter0_dd_306_1946)">
          <rect x="12" y="2" width="56" height="56" rx="16" fill="url(#paint0_linear_306_1946)" />
          <path d="M34 32.0001L35.5 29.1001C35.6631 28.7762 35.9111 28.5028 36.2176 28.309C36.5241 28.1153 36.8775 28.0085 37.24 28.0001H48M48 28.0001C48.3055 27.9996 48.6071 28.069 48.8816 28.2032C49.1561 28.3373 49.3963 28.5326 49.5836 28.774C49.7709 29.0153 49.9004 29.2964 49.9622 29.5956C50.024 29.8949 50.0164 30.2043 49.94 30.5001L48.4 36.5001C48.2886 36.9317 48.0362 37.3136 47.6829 37.5854C47.3296 37.8571 46.8957 38.0031 46.45 38.0001H32C31.4696 38.0001 30.9609 37.7894 30.5858 37.4143C30.2107 37.0392 30 36.5305 30 36.0001V23.0001C30 22.4697 30.2107 21.961 30.5858 21.5859C30.9609 21.2108 31.4696 21.0001 32 21.0001H35.9C36.2345 20.9968 36.5645 21.0775 36.8597 21.2347C37.1549 21.3919 37.406 21.6207 37.59 21.9001L38.4 23.1001C38.5821 23.3766 38.83 23.6036 39.1215 23.7607C39.413 23.9178 39.7389 24 40.07 24.0001H46C46.5304 24.0001 47.0391 24.2108 47.4142 24.5859C47.7893 24.961 48 25.4697 48 26.0001V28.0001Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
          <filter id="filter0_dd_306_1946" x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect1_dropShadow_306_1946" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.192157 0 0 0 0 0.647059 0 0 0 0 0.380392 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_306_1946" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2_dropShadow_306_1946" />
            <feOffset dy="10" />
            <feGaussianBlur stdDeviation="7.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.192157 0 0 0 0 0.647059 0 0 0 0 0.380392 0 0 0 0.2 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_306_1946" result="effect2_dropShadow_306_1946" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_306_1946" result="shape" />
          </filter>
          <linearGradient id="paint0_linear_306_1946" x1="12" y1="2" x2="68" y2="58" gradientUnits="userSpaceOnUse">
            <stop stop-color="#31A561" />
            <stop offset="1" stop-color="#138652" />
          </linearGradient>
        </defs>
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
              <div className="rounded-xl flex items-center justify-center text-white  mb-4">
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
              <div className="rounded-xl md:d-none flex items-center justify-center text-white  mb-4">
                {icon}
              </div>
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
