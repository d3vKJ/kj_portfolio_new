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
import PearlBg from "@/components/PearlBg";

export default function Home() {
  return (
    <main>
      <PearlBg />
      <SkipToSections />
      <Header />
      <MobileTopButton />
      <MobileSectionRemote />
      <Hero />
      <div id="main-sections">
        <SectionSlider>
          <AboutMe />
          <Skills />
          <Projects />
          <Contact />
        </SectionSlider>
      </div>
    </main>
  );
}
