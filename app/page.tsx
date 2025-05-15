import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { CallToAction } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-16"> {/* Add padding to account for fixed navbar */}
        <Hero />
        <Features />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
