import { Hero } from "@/components/landing/Hero";
import { Collection } from "@/components/landing/Collection";
import { Marquee } from "@/components/landing/Marquee";
import { Manifesto } from "@/components/landing/Manifesto";
import { Values } from "@/components/landing/Values";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Marquee />
        <Collection />
        <Manifesto />
        <Values />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
