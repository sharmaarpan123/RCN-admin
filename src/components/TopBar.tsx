import React from 'react';

interface TopBarProps {
  title: string;
  subtitle: string;
}

const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  return (
    <div className="flex gap-3 items-center justify-between mb-4">
      <div>
        <h2 className="m-0 text-lg font-bold">{title}</h2>
        <p className="mt-1 mb-0 text-rcn-muted text-sm">{subtitle}</p>
      </div>
      <div className="flex gap-2.5 items-center justify-end"></div>
    </div>
  );
};

export default TopBar;
