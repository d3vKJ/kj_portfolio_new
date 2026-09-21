import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import SectionSlider from "@/components/SectionSlider";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <main>
      <Sidebar />
      <Hero />
      <SectionSlider>
        <AboutMe />
        <Projects />
        <Skills />
        <Contact />
      </SectionSlider>
    </main>
  );
}
