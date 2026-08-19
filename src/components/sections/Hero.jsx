import React, { useState } from "react";
import { PlayCircle, Award } from "lucide-react";
import DemoVideo from "../DemoVideo";

export default function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section id="home" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-teal-50/50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <span
              data-aos="fade-down"
              data-aos-delay="100"
              className="inline-block px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase rounded-full bg-emerald-100 text-[#00A86B]"
            >
              Welcome to Foliopath 360
            </span>
            <h1
              data-aos="fade-right"
              data-aos-delay="200"
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B2545] tracking-tight leading-tight"
            >
              Foliopath 360 is the{" "}
              <span className="text-[#00A86B]">one stop</span> for all
              students
            </h1>
            <p
              data-aos="fade-right"
              data-aos-delay="300"
              className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Unlock your potential with 360° online education. Access
              world-class courses, live mentorship, and industry-recognized
              certifications anywhere, anytime.
            </p>
            <div
              data-aos="fade-up"
              data-aos-delay="400"
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button className="w-full sm:w-auto px-8 py-3.5 bg-[#00A86B] text-white font-bold rounded-full shadow-lg hover:bg-[#008f5a] hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]">
                Get Started Now
              </button>
              <button
                onClick={() => setDemoOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 text-[#0B2545] font-semibold hover:text-[#00A86B] flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <PlayCircle className="w-5 h-5 text-[#00A86B]" /> Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Banner Visual */}
          <div className="relative" data-aos="fade-left" data-aos-delay="300">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
                alt="Student learning online"
                className="w-full h-[400px] object-cover"
              />
            </div>
            {/* Floating Badge */}
            <div
              data-aos="zoom-in"
              data-aos-delay="600"
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 hidden sm:flex"
            >
              <div className="p-3 bg-emerald-100 text-[#00A86B] rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Verified Certificate
                </p>
                <p className="text-sm font-bold text-[#0B2545]">
                  360° Career Growth
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DemoVideo isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
