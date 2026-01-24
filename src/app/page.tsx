import Header from '@/components/LandingPage/Header';
import AdBanner from '@/components/LandingPage/AdBanner';
import NextLink from 'next/link';
import Link from '@/components/CustomNextLink';

export const metadata = {
  title: 'Referral Coordination Network (RCN) | Send & Receive Referrals Securely',
  description: 'Referral Coordination Network (RCN) helps healthcare organizations send and receive referrals securely, quickly, and track every step from request to completion.',
  themeColor: '#0F6B3A',
};

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-rcn-bg text-rcn-text leading-[1.45]"
      style={{
        background: 'radial-gradient(1200px 500px at 10% -10%, rgba(31,138,76,0.16), transparent 55%), radial-gradient(1200px 500px at 90% -10%, rgba(15,107,58,0.12), transparent 55%), var(--color-rcn-bg)'
      }}
    >
      <Header />
      <AdBanner />

      <main id="top" className="max-w-[1120px] mx-auto px-[18px]">
        {/* HERO */}
        <div className="py-9.5 pb-4.5">
          <div className="grid grid-cols-[1.15fr_0.85fr] gap-5.5 items-stretch max-md:grid-cols-1">
            <div>
              <div className="inline-flex items-center gap-2.5 px-3 py-2.5 border border-rcn-border-light bg-[rgba(255,255,255,0.72)] rounded-full text-rcn-muted text-[13px] backdrop-blur-sm">
                <span className="w-2.25 h-2.25 rounded-full bg-rcn-brand-light shadow-[0_0_0_4px_rgba(31,138,76,0.12)]" />
                One platform for referral sending, receiving, and coordination
              </div>
              <h1 className="my-3.5 mt-3.5 text-[clamp(30px,4vw,46px)] leading-[1.08] tracking-[-0.6px]">
                Send and receive referrals faster—while keeping everything secure and organized.
          </h1>
              <p className="text-rcn-muted text-base max-w-[62ch] my-0 mb-4.5">
                Referral Coordination Network (RCN) connects healthcare organizations and teams to coordinate referrals end-to-end:
                request, clinical documents, authorization notes, status updates, and completion—without back-and-forth calls and faxes.
              </p>

              <div id="get-started" className="flex gap-2.5 flex-wrap mt-2.5">
                <Link href="/company-register" variant="primary">
                  Register a Company (Send & Receive)
                </Link>
                <Link href="/login" variant="secondary">
                  User Login
                </Link>
                
              </div>

              <div className="flex gap-3.5 flex-wrap mt-4 text-rcn-muted text-[13px]" role="list" aria-label="Highlights">
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
              </div>
            </div>

            <aside className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] overflow-hidden relative" aria-label="Quick start panel">
              <div className="px-4.5 pt-4.5 pb-0 flex items-center justify-between gap-3">
                <h3 className="m-0 text-sm tracking-wide">Quick Start</h3>
                <span className="text-xs font-black text-rcn-brand bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.18)] px-2.5 py-1.5 rounded-full whitespace-nowrap">
                  Built for coordination
                </span>
              </div>
              <div className="px-4.5 pb-4.5 pt-3.5">
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-[14px] border border-rcn-border-light bg-gradient-to-b from-[rgba(244,251,246,0.8)] to-[rgba(255,255,255,0.9)]">
                    <b className="block text-lg">Send Referrals</b>
                    <span className="block text-xs text-rcn-muted mt-0.5">Create, attach docs, forward, track</span>
                  </div>
                  <div className="p-3 rounded-[14px] border border-rcn-border-light bg-gradient-to-b from-[rgba(244,251,246,0.8)] to-[rgba(255,255,255,0.9)]">
                    <b className="block text-lg">Receive Referrals</b>
                    <span className="block text-xs text-rcn-muted mt-0.5">Review, accept/decline, update status</span>
                  </div>
                  <div className="p-3 rounded-[14px] border border-rcn-border-light bg-gradient-to-b from-[rgba(244,251,246,0.8)] to-[rgba(255,255,255,0.9)]">
                    <b className="block text-lg">Users & Roles</b>
                    <span className="block text-xs text-rcn-muted mt-0.5">Admins, coordinators, clinical staff</span>
                  </div>
                  <div className="p-3 rounded-[14px] border border-rcn-border-light bg-gradient-to-b from-[rgba(244,251,246,0.8)] to-[rgba(255,255,255,0.9)]">
                    <b className="block text-lg">Directory</b>
                    <span className="block text-xs text-rcn-muted mt-0.5">Find receiving organizations quickly</span>
                  </div>
                </div>

                <div className="mt-3 rounded-[14px] border border-dashed border-[rgba(15,107,58,0.35)] p-3 bg-[rgba(15,107,58,0.05)] text-rcn-muted text-[13px]">
                  <b className="text-rcn-text">New organization?</b>
                  {' '}Register your company once, then invite users and start coordinating referrals.
                  <div className="mt-2">
                    <Link href="/company-register" variant="text">Register a company</Link>
                    {' • '}
                    <Link href="/user-register" variant="text">Create a user</Link>
                    {' • '}
                    <Link href="/login" variant="text">Sign in</Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* FEATURES */}
        <section id="features" className="py-4.5">
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
            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                ↗
              </div>
              <h3 className="m-0 mb-1.5 text-base">Referral Sending</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Submit referrals with clear services requested, attach clinical documents, and forward to the right receiver fast.
              </p>
              <ul className="my-2.5 ml-4.5 pl-0 text-rcn-muted text-sm list-disc">
                <li className="my-1.75">Standardized referral forms</li>
                <li className="my-1.75">Attach documents & notes</li>
                <li className="my-1.75">Status tracking and history</li>
              </ul>
            </div>

            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                ↘
              </div>
              <h3 className="m-0 mb-1.5 text-base">Referral Receiving</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Review inbound referrals, make a decision, and communicate next steps—without missing critical info.
              </p>
              <ul className="my-2.5 ml-4.5 pl-0 text-rcn-muted text-sm list-disc">
                <li className="my-1.75">Accept / decline / request info</li>
                <li className="my-1.75">Work queues for coordinators</li>
                <li className="my-1.75">Clear documentation trail</li>
              </ul>
            </div>

            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                ✓
              </div>
              <h3 className="m-0 mb-1.5 text-base">Coordination & Outcomes</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Reduce delays, prevent lost referrals, and help patients get care sooner with structured coordination.
              </p>
              <ul className="my-2.5 ml-4.5 pl-0 text-rcn-muted text-sm list-disc">
                <li className="my-1.75">Task-based workflow</li>
                <li className="my-1.75">Notifications and updates</li>
                <li className="my-1.75">Completion & closure tracking</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-3.5 max-md:grid-cols-1">
            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                🔎
              </div>
              <h3 className="m-0 mb-1.5 text-base">Smart Directory Search</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Search receiving organizations by specialty, services, and location to find the right fit quickly.
              </p>
              <ul className="my-2.5 ml-4.5 pl-0 text-rcn-muted text-sm list-disc">
                <li className="my-1.75">Type-to-find organizations</li>
                <li className="my-1.75">Filter by services offered</li>
                <li className="my-1.75">Optional state/location narrowing</li>
              </ul>
            </div>

            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                📎
              </div>
              <h3 className="m-0 mb-1.5 text-base">Documents & Attachments</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Share the right documents at the right time while keeping a clear record of what was sent and when.
              </p>
              <ul className="my-2.5 ml-4.5 pl-0 text-rcn-muted text-sm list-disc">
                <li className="my-1.75">Face sheet, H&P, notes, orders, etc.</li>
                <li className="my-1.75">Optional attachments by case</li>
                <li className="my-1.75">Audit-friendly organization</li>
              </ul>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-4.5">
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
            <div className="p-3.5 rounded-[18px] border border-rcn-border-light bg-[rgba(255,255,255,0.78)] shadow-[0_10px_30px_rgba(2,44,22,0.08)]">
              <div className="w-[30px] h-[30px] rounded-xl grid place-items-center bg-linear-to-br from-rcn-brand to-rcn-brand-light text-white font-black mb-2.5">
                1
              </div>
              <b className="block mb-1">Register Company</b>
              <span className="block text-rcn-muted text-[13px]">Create your organization profile to send and receive referrals.</span>
            </div>
            <div className="p-3.5 rounded-[18px] border border-rcn-border-light bg-[rgba(255,255,255,0.78)] shadow-[0_10px_30px_rgba(2,44,22,0.08)]">
              <div className="w-[30px] h-[30px] rounded-xl grid place-items-center bg-linear-to-br from-rcn-brand to-rcn-brand-light text-white font-black mb-2.5">
                2
              </div>
              <b className="block mb-1">Create Users</b>
              <span className="block text-rcn-muted text-[13px]">Add coordinators and staff with role-based access.</span>
            </div>
            <div className="p-3.5 rounded-[18px] border border-rcn-border-light bg-[rgba(255,255,255,0.78)] shadow-[0_10px_30px_rgba(2,44,22,0.08)]">
              <div className="w-[30px] h-[30px] rounded-xl grid place-items-center bg-linear-to-br from-rcn-brand to-rcn-brand-light text-white font-black mb-2.5">
                3
              </div>
              <b className="block mb-1">Send / Receive</b>
              <span className="block text-rcn-muted text-[13px]">Submit referrals, attach documents, and communicate updates.</span>
            </div>
            <div className="p-3.5 rounded-[18px] border border-rcn-border-light bg-[rgba(255,255,255,0.78)] shadow-[0_10px_30px_rgba(2,44,22,0.08)]">
              <div className="w-[30px] h-[30px] rounded-xl grid place-items-center bg-linear-to-br from-rcn-brand to-rcn-brand-light text-white font-black mb-2.5">
                4
              </div>
              <b className="block mb-1">Track & Close</b>
              <span className="block text-rcn-muted text-[13px]">Follow status to completion with a complete history trail.</span>
            </div>
          </div>

          <div className="my-4.5 mb-2 rounded-[22px] border border-[rgba(15,107,58,0.18)] bg-linear-to-br from-[rgba(15,107,58,0.12)] to-[rgba(31,138,76,0.10)] p-4.5 flex items-center justify-between gap-3.5 shadow-[0_10px_30px_rgba(2,44,22,0.08)] max-md:flex-col" role="region" aria-label="Get started call to action">
            <div>
              <h3 className="m-0 text-lg">Ready to start coordinating referrals?</h3>
              <p className="my-1 mt-1 mb-0 text-rcn-muted text-sm">
                Register your company and add users in minutes. Then send and receive referrals in one place.
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <Link href="/company-register" variant="primary">
                Register Company
              </Link>
             
              <Link href="/login" variant="ghost">
                User Login
              </Link>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section id="security" className="py-4.5">
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
            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                🔒
              </div>
              <h3 className="m-0 mb-1.5 text-base">Secure Access</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Role-based permissions help ensure users only see what they need for their job function.
              </p>
            </div>
            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                🧾
              </div>
              <h3 className="m-0 mb-1.5 text-base">Audit Trail</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Track actions and changes with time-stamped activity to support accountability and compliance reviews.
              </p>
            </div>
            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                🛡
              </div>
              <h3 className="m-0 mb-1.5 text-base">Patient Privacy</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Privacy-first design and clear controls help protect sensitive patient information throughout the workflow.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-4.5">
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

          <FAQItem
            question="Do I register as a company or as a user?"
            answer="Usually, start by registering your company (so your organization can send and receive referrals). Then create individual user accounts for your staff and assign roles/permissions."
          />
          <FAQItem
            question="Can my organization both send and receive referrals?"
            answer="Yes. Company registration supports both referral sending and receiving—so you can coordinate bi-directional workflows."
          />
          <FAQItem
            question="Can we attach clinical documents?"
            answer="Yes. Referrals can include optional attachments (e.g., face sheet, H&P, progress notes, orders, photos, etc.) depending on your workflow."
          />
          <FAQItem
            question="Is there a way to find the right receiving organization quickly?"
            answer="Yes. The directory is designed for type-to-search and filtering by services and location to speed up matching."
          />
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-4.5">
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
            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                ✉
              </div>
              <h3 className="m-0 mb-1.5 text-base">Support</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Use your organization admin account to manage users, services offered, and coordination settings.
                If you need help, contact support.
              </p>
              <ul className="my-2.5 ml-4.5 pl-0 text-rcn-muted text-sm list-disc">
                <li className="my-1.75"><Link href="/support" variant="text">Support Center</Link></li>
                <li className="my-1.75"><Link href="/contact" variant="text">Contact Form</Link></li>
                <li className="my-1.75"><Link href="/status" variant="text">System Status</Link></li>
              </ul>
            </div>

            <div className="bg-[rgba(255,255,255,0.82)] border border-rcn-border-light rounded-[18px] shadow-[0_10px_30px_rgba(2,44,22,0.08)] p-4">
              <div className="w-[38px] h-[38px] rounded-[14px] grid place-items-center bg-[rgba(15,107,58,0.10)] border border-[rgba(15,107,58,0.16)] text-rcn-brand mb-2.5 font-black tracking-[-0.4px]">
                🏢
              </div>
              <h3 className="m-0 mb-1.5 text-base">Company onboarding</h3>
              <p className="m-0 text-rcn-muted text-sm">
                Register your organization to start sending and receiving referrals through the network.
              </p>
              <div className="flex gap-2.5 flex-wrap mt-2.5">
                <Link href="/company-register" variant="primary">
                  Register Company
                </Link>
                
                <Link href="/login" variant="ghost">
                  User Login
                </Link>
              </div>
            </div>
        </div>
        </section>
      </main>

      <footer className="mt-5 py-6.5 pb-8.5 border-t border-rcn-border-light bg-[rgba(255,255,255,0.55)]" aria-label="Footer">
        <div className="max-w-[1120px] mx-auto px-[18px]">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-4 max-md:grid-cols-2 max-[520px]:grid-cols-1">
            <div>
              <NextLink href="#top" className="flex items-center gap-2.5 no-underline">
                <div className="w-9 h-9 rounded-[14px] bg-linear-to-br from-rcn-brand to-rcn-brand-light shadow-[0_10px_22px_rgba(15,107,58,0.18)] relative shrink-0">
                  <div className="absolute inset-[10px] rounded-xl border-2 border-[rgba(255,255,255,0.75)] opacity-90" />
                </div>
                <div>
                  <strong className="block text-sm">Referral Coordination Network</strong>
                  <span className="block text-xs text-rcn-muted">Built for speed, clarity, and secure coordination</span>
                </div>
              </NextLink>
              <p className="text-rcn-muted text-sm my-2.5 mt-2.5 mb-0 max-w-[52ch]">
                One place for organizations to send and receive referrals, share documents, and track progress—helping patients get care without delay.
              </p>
            </div>

            <div>
              <h4 className="m-0 mb-2 text-sm">Get Started</h4>
              <Link href="/company-register" variant="text" className="block py-1.5">
                Register Company
              </Link>
             
              <Link href="/login" variant="text" className="block py-1.5">
                User Login
              </Link>
            </div>

            <div>
              <h4 className="m-0 mb-2 text-sm">Resources</h4>
              <Link href="/about" variant="text" className="block py-1.5">
                About
              </Link>
              <Link href="/faq" variant="text" className="block py-1.5">
                FAQ
              </Link>
              <Link href="/support" variant="text" className="block py-1.5">
                Support
              </Link>
              <Link href="/contact" variant="text" className="block py-1.5">
                Contact
              </Link>
            </div>

            <div>
              <h4 className="m-0 mb-2 text-sm">Legal</h4>
              <Link href="/privacy" variant="text" className="block py-1.5">
                Privacy Policy
              </Link>
              <Link href="/terms" variant="text" className="block py-1.5">
                Terms of Use
              </Link>
              <Link href="/security" variant="text" className="block py-1.5">
                Security
              </Link>
              <Link href="/accessibility" variant="text" className="block py-1.5">
                Accessibility
              </Link>
            </div>
          </div>

          <div className="mt-4 text-rcn-muted text-xs flex items-center justify-between gap-2.5 flex-wrap">
            <div>© {currentYear} Referral Coordination Network. All rights reserved.</div>
            <div className="flex gap-2.5 items-center flex-wrap">
              <span className="text-rcn-muted">Need help?</span>
              <Link href="/support" variant="secondary" size="sm" className="rounded-full">
                Support Center
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="border border-rcn-border-light bg-[rgba(255,255,255,0.82)] rounded-2xl px-3.5 py-3 shadow-[0_10px_30px_rgba(2,44,22,0.08)] [&+&]:mt-2.5">
      <summary className="cursor-pointer font-[850]">{question}</summary>
      <p className="text-rcn-muted my-2.5 mt-2.5 mb-0 text-sm">{answer}</p>
    </details>
  );
}
