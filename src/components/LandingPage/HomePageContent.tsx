"use client";

import { motion } from "framer-motion";
import Link from "@/components/CustomNextLink";

const sectionMotion = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-30px" },
  transition: { duration: 0.4 },
};

const cardInView = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-20px" },
  transition: { duration: 0.35, delay: i * 0.06 },
});

const heroItemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const heroItemVariantH1 = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const heroItemVariantP = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  return (
    <motion.div
      className="[&+&]:mt-2.5"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <details className="border border-rcn-border-light bg-[rgba(255,255,255,0.82)] rounded-2xl px-3.5 py-3 shadow-[0_10px_30px_rgba(2,44,22,0.08)]">
        <summary className="cursor-pointer font-[850]">{question}</summary>
        <p className="text-rcn-muted my-2.5 mt-2.5 mb-0 text-sm">{answer}</p>
      </details>
    </motion.div>
  );
}
 
export default function HomePageContent() {
  return (
    <main id="top" className="max-w-[1120px] mx-auto px-[18px]">
      {/* HERO */}
      <div className="py-9.5 pb-4.5">
        <div className="grid grid-cols-[1.15fr_0.85fr] gap-5.5 items-stretch max-md:grid-cols-1">
          <motion.div
            className="flex flex-col"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
            }}
          >
            <motion.div
              className="inline-flex items-center gap-2.5 px-3 py-2.5 border border-rcn-border-light bg-[rgba(255,255,255,0.72)] rounded-full text-rcn-muted text-[13px] backdrop-blur-sm w-fit"
              variants={heroItemVariant}
            >
              <span className="w-2.25 h-2.25 rounded-full bg-rcn-brand-light shadow-[0_0_0_4px_rgba(31,138,76,0.12)]" />
              One platform for referral sending, receiving, and coordination
            </motion.div>
            <motion.h1
              className="my-3.5 mt-3.5 text-[clamp(30px,4vw,46px)] leading-[1.08] tracking-[-0.6px]"
              variants={heroItemVariantH1}
            >
              Send and receive referrals faster—while keeping everything secure and organized.
            </motion.h1>
            <motion.p
              className="text-rcn-muted text-base max-w-[62ch] my-0 mb-4.5"
              variants={heroItemVariantP}
            >
              Referral Coordination Network (RCN) connects healthcare organizations and teams to coordinate referrals end-to-end:
              request, clinical documents, authorization notes, status updates, and completion—without back-and-forth calls and faxes.
            </motion.p>

            <motion.div
              id="get-started"
              className="flex gap-2.5 flex-wrap mt-2.5"
              variants={heroItemVariant}
            >
              <Link href="/org-signup" variant="primary">
                {"Register a Company (Send & Receive)"}
              </Link>
              <Link href="/login" variant="secondary">
                User Login
              </Link>
            </motion.div>

            <motion.div
              className="flex gap-3.5 flex-wrap mt-4 text-rcn-muted text-[13px]"
              role="list"
              aria-label="Highlights"
              variants={heroItemVariant}
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-rcn-border-light bg-[rgba(255,255,255,0.72)]" role="listitem">
                ✅ Centralized referral workflow
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-rcn-border-light bg-[rgba(255,255,255,0.72)]" role="listitem">
                ✅ Document sharing & audit trail
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-rcn-border-light bg-[rgba(255,255,255,0.72)]" role="listitem">
                ✅ Faster scheduling & fewer delays
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-rcn-border-light bg-[rgba(255,255,255,0.72)]" role="listitem">
                ✅ Better patient experience
              </div>
            </motion.div>
          </motion.div>

          <motion.aside
            className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] overflow-hidden relative"
            aria-label="Quick start panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <div className="px-4.5 pt-4.5 pb-0 flex items-center justify-between gap-3">
              <h3 className="m-0 text-sm tracking-wide">Quick Start</h3>
              <span className="text-xs font-black text-rcn-brand bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.18)] px-2.5 py-1.5 rounded-full whitespace-nowrap">
                Built for coordination
              </span>
            </div>
            <div className="px-4.5 pb-4.5 pt-3.5">
              <div className="grid grid-cols-2 gap-3 mt-3">
                {[
                  { title: "Send Referrals", sub: "Create, attach docs, forward, track" },
                  { title: "Receive Referrals", sub: "Review, accept/decline, update status" },
                  { title: "Users & Roles", sub: "Admins, coordinators, clinical staff" },
                  { title: "Directory", sub: "Find receiving organizations quickly" },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="p-3 rounded-[14px] border border-rcn-border-light bg-linear-to-b from-[rgba(244,251,246,0.8)] to-[rgba(255,255,255,0.9)]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 + i * 0.06 }}
                  >
                    <b className="block text-lg">{item.title}</b>
                    <span className="block text-xs text-rcn-muted mt-0.5">{item.sub}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-3 rounded-[14px] border border-dashed border-[rgba(15,107,58,0.35)] p-3 bg-[rgba(15,107,58,0.05)] text-rcn-muted text-[13px]">
                <b className="text-rcn-text">New organization?</b>
                {" "}Register your company once, then invite users and start coordinating referrals.
                <div className="mt-2">
                  <Link href="/org-signup" variant="text">Register a company</Link>
                  {" • "}
                  <Link href="/user-register" variant="text">Create a user</Link>
                  {" • "}
                  <Link href="/login" variant="text">Sign in</Link>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* FEATURES */}
      <motion.section
        id="features"
        className="py-4.5"
        {...sectionMotion}
      >
        <div className="flex items-end justify-between gap-4 my-2.5">
          <div>
            <h2 className="m-0 text-[clamp(22px,2.6vw,30px)] tracking-[-0.2px]">
              Everything you need to coordinate referrals
            </h2>
            <p className="m-0 max-w-[70ch] text-rcn-muted text-sm">
              Designed for clinics, hospitals, imaging centers, pharmacies, home health, and specialty providers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5 mt-3 max-md:grid-cols-1">
          {[
            { icon: "↗", title: "Referral Sending", desc: "Submit referrals with clear services requested, attach clinical documents, and forward to the right receiver fast.", bullets: ["Standardized referral forms", "Attach documents & notes", "Status tracking and history"] },
            { icon: "↘", title: "Referral Receiving", desc: "Review inbound referrals, make a decision, and communicate next steps—without missing critical info.", bullets: ["Accept / decline / request info", "Work queues for coordinators", "Clear documentation trail"] },
            { icon: "✓", title: "Coordination & Outcomes", desc: "Reduce delays, prevent lost referrals, and help patients get care sooner with structured coordination.", bullets: ["Task-based workflow", "Notifications and updates", "Completion & closure tracking"] },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4"
              {...cardInView(i)}
            >
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">{card.icon}</div>
              <h3 className="m-0 mb-1.5 text-base">{card.title}</h3>
              <p className="m-0 text-rcn-muted text-sm">{card.desc}</p>
              <ul className="my-2.5 ml-4.5 pl-0 text-rcn-muted text-sm list-disc">
                {card.bullets.map((b) => <li key={b} className="my-1.75">{b}</li>)}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3.5 mt-3.5 max-md:grid-cols-1">
          {[
            { icon: "🔎", title: "Smart Directory Search", desc: "Search receiving organizations by specialty, services, and location to find the right fit quickly.", bullets: ["Type-to-find organizations", "Filter by services offered", "Optional state/location narrowing"] },
            { icon: "📎", title: "Documents & Attachments", desc: "Share the right documents at the right time while keeping a clear record of what was sent and when.", bullets: ["Face sheet, H&P, notes, orders, etc.", "Optional attachments by case", "Audit-friendly organization"] },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4"
              {...cardInView(3 + i)}
            >
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">{card.icon}</div>
              <h3 className="m-0 mb-1.5 text-base">{card.title}</h3>
              <p className="m-0 text-rcn-muted text-sm">{card.desc}</p>
              <ul className="my-2.5 ml-4.5 pl-0 text-rcn-muted text-sm list-disc">
                {card.bullets.map((b) => <li key={b} className="my-1.75">{b}</li>)}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section
        id="how-it-works"
        className="py-4.5"
        {...sectionMotion}
      >
        <div className="flex items-end justify-between gap-4 my-2.5">
          <div>
            <h2 className="m-0 text-[clamp(22px,2.6vw,30px)] tracking-[-0.2px]">
              How it works
            </h2>
            <p className="m-0 max-w-[70ch] text-rcn-muted text-sm">
              Simple onboarding for companies and users—then referrals move through a clear, trackable process.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-3 max-md:grid-cols-2 max-[520px]:grid-cols-1">
          {[
            { num: 1, title: "Register Company", desc: "Create your organization profile to send and receive referrals." },
            { num: 2, title: "Create Users", desc: "Add coordinators and staff with role-based access." },
            { num: 3, title: "Send / Receive", desc: "Submit referrals, attach documents, and communicate updates." },
            { num: 4, title: "Track & Close", desc: "Follow status to completion with a complete history trail." },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              className="p-3.5 rounded-[18px] border border-rcn-border-light bg-[rgba(255,255,255,0.78)] shadow-[0_10px_30px_rgba(2,44,22,0.08)]"
              {...cardInView(i)}
            >
              <div className="w-[30px] h-[30px] rounded-xl grid place-items-center bg-linear-to-br from-rcn-brand to-rcn-brand-light text-white font-black mb-2.5">{step.num}</div>
              <b className="block mb-1">{step.title}</b>
              <span className="block text-rcn-muted text-[13px]">{step.desc}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="my-4.5 mb-2 rounded-rcn-lg border border-[rgba(15,107,58,0.18)] bg-linear-to-br from-[rgba(15,107,58,0.12)] to-[rgba(31,138,76,0.10)] p-4.5 flex items-center justify-between gap-3.5 shadow-[0_10px_30px_rgba(2,44,22,0.08)] max-md:flex-col"
          role="region"
          aria-label="Get started call to action"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div>
            <h3 className="m-0 text-lg">Ready to start coordinating referrals?</h3>
            <p className="my-1 mt-1 mb-0 text-rcn-muted text-sm">
              Register your company and add users in minutes. Then send and receive referrals in one place.
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <Link href="/org-signup" variant="primary">
              Register Company
            </Link>
            <Link href="/login" variant="ghost">
              User Login
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* SECURITY */}
      <motion.section
        id="security"
        className="py-4.5"
        {...sectionMotion}
      >
        <div className="flex items-end justify-between gap-4 my-2.5">
          <div>
            <h2 className="m-0 text-[clamp(22px,2.6vw,30px)] tracking-[-0.2px]">
              Security, privacy, and trust
            </h2>
            <p className="m-0 max-w-[70ch] text-rcn-muted text-sm">
              Built to support healthcare workflows with strong privacy practices and audit-friendly processes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5 mt-3 max-md:grid-cols-1">
          {[
            { icon: "🔒", title: "Secure Access", desc: "Role-based permissions help ensure users only see what they need for their job function." },
            { icon: "🧾", title: "Audit Trail", desc: "Track actions and changes with time-stamped activity to support accountability and compliance reviews." },
            { icon: "🛡", title: "Patient Privacy", desc: "Privacy-first design and clear controls help protect sensitive patient information throughout the workflow." },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4"
              {...cardInView(i)}
            >
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">{card.icon}</div>
              <h3 className="m-0 mb-1.5 text-base">{card.title}</h3>
              <p className="m-0 text-rcn-muted text-sm">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        id="faq"
        className="py-4.5"
        {...sectionMotion}
      >
        <div className="flex items-end justify-between gap-4 my-2.5">
          <div>
            <h2 className="m-0 text-[clamp(22px,2.6vw,30px)] tracking-[-0.2px]">
              Frequently asked questions
            </h2>
            <p className="m-0 max-w-[70ch] text-rcn-muted text-sm">
              Common questions about registration, users, referrals, and workflow.
            </p>
          </div>
        </div>

        <FAQItem index={0} question="Do I register as a company or as a user?" answer="Usually, start by registering your company (so your organization can send and receive referrals). Then create individual user accounts for your staff and assign roles/permissions." />
        <FAQItem index={1} question="Can my organization both send and receive referrals?" answer="Yes. Company registration supports both referral sending and receiving—so you can coordinate bi-directional workflows." />
        <FAQItem index={2} question="Can we attach clinical documents?" answer="Yes. Referrals can include optional attachments (e.g., face sheet, H&P, progress notes, orders, photos, etc.) depending on your workflow." />
        <FAQItem index={3} question="Is there a way to find the right receiving organization quickly?" answer="Yes. The directory is designed for type-to-search and filtering by services and location to speed up matching." />
      </motion.section>

      {/* CONTACT */}
      <motion.section
        id="contact"
        className="py-4.5"
        {...sectionMotion}
      >
        <div className="flex items-end justify-between gap-4 my-2.5">
          <div>
            <h2 className="m-0 text-[clamp(22px,2.6vw,30px)] tracking-[-0.2px]">
              Contact
            </h2>
            <p className="m-0 max-w-[70ch] text-rcn-muted text-sm">
              Questions, onboarding help, or partnership inquiries—reach out anytime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 mt-3 max-md:grid-cols-1">
          <motion.div
            className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4"
            {...cardInView(0)}
          >
            <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">✉</div>
            <h3 className="m-0 mb-1.5 text-base">Support</h3>
            <p className="m-0 text-rcn-muted text-sm">
              Use your organization admin account to manage users, services offered, and coordination settings. If you need help, contact support.
            </p>
            <ul className="my-2.5 ml-4.5 pl-0 text-rcn-muted text-sm list-disc">
              <li className="my-1.75"><Link href="/support" variant="text">Support Center</Link></li>
              <li className="my-1.75"><Link href="/contact" variant="text">Contact Form</Link></li>
              <li className="my-1.75"><Link href="/status" variant="text">System Status</Link></li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4"
            {...cardInView(1)}
          >
            <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">🏢</div>
            <h3 className="m-0 mb-1.5 text-base">Company onboarding</h3>
            <p className="m-0 text-rcn-muted text-sm">
              Register your organization to start sending and receiving referrals through the network.
            </p>
            <div className="flex gap-2.5 flex-wrap mt-2.5">
              <Link href="/org-signup" variant="primary">Register Company</Link>
              <Link href="/login" variant="ghost">User Login</Link>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
