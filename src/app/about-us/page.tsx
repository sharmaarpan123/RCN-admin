import React from "react";
import { ContentPageHeader } from "@/components/contentpage";
import {
  AboutUsHero,
  AboutUsStatsCard,
  AboutUsDescription,
  AboutUsProcess,
  AboutUsMission,
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
    </>
  );
};

export default AboutUsPage;
