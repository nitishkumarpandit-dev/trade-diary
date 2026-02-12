import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { StatsSection } from "@/components/landing/stats-section";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <Header user={session?.user} />
      <main>
        <Hero />
        <StatsSection />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
