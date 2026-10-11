import { Header } from "@/components/dashboard/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { LiveTelemetryTicker } from "@/components/landing/LiveTelemetryTicker";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SecurityComplianceSection } from "@/components/landing/SecurityComplianceSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Header />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <LiveTelemetryTicker />
        <FeaturesSection />
        <SecurityComplianceSection />
      </main>
      <LandingFooter />
    </div>
  );
}
