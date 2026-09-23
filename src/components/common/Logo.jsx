import React from "react";
import logo from "../../assets/logo.png";

export default function Logo({ variant = "default", className = "" }) {
  if (variant === "white") {
    return (
      <div className={`flex items-center gap-2 cursor-pointer select-none ${className}`}> 
          <img
            src={logo}
            alt="Foliopath 360 Logo"
            className="w-full h-full object-contain"
          />
        {/* <span className="text-xl font-bold tracking-tight text-white">
          Foliopath <span className="text-[#00A86B]">360</span>
        </span> */}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 cursor-pointer select-none">
      <div className="relative flex items-center justify-center w-15 h-15 rounded-xl shadow-md overflow-hidden">
        <img
          src={logo}
          alt="Foliopath 360 Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight text-[#0B2545] leading-none">
          Foliopath <span className="text-[#00A86B]">360</span>
        </span>
        <span className="text-[9px] font-semibold tracking-widest text-slate-500 uppercase mt-0.5">
          Learn. Anywhere. Grow.
        </span>
      </div>
    </div>
  );
}
