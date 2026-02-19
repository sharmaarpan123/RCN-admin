import React from "react";
import { ContentPageFooter, ContentPageHeader } from "@/components/contentpage";
import {
  ContactUsHero,
  ContactUsContent,
  ContactUsMap,
} from "@/components/contentpage/contactus";

const ContactUsPage = () => {
  return (
    <>
      <ContentPageHeader />
      <ContactUsHero />
      <ContactUsContent />
      <ContactUsMap />
      <ContentPageFooter />
    </>
  );
};

export default ContactUsPage;