import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import LogoCloud from "@/components/landing/LogoCloud";
import Showcase from "@/components/landing/Showcase";
import Differentiators from "@/components/landing/Differentiators";
import CommunicationHub from "@/components/landing/CommunicationHub";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Automation from "@/components/landing/Automation";
import Roi from "@/components/landing/Roi";
import UseCases from "@/components/landing/UseCases";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import Blog from "@/components/landing/Blog";
import CtaForm from "@/components/landing/CtaForm";
import Footer from "@/components/landing/Footer";
import FloatingAssistant from "@/components/landing/FloatingAssistant";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <LogoCloud />
        <Showcase />
        <Differentiators />
        <CommunicationHub />
        <Features />
        <HowItWorks />
        <Automation />
        <Roi />
        <UseCases />
        <Testimonials />
        <Pricing />
        <Blog />
        <CtaForm />
      </main>
      <Footer />
      <FloatingAssistant />
    </div>
  );
};

export default Index;
