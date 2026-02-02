"use client";
import React from "react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const Progressbar = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ProgressBar
        height="10px"
        color="red" // test with red to be sure it's visible
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};

export default Progressbar;
