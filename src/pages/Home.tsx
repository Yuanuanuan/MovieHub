import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainWrapper from "@/layouts/MainWrapper";
import UpcomingSlide from "@/layouts/UpcomingSlide";
import GenreRows from "@/layouts/GenreRows";
import Hero from "@/components/Hero";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const anchorId = location.hash.slice(1);

    // The sections above the target (Hero, MainWrapper's tab rows, other
    // GenreRows) each load their own data independently and grow the page
    // height as they resolve, so a single fixed-delay scroll attempt can
    // land before that growth happens and never get chased. Re-correct
    // (instant, so repeated calls don't fight an in-progress smooth-scroll
    // animation) until the target sits at the top of the viewport on its
    // own for a few checks in a row — i.e. nothing above it shifted since
    // the last correction — instead of guessing a fixed duration that real
    // network timing won't reliably fit.
    let attempts = 0;
    let stableCount = 0;
    const maxAttempts = 40;
    const interval = setInterval(() => {
      attempts += 1;
      const target = document.getElementById(anchorId);
      if (target) {
        const topBeforeCorrection = target.getBoundingClientRect().top;
        if (Math.abs(topBeforeCorrection) < 2) {
          stableCount += 1;
        } else {
          stableCount = 0;
          target.scrollIntoView({ behavior: "instant", block: "start" });
        }
        if (stableCount >= 3) {
          clearInterval(interval);
        }
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [location]);

  return (
    <main>
      <Hero />
      <MainWrapper />
      <GenreRows />
      <UpcomingSlide />
    </main>
  );
};

export default Home;
