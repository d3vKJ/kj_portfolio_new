import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import SectionSlider from "@/components/SectionSlider";
import Header from "@/components/Header";
import MobileTopButton from "@/components/MobileTopButton";
import MobileSectionRemote from "@/components/MobileSectionRemote";
import SkipToSections from "@/components/SkipToSections";

export default function Home() {
  return (
    <main>
      <SkipToSections />
      <Header />
      <MobileTopButton />
      <MobileSectionRemote />
      <Hero />
      <div id="main-sections">
        <SectionSlider>
          <AboutMe />
          <Projects />
          <Skills />
          <Contact />
        </SectionSlider>
      </div>
    </main>
  );
}
