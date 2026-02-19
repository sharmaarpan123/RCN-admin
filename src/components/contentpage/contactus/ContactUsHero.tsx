"use client";

import { motion } from "framer-motion";


const HERO_BG_IMAGE = "/about-us/Hero-sec-img.png";


export function ContactUsHero() {
  return (
    <motion.section
      className="relative py-2 overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-8 mb-8 md:mb-10 min-h-[200px] flex flex-col justify-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: "500px",
      }
      }
    >
      <div className="absolute inset-0 z-0" >
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${HERO_BG_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "0 0",
            backgroundRepeat: "no-repeat",

          }}
        />
        <div className="absolute inset-0  bg-[#c8e6d4]/70   z-10" />
      </div>
      <div className="relative z-20 px-6 py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 text-center">Contact Us</h1>
        <nav className="flex items-center gap-2 text-sm text-white/90" aria-label="Breadcrumb">



        </nav>
      </div>
    </motion.section>
  );
}
