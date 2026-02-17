import React from "react";
import { ContentPageHeader } from "@/components/contentpage";
import { AboutUsHero, AboutUsDescription } from "@/components/contentpage/aboutus";

const AboutUsPage = () => {
  return (
    <>
      <ContentPageHeader />
      <AboutUsHero />
      <AboutUsDescription />
    </>
  );
};

export default AboutUsPage;
