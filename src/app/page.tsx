import Header from "@/components/LandingPage/Header";
import AdBanner from "@/components/LandingPage/AdBanner";
import Footer from "@/components/LandingPage/Footer";
import HomePageContent from "@/components/LandingPage/HomePageContent";

export const metadata = {
  title: 'Referral Coordination Network (RCN) | Send & Receive Referrals Securely',
  description: 'Referral Coordination Network (RCN) helps healthcare organizations send and receive referrals securely, quickly, and track every step from request to completion.',
  themeColor: '#0F6B3A',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-rcn-bg text-rcn-text leading-[1.45]"
      style={{
        background: 'radial-gradient(1200px 500px at 10% -10%, rgba(31,138,76,0.16), transparent 55%), radial-gradient(1200px 500px at 90% -10%, rgba(15,107,58,0.12), transparent 55%), var(--color-rcn-bg)'
      }}
    >
      <Header />
      

      <HomePageContent />

      <Footer />
    </div>
  );
}
