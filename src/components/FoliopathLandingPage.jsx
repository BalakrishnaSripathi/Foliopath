import React from "react";
import Header from "./layout/Header";
import Hero from "./sections/Hero";
import Features from "./sections/Features";
import WhyDifferent from "./sections/WhyDifferent";
import LearnerOutcomes from "./sections/LearnerOutcomes";
import Courses from "./sections/Courses";
import Footer from "./layout/Footer";

export default function FoliopathLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-[#00A86B] selection:text-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <WhyDifferent />
        <LearnerOutcomes />
        <Courses />
      </main>
      <Footer />
    </div>
  );
}
