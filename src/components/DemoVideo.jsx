import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Play, Pause, RotateCcw } from "lucide-react";

const SLIDES = [
  {
    bg: "from-[#0B2545] to-[#13315c]",
    title: "Foliopath 360",
    subtitle: "Your Complete Learning Platform",
    icon: "\uD83C\uDF93",
  },
  {
    bg: "from-[#00A86B] to-[#008f5a]",
    title: "Expert-Led Courses",
    subtitle: "Industry professionals teaching real-world skills",
    icon: "\uD83D\uDCDA",
  },
  {
    bg: "from-[#0B2545] to-[#1a4275]",
    title: "Live Mentorship",
    subtitle: "1-on-1 guidance from experienced mentors",
    icon: "\uD83D\uDC68\u200D\uD83C\uDFEB",
  },
  {
    bg: "from-[#008f5a] to-[#00A86B]",
    title: "AI System Design",
    subtitle: "Master LLM, RAG & Agent architectures",
    icon: "\uD83E\uDD16",
  },
  {
    bg: "from-[#0B2545] to-[#13315c]",
    title: "Certifications",
    subtitle: "Industry-recognized credentials for your career",
    icon: "\uD83C\uDFC6",
  },
];

const SLIDE_DURATION = 3000;
const TOTAL_DURATION = 15000;

export default function DemoVideo({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const newElapsed = pausedAtRef.current + (now - startTimeRef.current);
    const clamped = Math.min(newElapsed, TOTAL_DURATION);
    setElapsed(clamped);
    setProgress((clamped / TOTAL_DURATION) * 100);
    setCurrentSlide(
      Math.min(Math.floor(clamped / SLIDE_DURATION), SLIDES.length - 1)
    );
    if (clamped >= TOTAL_DURATION) {
      clearTimer();
      setIsPlaying(false);
    }
  }, [clearTimer]);

  const play = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(tick, 50);
    setIsPlaying(true);
  }, [clearTimer, tick]);

  const pause = useCallback(() => {
    clearTimer();
    pausedAtRef.current = elapsed;
    setIsPlaying(false);
  }, [clearTimer, elapsed]);

  const restart = useCallback(() => {
    clearTimer();
    setCurrentSlide(0);
    setProgress(0);
    setElapsed(0);
    pausedAtRef.current = 0;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(tick, 50);
    setIsPlaying(true);
  }, [clearTimer, tick]);

  useEffect(() => {
    if (isOpen && isPlaying) {
      play();
    }
    return clearTimer;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      clearTimer();
      setCurrentSlide(0);
      setProgress(0);
      setElapsed(0);
      pausedAtRef.current = 0;
      setIsPlaying(true);
    }
  }, [isOpen, clearTimer]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        isPlaying ? pause() : play();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, isPlaying, pause, play, onClose]);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const secs = Math.floor(elapsed / 1000);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.3s ease-out forwards" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: "zoomIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video area */}
        <div
          className={`relative h-[340px] sm:h-[420px] bg-gradient-to-br ${slide.bg} flex flex-col items-center justify-center text-white transition-all duration-700`}
        >
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-64 h-64 rounded-full bg-white/5 -top-20 -right-20"
              style={{
                transform: `translate(${Math.sin(elapsed / 800) * 20}px, ${Math.cos(elapsed / 800) * 15}px)`,
              }}
            />
            <div
              className="absolute w-48 h-48 rounded-full bg-white/5 -bottom-16 -left-16"
              style={{
                transform: `translate(${Math.cos(elapsed / 600) * 15}px, ${Math.sin(elapsed / 600) * 20}px)`,
              }}
            />
          </div>

          {/* Slide content */}
          <div className="relative z-10 text-center px-8 animate-fadeIn">
            <div className="text-6xl mb-6">{slide.icon}</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              {slide.title}
            </h2>
            <p className="text-lg sm:text-xl text-white/80 font-medium">
              {slide.subtitle}
            </p>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "w-8 bg-white"
                    : "w-3 bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="absolute top-4 right-4 bg-black/30 px-3 py-1 rounded-full text-xs font-mono z-10">
            {secs}s / 15s
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#0B2545] px-6 py-4">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-[#00A86B] rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={isPlaying ? pause : play}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <button
                onClick={restart}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-sm text-white/60 font-medium">
                Demo Video — Foliopath 360
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
