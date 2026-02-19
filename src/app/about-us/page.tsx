import {
  AboutUsDescription,
  AboutUsHero,
  AboutUsMission,
  AboutUsPlatformFeatures,
  AboutUsProcess,
  AboutUsSecurityTrust,
  AboutUsStatsCard,
  AboutUsValues,
} from "@/components/contentpage/aboutus";
import Footer from "@/components/LandingPage/Footer";
import Header from "@/components/LandingPage/Header";

const AboutUsPage = () => {
  return (
    <>
      <Header />
      <AboutUsHero />
      <AboutUsDescription />
      <AboutUsPlatformFeatures />
      <AboutUsStatsCard />
      <AboutUsProcess />
      <AboutUsMission />
      <AboutUsValues />
      <AboutUsSecurityTrust />
      <Footer />
    </>
  );
};

export default AboutUsPage;
