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
            <div className="contact-us-gradient py-2">
                <ContactUsHero />
                <ContactUsContent />
                <ContactUsMap />
            </div>
            <ContentPageFooter />
        </>
    );
};

export default ContactUsPage;