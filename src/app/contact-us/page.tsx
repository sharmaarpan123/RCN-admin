import {
    ContactUsContent,
    ContactUsHero,
    ContactUsMap,
} from "@/components/contentpage/contactus";
import Footer from "@/components/LandingPage/Footer";
import Header from "@/components/LandingPage/Header";

const ContactUsPage = () => {
    return (
        <>
            <Header />
            <div className="contact-us-gradient py-2">
                <ContactUsHero />
                <ContactUsContent />
                <ContactUsMap />
            </div>
            <Footer />
        </>
    );
};

export default ContactUsPage;