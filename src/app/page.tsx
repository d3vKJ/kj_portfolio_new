import TopBar from "@/components/TopBar";
import Hero from "@/components/Hero";
import Passport from "@/components/Passport";
import Baggage from "@/components/Baggage";
import Departures from "@/components/Departures";
import CheckIn from "@/components/CheckIn";
import Pager from "@/components/Pager";

export default function Home() {
  return (
    <main>
      <TopBar />
      <Pager />
      <Hero />
      <Passport />
      <Baggage />
      <Departures />
      <CheckIn />
    </main>
  );
}
