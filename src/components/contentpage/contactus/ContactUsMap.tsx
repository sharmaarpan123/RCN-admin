"use client";

import React from "react";
import { motion } from "framer-motion";

// Replace with your Google Maps embed URL (Share → Embed a map).
const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d380090.2!2d-88.0!3d41.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2c3cd0f4cbed%3A0xafe0a6ad09c0c000!2sChicago%2C%20IL!5e0!3m2!1sen!2sus";

export function ContactUsMap() {
  return (
    <motion.section
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-14"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="rounded-2xl overflow-hidden border border-rcn-border shadow-sm bg-slate-100 w-full h-[280px] sm:h-[320px] md:h-[390px]">
        <iframe
          title="Office location"
          src={MAP_EMBED_URL}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>
    </motion.section>
  );
}
