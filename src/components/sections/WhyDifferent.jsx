import React from "react";
import { Sparkles, Users, BadgeCheck, Headphones, Clock, Briefcase } from "lucide-react";

const differentiators = [
  {
    icon: Sparkles,
    title: "Cutting-edge Curriculum",
    desc: "Industry-led content that stays relevant and is updated constantly.",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    desc: "Learn directly from seasoned professionals and industry leaders.",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: BadgeCheck,
    title: "Recognized Certifications",
    desc: "Earn verified credentials trusted by top employers worldwide.",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Clock,
    title: "Flexible Learning",
    desc: "Study at your own pace with schedules that fit your everyday life.",
    img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Briefcase,
    title: "Career Guidance",
    desc: "Portfolio building and placement support to launch your dream career.",
    img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80",
  },
];

export default function WhyDifferent() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          data-aos="fade-up"
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase rounded-full bg-emerald-100 text-[#00A86B] mb-4">
            Why Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B2545]">
            Why Foliopath 360 is{" "}
            <span className="text-[#00A86B]">Different</span>
          </h2>
          <p className="mt-4 text-slate-500 text-sm">
            We go beyond traditional learning to deliver an experience built
            around your success.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {differentiators.map((item, idx) => (
            <div
              key={idx}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
              className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative overflow-hidden h-44">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545]/70 to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <div className="w-9 h-9 bg-[#00A86B] text-white rounded-lg flex items-center justify-center shadow-md">
                    <item.icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-white font-bold drop-shadow">
                    {item.title}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div
            data-aos="fade-up"
            data-aos-delay={differentiators.length * 100}
            className="rounded-2xl bg-gradient-to-br from-[#0B2545] to-slate-800 text-white p-8 flex flex-col items-center justify-center text-center"
          >
            <Headphones className="w-10 h-10 text-[#00A86B] mb-4" />
            <h3 className="text-xl font-bold mb-2">Not sure where to start?</h3>
            <p className="text-slate-300 text-sm mb-6">
              Talk to our learning advisors and get a personalized plan.
            </p>
            <a
              href="#"
              className="inline-block px-6 py-3 bg-[#00A86B] text-white font-semibold rounded-full shadow hover:bg-[#008f5a] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
