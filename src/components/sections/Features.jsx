import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Users, Globe, ChevronLeft, ChevronRight, Trophy, Rocket } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Learn the latest skills",
    desc: "Stay ahead with modern curriculum tailored for technology, business, and design careers.",
  },
  {
    icon: Users,
    title: "Get ready for a career",
    desc: "Gain practical hands-on portfolio experience with guided real-world projects.",
  },
  {
    icon: Globe,
    title: "Earn accredited credentials",
    desc: "Share your verified certificate on LinkedIn and elevate your professional profile.",
  },
  {
    icon: Trophy,
    title: "Achieve your goals",
    desc: "Track progress, earn milestones and unlock new heights with every completed step.",
  },
  {
    icon: Rocket,
    title: "Accelerate your growth",
    desc: "Access dedicated mentors and career guidance to fast-track your success.",
  },
];

const VISIBLE = 3;

export default function Features() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % features.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + features.length) % features.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 2500);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="py-16 bg-white relative">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          data-aos="fade-up"
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-bold text-[#0B2545]">
            Achieve your goals with Foliopath 360
          </h2>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current * (100 / VISIBLE)}%)` }}
            >
              {features.concat(features.slice(0, VISIBLE)).map((feature, idx) => (
                <div
                  key={idx}
                  className="px-3 flex-shrink-0"
                  style={{ width: `${100 / VISIBLE}%` }}
                >
                  <div className="h-full p-7 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#00A86B]/30 hover:shadow-xl transition-all duration-300 group">
                    <div className="w-12 h-12 bg-teal-50 text-[#00A86B] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0B2545] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prev Arrow */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-[#0B2545] hover:text-[#00A86B] hover:border-[#00A86B]/40 transition-all duration-200 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {/* Next Arrow */}
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-[#0B2545] hover:text-[#00A86B] hover:border-[#00A86B]/40 transition-all duration-200 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
