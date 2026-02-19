import NextLink from "next/link";
import Link from "@/components/CustomNextLink";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-5 py-6.5 pb-8.5  border-rcn-border-light bg-[rgba(255,255,255,0.55)]"
      aria-label="Footer"
    >
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
              One place for organizations to send and receive referrals, share documents, and track progress—helping
              patients get care without delay.
            </p>
          </div>

          <div>
            <h4 className="m-0 mb-2 text-sm">Get Started</h4>
            <Link href="/org-signup" variant="text" className="block py-1.5">
              Register Company
            </Link>
            <Link href="/login" variant="text" className="block py-1.5">
              User Login
            </Link>
          </div>

          <div>
            <h4 className="m-0 mb-2 text-sm">Resources</h4>
            <Link href="/about-us" variant="text" className="block py-1.5">
              About
            </Link>
           
            <Link href="/contact-us" variant="text" className="block py-1.5">
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
  );
}
