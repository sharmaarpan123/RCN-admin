"use client";

/**
 * Staff Portal layout — no sidebar.
 * Different staff pages (inbox, new referral, etc.) each have their own UI.
 */
export default function StaffPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-rcn-bg text-rcn-text">
      {children}
    </div>
  );
}
