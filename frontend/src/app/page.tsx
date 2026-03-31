import Navbar    from "@/components/layout/Navbar";
import Footer    from "@/components/layout/Footer";
import Hero      from "@/components/landing/Hero";
import Features  from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Benefits  from "@/components/landing/Benefits";
import CurrencyMarquee from "@/components/landing/CurrencyMarquee";
import FAQ       from "@/components/landing/FAQ";
import FinalCTA  from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <CurrencyMarquee />
      <Features />
      <HowItWorks />
      <Benefits />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
