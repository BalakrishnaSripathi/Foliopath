import React from "react";
import { BookOpen, Users, Globe } from "lucide-react";

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
];

export default function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          data-aos="fade-up"
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-bold text-[#0B2545]">
            Achieve your goals with Foliopath 360
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              data-aos="fade-up"
              data-aos-delay={idx * 120}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#00A86B]/30 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-teal-50 text-[#00A86B] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0B2545] mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
