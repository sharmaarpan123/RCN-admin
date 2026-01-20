import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, setIsMobileMenuOpen }) => {
  return (
    <div className="flex gap-3 items-center justify-between mb-4">
      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden  p-2 rounded-lg bg-rcn-accent text-white shadow-lg hover:bg-rcn-accent-dark transition-colors"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div>
        <h2 className="m-0 text-lg font-bold">{title}</h2>
        <p className="mt-1 mb-0 text-rcn-muted text-sm">{subtitle}</p>
      </div>
      <div className="flex gap-2.5 items-center justify-end"></div>
    </div>
  );
};

export default Header;
