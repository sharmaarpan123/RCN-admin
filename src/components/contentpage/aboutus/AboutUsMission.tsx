"use client";

import React from "react";
import { motion } from "framer-motion";

export function AboutUsMission() {
  return (
    <section className="mx-auto container px-4 sm:px-6 lg:px-8 py-12 md:py-16 ">
      <motion.div
        className="relative rounded-2xl md:rounded-3xl overflow-hidden px-6 py-10 md:px-12 md:py-14 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        style={{
          background: "linear-gradient(135deg, #0F6B3A 0%, #0a4d2a 100%)",
          boxShadow: "0 20px 40px rgba(15, 107, 58, 0.2)",
        }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 mb-6">
          <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="text-white font-semibold text-sm">Our Mission</span>
        </div>
        <h6 className="text-2xl md:text-4xl  font-bold text-white leading-tight mb-4 max-w-3xl mx-auto">
          To eliminate referral delays and friction
        </h6>
        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          By giving healthcare teams a single, simple system to send, receive, route, and manage referrals—so patients get the right care, in the right place, at the right time.
        </p>
      </motion.div>
    </section>
  );
}
