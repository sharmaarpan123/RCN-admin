import React from "react";
import { ContentPageHeader } from "@/components/contentpage";
import {
  AboutUsHero,
  AboutUsDescription,
  AboutUsPlatformFeatures,
} from "@/components/contentpage/aboutus";

const AboutUsPage = () => {
  return (
    <>
      <ContentPageHeader />
      <AboutUsHero />
      <AboutUsDescription />
      <AboutUsPlatformFeatures />
    </>
  );
};

export default AboutUsPage;
