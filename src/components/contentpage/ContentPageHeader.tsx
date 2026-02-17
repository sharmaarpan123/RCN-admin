"use client";

import React from "react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { CustomNextLink } from "@/components";
import Image from "next/image";

const topBarVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

const navVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0 },
};

const CONTACT = {
  address: "08 W 36th St, New York, NY 10001",
  phone: "+91-77000-43200",
  email: "contact@example.com",
};

const SOCIAL_ICONS = [
  { label: "Twitter", href: "#", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "Facebook", href: "#", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Pinterest", href: "#", icon: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" },
  { label: "YouTube", href: "#", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { label: "Instagram", href: "#", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
];

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d={path} />
    </svg>
  );
}

export function ContentPageHeader() {
  return (
    <motion.header
      className="w-full header-gradient"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Top information bar - linear gradient #DBFCE8 */}
      <div className="container mx-auto text-rcn-text">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
            <div className="flex flex-wrap items-center gap-6">
              <motion.a
                href={`https://maps.google.com/?q=${encodeURIComponent(CONTACT.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-90"
                custom={0}
                variants={topBarVariants}
                initial="hidden"
                animate="visible"
              >
                <Icon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" className="w-4 h-4 shrink-0" />
                <span>{CONTACT.address}</span>
              </motion.a>
              <motion.a
                href={`tel:${CONTACT.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-2 hover:opacity-90"
                custom={1}
                variants={topBarVariants}
                initial="hidden"
                animate="visible"
              >
                <Icon path="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" className="w-4 h-4 shrink-0" />
                <span>{CONTACT.phone}</span>
              </motion.a>
              <motion.a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2 hover:opacity-90"
                custom={2}
                variants={topBarVariants}
                initial="hidden"
                animate="visible"
              >
                <Icon path="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" className="w-4 h-4 shrink-0" />
                <span>{CONTACT.email}</span>
              </motion.a>
            </div>
            <motion.div className="flex items-center gap-4" initial="hidden" animate="visible" variants={navVariants}>
              {SOCIAL_ICONS.map(({ label, href, icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-rcn-text hover:opacity-80 transition-opacity"
                  variants={navItemVariants}
                >
                  <Icon path={icon} className="w-5 h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main navigation / branding bar - white */}
      <div className="container mx-auto border-b border-rcn-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-between py-2"
            variants={navVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={navItemVariants}>
              <NextLink href="/" className="flex flex-col">
                <Image src="/logo.jpeg" alt="RCN" width={50} height={50} />
              </NextLink>
            </motion.div>
            <motion.div className="flex items-center gap-3" variants={navItemVariants}>
              <CustomNextLink href="/staff-portal/inbox" variant="primary" size="md" className="inline-flex">
                Sent
                <svg className="w-4 h-4 ml-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </CustomNextLink>
              <CustomNextLink href="/staff-portal/inbox?tab=scheduled" variant="secondary" size="md" className="inline-flex">
                Scheduled
                <svg className="w-4 h-4 ml-1.5 shrink-0 text-rcn-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </CustomNextLink>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
