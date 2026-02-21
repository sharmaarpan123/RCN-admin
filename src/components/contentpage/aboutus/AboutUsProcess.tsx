"use client";

import React from "react";
import { motion } from "framer-motion";

const Arrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3.33301 8H12.6663" stroke="#31A561" stroke-opacity="0.4" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8 3.33301L12.6667 7.99967L8 12.6663" stroke="#31A561" stroke-opacity="0.4" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

const STEPS = [
  {
    step: 1,
    title: "Create",
    description: "Create the referral with required details and destination.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7L15 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M14 2V6C14 6.53043 14.2107 7.03914 14.5858 7.41421C14.9609 7.78929 15.4696 8 16 8H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M9 15H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12 18V12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Route",
    description: "Automatically route to the correct receiving inbox based on rules.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 22C7.65685 22 9 20.6569 9 19C9 17.3431 7.65685 16 6 16C4.34315 16 3 17.3431 3 19C3 20.6569 4.34315 22 6 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M9 19H17.5C18.4283 19 19.3185 18.6313 19.9749 17.9749C20.6313 17.3185 21 16.4283 21 15.5C21 14.5717 20.6313 13.6815 19.9749 13.0251C19.3185 12.3687 18.4283 12 17.5 12H6.5C5.57174 12 4.6815 11.6313 4.02513 10.9749C3.36875 10.3185 3 9.42826 3 8.5C3 7.57174 3.36875 6.6815 4.02513 6.02513C4.6815 5.36875 5.57174 5 6.5 5H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    ),

  },
  {
    step: 3,
    title: "Process",
    description: "Receiver opens and processes the referral with clear status tracking.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 14.0001L7.5 11.1001C7.66307 10.7762 7.91112 10.5028 8.21761 10.309C8.5241 10.1153 8.8775 10.0085 9.24 10.0001H20M20 10.0001C20.3055 9.99956 20.6071 10.069 20.8816 10.2032C21.1561 10.3373 21.3963 10.5326 21.5836 10.774C21.7709 11.0153 21.9004 11.2964 21.9622 11.5956C22.024 11.8949 22.0164 12.2043 21.94 12.5001L20.4 18.5001C20.2886 18.9317 20.0362 19.3136 19.6829 19.5854C19.3296 19.8571 18.8957 20.0031 18.45 20.0001H4C3.46957 20.0001 2.96086 19.7894 2.58579 19.4143C2.21071 19.0392 2 18.5305 2 18.0001V5.0001C2 4.46966 2.21071 3.96096 2.58579 3.58588C2.96086 3.21081 3.46957 3.0001 4 3.0001H7.9C8.23449 2.99682 8.56445 3.07748 8.8597 3.23472C9.15495 3.39195 9.40604 3.62072 9.59 3.9001L10.4 5.1001C10.5821 5.37663 10.83 5.60362 11.1215 5.7607C11.413 5.91778 11.7389 6.00004 12.07 6.0001H18C18.5304 6.0001 19.0391 6.21081 19.4142 6.58588C19.7893 6.96096 20 7.46966 20 8.0001V10.0001Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    ),
  },
  {
    step: 4,
    title: "Track",
    description: "Track progress and generate reports for operational insights.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M22 7L13.5 15.5L8.5 10.5L2 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M16 7H22V13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    ),
  },
];





export function AboutUsProcess() {
  return (
    <section className="mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16 max-w-6xl">
      <div className="text-center mb-10 md:mb-14">
        <p className="text-rcn-brand font-semibold text-sm uppercase tracking-wide mb-2">Our Service</p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-rcn-text mb-3">
          How our <span className="text-rcn-gradient">process works</span>
        </h2>
        <p className="text-rcn-text-faded text-base md:text-lg max-w-2xl mx-auto">
          A simple, dependable flow from referral creation to completion.
        </p>
      </div>

      <div className="hidden  lg:flex items-center lg:items-stretch gap-6 lg:gap-2">
        {STEPS.map(({ step, icon }, index) => (
          <React.Fragment key={step}>
            <motion.div
              className="flex-1 flex flex-col items-center relative text-center w-full max-w-[280px] lg:max-w-none"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <div className="rounded-xl flex  h-14 w-14 bg-rcn-gradient  relative items-center justify-center text-white">
                {icon}
              </div>
              {
                index < STEPS?.length - 1 &&
                <motion.div
                  className="absolute right-0 -translate-y-1/2 top-1/2"
                  animate={{ x: [0, 20, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Arrow />
                </motion.div>}
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
              <div className="bg-white border relative flex-col justify-center border-rcn-border rounded-xl p-4 md:p-5 shadow-sm w-full">
                <div className="w-full flex justify-center">
                  <div className=" mb-2  rounded-xl  h-14 w-14 bg-rcn-gradient  relative lg:hidden flex  items-center justify-center text-white">
                    {icon}
                  </div>
                </div>
                <p className="text-rcn-brand-light font-semibold text-sm mb-1 ">Step {step}</p>
                <h3 className="text-rcn-text font-bold text-lg mb-2">{title}</h3>
                <p className="text-rcn-text-faded text-sm leading-relaxed">{description}</p>
              </div>
            </motion.div>

            {
              index < STEPS?.length - 1 &&
              <motion.div
                className="flex lg:hidden items-center justify-center rotate-90"
                animate={{ x: [0, 20, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Arrow />
              </motion.div>
            }
          </React.Fragment>
        ))}


      </div>
    </section>
  );
}
