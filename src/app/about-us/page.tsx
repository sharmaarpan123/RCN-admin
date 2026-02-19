import React from "react";
import { ContentPageHeader, ContentPageFooter } from "@/components/contentpage";
import {
  AboutUsHero,
  AboutUsStatsCard,
  AboutUsDescription,
  AboutUsProcess,
  AboutUsMission,
  AboutUsValues,
  AboutUsSecurityTrust,
  AboutUsPlatformFeatures,
} from "@/components/contentpage/aboutus";

const AboutUsPage = () => {
  return (
    <>
      <ContentPageHeader />
      <AboutUsHero />
      <AboutUsDescription />
      <AboutUsPlatformFeatures />
      <AboutUsStatsCard />
      <AboutUsProcess />
      <AboutUsMission />
      <AboutUsValues />
      <AboutUsSecurityTrust />
      <ContentPageFooter />
    </>
  );
};

export default AboutUsPage;
