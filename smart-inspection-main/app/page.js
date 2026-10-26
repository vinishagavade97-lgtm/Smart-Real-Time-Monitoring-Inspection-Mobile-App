import Navbar from "./components/home/Navbar";
import Footer from "./components/home/Footer";
import Hero from "./components/home/Hero";
import TrustBar from "./components/home/TrustBar";
import About from "./components/home/About";
import Features from "./components/home/Features";
import HowItWorks from "./components/home/HowItWorks";
import MonitoringPreview from "./components/home/MonitoringPreview";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <TrustBar />

        <About />

        <Features />

        <HowItWorks />

        <MonitoringPreview />

        {/* Automation */}
        {/* CTA */}
      </main>

      <Footer />
    </>
  );
}