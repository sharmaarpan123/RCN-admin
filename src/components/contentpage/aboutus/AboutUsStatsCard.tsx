"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const STATS = [
  { value: "3X", label: "Faster Referrals" },
  { value: "90%", label: "Completion Rate" },
  { value: "60%", label: "Less Admin Work" },
];

const AVATAR_IMAGES = [
  "/about-us/randomUser1.png",
  "/about-us/randomUser2.png",
  "/about-us/randomUser3.png",
  "/about-us/randomUser4.png",
];

export function AboutUsStatsCard() {
  return (
    <section className="relative">
    
      <div className="mx-auto translate-y-[-90px] px-4 sm:px-6 lg:px-8  max-w-5xl">
        <motion.div
          className="about-us-stats-card relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}

        >
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)`,
            }}
            aria-hidden
          />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 p-6 md:p-8 lg:p-10">
            {/* Left: avatars + booking text */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex -space-x-3 mb-4">
                {AVATAR_IMAGES.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={48}
                    height={48}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white object-cover shrink-0"
                    style={{ zIndex: AVATAR_IMAGES.length - i }}
                  />
                ))}
              </div>
              <p className="text-white text-sm md:text-base font-medium max-w-xs">
                500+ Appointment Booking Confirm for this Week
              </p>
            </div>
            {/* Right: stats */}
            <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-10 lg:gap-14">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    {value}
                  </div>
                  <div className="text-sm md:text-start font-medium mt-1 text-rcn-dark-brand">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
