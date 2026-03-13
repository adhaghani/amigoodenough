import ResumeChecker from "@/components/resume-checker";
import FeaturesSection from "@/components/home/features";
import HomeFooter from "@/components/home/footer";
import HomeHeader from "@/components/home/header";
import HeroSection from "@/components/home/hero";
import HowItWorksSection from "@/components/home/how-it-works";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HomeHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ResumeChecker id="resume-checker" />
      </main>
      <HomeFooter />
    </div>
  );
}
