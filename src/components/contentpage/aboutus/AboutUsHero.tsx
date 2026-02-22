"use client";

import { CustomNextLink } from "@/components";
import { motion } from "framer-motion";

const HERO_BG_IMAGE = "/about-us/Hero-sec-img.png";

const STATS = [
  { value: "3x", label: "Faster Referrals" },
  { value: "98%", label: "Completion Rate" },
  { value: "60%", label: "Less Admin Work" },
];

const heroContentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const heroBadgeVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45 },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.35 + i * 0.1, duration: 0.4 },
  }),
};

const floatIconVariants = {
  hidden: (fromLeft: boolean) => ({ opacity: 0, x: fromLeft ? -24 : 24, scale: 0.85 }),
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { delay: 0.6, duration: 0.5 },
  },
};

export function AboutUsHero() {
  return (
    <motion.section
      className="mx-auto px-4 sm:px-6 lg:px-8 py-2 "
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl shadow-rcn bg-rcn-card min-h-[420px] md:min-h-[480px] flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background image with green overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url(${HERO_BG_IMAGE})`,
              backgroundPosition: "5% 0"
            }}
          />
          <div className="absolute inset-0 bg-[#c8e6d4]/70 z-10" />
          <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent z-10" />
        </div>

        <motion.div
          className="relative z-20 p-8 md:p-10 lg:p-12 flex flex-col flex-1"
          variants={heroContentVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Security badge */}
          <div className="flex justify-center mb-6">
            <motion.span
              className="inline-flex items-center text-rcn-text-faded gap-2 px-4 py-2 rounded-full bg-white/95 border border-rcn-accent  text-sm font-medium shadow-sm"
              variants={heroBadgeVariants}
              style={{
                background: "#F9FBFAB2",
              }}
            >
              <svg className="w-5 h-5 text-rcn-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Healthcare-Grade Security & Compliance
            </motion.span>
          </div>

          {/* Heading and description */}
          <div className="max-w-2xl">
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl text-center font-bold text-rcn-text leading-tight mb-4"
              variants={heroItemVariants}
            >
              Referrals that move as <span className="text-rcn-gradient">fast as care demands</span>
            </motion.h1>
            <motion.p
              className="text-base md:text-lg  mb-8 max-w-xl text-center text-rcn-text-faded"
              variants={heroItemVariants}
            >
              One secure workflow to send, receive, route, and track referrals— so patients get the right care, in the right place, at the right time.
            </motion.p>

            {/* CTAs */}
            <motion.div className="flex flex-wrap gap-3 justify-center" variants={heroItemVariants}>
              <CustomNextLink href="/staff-portal/inbox" variant="primary" size="lg" className="inline-flex bg-rcn-gradient">
                Start Coordinating
                <svg className="w-4 h-4 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </CustomNextLink>

            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div className="flex flex-wrap justify-center gap-4 mt-8 pt-8 border-t border-white/30">
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={label}
                className="text-center   bg-white rounded px-2 py-2"
                custom={i}
                variants={statItemVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="text-2xl md:text-3xl font-bold text-rcn-brand-light ">{value}</div>
                <div className="text-sm text-rcn-text-faded font-medium">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating decorative icons */}
        <FloatingIcon />
      </motion.div>
    </motion.section>
  );
}

const FloatingIcon = () => {
  return (
    <>
      <motion.div
        className="absolute bottom-24 left-8 w-12 h-12 text-rcn-brand-light/80 z-20 hidden lg:block"
        aria-hidden
        custom={true}
        variants={floatIconVariants}
        initial="hidden"
        animate="visible"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="118" height="118" viewBox="0 0 118 118" fill="none">
          <foreignObject x="0" y="0" width="117.6" height="117.6">
            <div
              className="w-full h-full"
              style={{
                backdropFilter: "blur(10px)",
                clipPath: "url(#bgblur_0_292_3301_clip_path)",
              }}
            />
          </foreignObject>
          <g filter="url(#filter0_d_292_3301)" data-figma-bg-blur-radius="20">
            <rect x="30" y="26" width="57.6" height="57.6" rx="16" fill="#F9FBFA" fillOpacity="0.7" shapeRendering="crispEdges" />
            <rect x="30.5" y="26.5" width="56.6" height="56.6" rx="15.5" stroke="#31A561" strokeOpacity="0.25" shapeRendering="crispEdges" />
            <path
              d="M67.7998 58.7998H63.7998C63.2475 58.7998 62.7998 59.2475 62.7998 59.7998V63.7998C62.7998 64.3521 63.2475 64.7998 63.7998 64.7998H67.7998C68.3521 64.7998 68.7998 64.3521 68.7998 63.7998V59.7998C68.7998 59.2475 68.3521 58.7998 67.7998 58.7998Z"
              stroke="#31A561"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M53.7998 58.7998H49.7998C49.2475 58.7998 48.7998 59.2475 48.7998 59.7998V63.7998C48.7998 64.3521 49.2475 64.7998 49.7998 64.7998H53.7998C54.3521 64.7998 54.7998 64.3521 54.7998 63.7998V59.7998C54.7998 59.2475 54.3521 58.7998 53.7998 58.7998Z"
              stroke="#31A561"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M60.7998 44.7998H56.7998C56.2475 44.7998 55.7998 45.2475 55.7998 45.7998V49.7998C55.7998 50.3521 56.2475 50.7998 56.7998 50.7998H60.7998C61.3521 50.7998 61.7998 50.3521 61.7998 49.7998V45.7998C61.7998 45.2475 61.3521 44.7998 60.7998 44.7998Z"
              stroke="#31A561"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M51.7998 58.7998V55.7998C51.7998 55.5346 51.9052 55.2802 52.0927 55.0927C52.2802 54.9052 52.5346 54.7998 52.7998 54.7998H64.7998C65.065 54.7998 65.3194 54.9052 65.5069 55.0927C65.6944 55.2802 65.7998 55.5346 65.7998 55.7998V58.7998"
              stroke="#31A561"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M58.7998 54.7998V50.7998"
              stroke="#31A561"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <filter id="filter0_d_292_3301" x="0" y="0" width="117.6" height="117.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="15" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.4 0 0 0 0 0.6 0 0 0 0 0.517647 0 0 0 0.06 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_292_3301" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_292_3301" result="shape" />
            </filter>
            <clipPath id="bgblur_0_292_3301_clip_path" transform="translate(0 0)">
              <rect x="30" y="26" width="57.6" height="57.6" rx="16" />
            </clipPath>
          </defs>
        </svg>
      </motion.div>
      <motion.div
        className="absolute top-1/2 right-16 w-10 h-10 text-rcn-brand-light/80 z-20 hidden lg:block"
        aria-hidden
        custom={false}
        variants={floatIconVariants}
        initial="hidden"
        animate="visible"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="118" height="118" viewBox="0 0 118 118" fill="none">
          <foreignObject x="0" y="0" width="117.6" height="117.6">
            <div
              className="w-full h-full"
              style={{
                backdropFilter: "blur(10px)",
                clipPath: "url(#bgblur_0_292_3298_clip_path)",
              }}
            />
          </foreignObject>
          <g filter="url(#filter0_d_292_3298)" data-figma-bg-blur-radius="20">
            <rect x="30" y="26" width="57.6" height="57.6" rx="16" fill="#F9FBFA" fillOpacity="0.7" shapeRendering="crispEdges" />
            <rect x="30.5" y="26.5" width="56.6" height="56.6" rx="15.5" stroke="#31A561" strokeOpacity="0.25" shapeRendering="crispEdges" />
            <path
              d="M50.8003 56.7995C50.6111 56.8001 50.4255 56.7471 50.2652 56.6465C50.105 56.5459 49.9765 56.4018 49.8948 56.2311C49.8132 56.0604 49.7816 55.8701 49.8038 55.6821C49.826 55.4942 49.9011 55.3164 50.0203 55.1695L59.9203 44.9695C59.9945 44.8838 60.0957 44.8258 60.2073 44.8052C60.3188 44.7846 60.434 44.8025 60.534 44.856C60.634 44.9095 60.7129 44.9954 60.7576 45.0996C60.8024 45.2038 60.8104 45.3201 60.7803 45.4295L58.8603 51.4495C58.8037 51.601 58.7847 51.764 58.8049 51.9245C58.8251 52.085 58.8839 52.2382 58.9764 52.3709C59.0688 52.5037 59.1921 52.612 59.3356 52.6866C59.4791 52.7613 59.6385 52.8 59.8003 52.7995H66.8003C66.9895 52.7988 67.1751 52.8519 67.3353 52.9525C67.4956 53.0531 67.6241 53.1971 67.7057 53.3678C67.7874 53.5385 67.819 53.7289 67.7968 53.9168C67.7746 54.1048 67.6995 54.2825 67.5803 54.4295L57.6803 64.6295C57.606 64.7152 57.5048 64.7731 57.3933 64.7937C57.2818 64.8144 57.1666 64.7965 57.0666 64.743C56.9665 64.6895 56.8877 64.6036 56.8429 64.4994C56.7982 64.3952 56.7902 64.2788 56.8203 64.1695L58.7403 58.1495C58.7969 57.998 58.8159 57.835 58.7957 57.6745C58.7755 57.514 58.7166 57.3608 58.6242 57.2281C58.5318 57.0953 58.4085 56.987 58.265 56.9123C58.1215 56.8377 57.962 56.799 57.8003 56.7995H50.8003Z"
              stroke="#31A561"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <filter id="filter0_d_292_3298" x="0" y="0" width="117.6" height="117.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="15" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.4 0 0 0 0 0.6 0 0 0 0 0.517647 0 0 0 0.06 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_292_3298" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_292_3298" result="shape" />
            </filter>
            <clipPath id="bgblur_0_292_3298_clip_path" transform="translate(0 0)">
              <rect x="30" y="26" width="57.6" height="57.6" rx="16" />
            </clipPath>
          </defs>
        </svg>
      </motion.div>
    </>
  );
};
