import React from "react";
import { Link } from "react-router-dom";
import Logo from "../common/Logo";

const footerLinks = {
  Company: ["About Us", "Careers", "Blog", "Press"],
  Community: ["Learners", "Partners", "Developers", "Teaching Center"],
  Support: ["Help Center", "Contact Us", "Terms & Privacy"],
};

export default function Footer() {
  return (
    <footer className="bg-[#0B2545] text-white pt-8 pb-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-6 border-b border-slate-700/60">
          <div
            data-aos="fade-up"
            data-aos-delay="0"
            className="col-span-2 space-y-4"
          >
            <Logo variant="white"  className="h-50"/>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Empowering learners worldwide through flexible, accessible, and
              high-quality online education programs.
            </p>
          </div> 

          {Object.entries(footerLinks).map(([title, links], idx) => (
            <div
              key={title}
              data-aos="fade-up"
              data-aos-delay={100 + idx * 100}
            >
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                {title}
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-400">
                {links.map((link) => (
                  <li key={link}>
                    {link === "About Us" ? (
                      <Link to="/about" className="hover:text-white transition-colors duration-200">
                        {link}
                      </Link>
                    ) : (
                      <a href="#" className="hover:text-white transition-colors duration-200">
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="400"
          className="pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2"
        >
          <p>&copy; {new Date().getFullYear()} Foliopath 360 Inc. All rights reserved.</p>
          <p className="tracking-widest uppercase">
            Learn. Anywhere. Grow. Everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
