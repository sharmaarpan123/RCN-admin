import React from 'react';

interface TopBarProps {
  title: string;
  subtitle: string;
}

const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  return (
    <div className="topbar">
      <div className="title">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="right"></div>
    </div>
  );
};

export default TopBar;
