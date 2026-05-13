"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ── Animation Variants ──────────────────────────────────────────────
const easeOut = "easeOut" as const;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay, ease: easeOut }
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay, ease: easeOut }
  }),
};

const slideRight = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay, ease: easeOut }
  }),
};

// ── Reusable Section Wrapper ────────────────────────────────────────
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section ref={ref} id={id} className={`relative ${className}`}>
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {children}
      </motion.div>
    </section>
  );
}

// ── Animated Score Circle ───────────────────────────────────────────
function ScoreCircle({ score, size = 120, strokeWidth = 6, delay = 0, label }: {
  score: number; size?: number; strokeWidth?: number; delay?: number; label?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>
        <motion.span
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ color, fontSize: size * 0.28 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: delay + 0.8 }}
        >
          {score}
        </motion.span>
      </div>
      {label && <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>}
    </div>
  );
}

// ── Animated Counter ────────────────────────────────────────────────
function Counter({ value, suffix = "", delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      let start = 0;
      const duration = 1500;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        start = Math.round(eased * value);
        setCount(start);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [isInView, value, delay]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Step Card ───────────────────────────────────────────────────────
function StepCard({ number, title, description, delay, icon }: {
  number: number; title: string; description: string; delay: number; icon: React.ReactNode;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="relative glass-card rounded-2xl p-8 group hover:border-green-500/20 transition-all duration-500"
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={delay}
    >
      <div className="absolute -top-4 -left-2 w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center font-black text-black text-sm">
        {number}
      </div>
      <div className="mt-4 mb-4 w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ── Category Card ───────────────────────────────────────────────────
function CategoryCard({ icon, title, description, delay, color }: {
  icon: React.ReactNode; title: string; description: string; delay: number; color: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="glass-card rounded-2xl p-6 group hover:border-white/10 transition-all duration-500 cursor-default"
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={delay}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-500"
        style={{ backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1 text-white">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ── Phone Mockup ────────────────────────────────────────────────────
function PhoneMockup() {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative animate-float">
      {/* Phone frame */}
      <div className="relative w-[280px] h-[560px] rounded-[3rem] border-[3px] border-white/10 bg-[#0a0f0b] overflow-hidden glow-green">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

        {/* Screen content */}
        <div className="absolute inset-3 rounded-[2.2rem] overflow-hidden">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="scanning"
                className="h-full flex flex-col items-center justify-center bg-[#0a0f0b] px-6"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {/* Scanning animation */}
                <motion.div
                  className="w-40 h-40 border-2 border-green-500/50 rounded-2xl relative mb-6"
                  animate={{ borderColor: ["rgba(34,197,94,0.3)", "rgba(34,197,94,0.8)", "rgba(34,197,94,0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Scan line */}
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-l-2 border-t-2 border-green-500" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-r-2 border-t-2 border-green-500" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-l-2 border-b-2 border-green-500" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-green-500" />
                  {/* Barcode lines */}
                  <div className="absolute inset-6 flex items-center justify-center gap-[2px]">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="bg-white/20 rounded-full"
                        style={{ width: Math.random() > 0.5 ? 2 : 3, height: '60%' }} />
                    ))}
                  </div>
                </motion.div>
                <p className="text-green-400 text-sm font-medium">Scanning barcode...</p>
                <div className="flex gap-1 mt-2">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-green-500"
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-green-500"
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-green-500"
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                className="h-full bg-[#0a0f0b] px-5 pt-10 pb-4 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Product header */}
                <motion.div className="text-center mb-4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <p className="text-white font-bold text-base">Organic Oat Milk</p>
                  <p className="text-white/40 text-xs">Oatly &middot; 1L</p>
                </motion.div>

                {/* Main score */}
                <motion.div className="flex justify-center mb-4"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }}>
                  <div className="relative w-24 h-24">
                    <svg width="96" height="96" className="-rotate-90">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                      <motion.circle cx="48" cy="48" r="40" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={251}
                        initial={{ strokeDashoffset: 251 }}
                        animate={{ strokeDashoffset: 251 - (79 / 100) * 251 }}
                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                      />
                    </svg>
                    <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                      <span className="text-2xl font-black text-green-400">79</span>
                      <span className="text-[8px] text-white/30">/ 100</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* BUY badge */}
                <motion.div className="flex justify-center mb-4"
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1, type: "spring" }}>
                  <span className="px-4 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold tracking-wider">BUY</span>
                </motion.div>

                {/* Sub-scores */}
                <motion.div className="grid grid-cols-2 gap-2 mb-3"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
                  {[
                    { label: "Environment", score: 82, color: "#22c55e" },
                    { label: "Labour", score: 91, color: "#22c55e" },
                    { label: "Nutrition", score: 65, color: "#f59e0b" },
                    { label: "Animal", score: 78, color: "#22c55e" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.03] rounded-lg p-2 text-center">
                      <p className="text-[9px] text-white/40 mb-0.5">{item.label}</p>
                      <p className="text-sm font-bold" style={{ color: item.color }}>{item.score}</p>
                    </div>
                  ))}
                </motion.div>

                {/* Summary text */}
                <motion.p className="text-[10px] text-white/30 text-center leading-relaxed"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                  Low carbon footprint, fair trade certified, no labour concerns.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Glow behind phone */}
      <div className="absolute -inset-10 bg-green-500/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="gradient-bg grid-pattern">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300"
        style={{
          backgroundColor: scrollY > 50 ? "rgba(5,10,6,0.85)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
          borderBottom: scrollY > 50 ? "1px solid rgba(34,197,94,0.1)" : "1px solid transparent",
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">GoodScan</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["How it works", "Categories", "Scores", "Features"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm text-white/50 hover:text-white/90 transition-colors duration-200">{item}</a>
            ))}
          </div>
          <a href="#download" className="px-5 py-2 bg-green-500 text-black text-sm font-bold rounded-full hover:bg-green-400 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20">
            Download
          </a>
        </div>
      </motion.nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20 pb-10 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-green-500/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-xs font-medium tracking-wide">Now available on iOS & Android</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Shop with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                your Values.
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-white/50 max-w-md leading-relaxed mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              Scan any product and instantly see its impact on the planet, people, and your health. Make better choices in seconds.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              <a href="#how-it-works" className="group px-8 py-3.5 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all duration-300 flex items-center gap-2 hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-0.5">
                See how it works
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" d="M19 12H5m7-7 7 7-7 7"/></svg>
              </a>
              <a href="#download" className="px-8 py-3.5 border border-white/10 text-white font-medium rounded-full hover:bg-white/5 transition-all duration-300 hover:-translate-y-0.5">
                Download free
              </a>
            </motion.div>

            {/* Trust line */}
            <motion.div
              className="flex items-center gap-6 mt-12 text-white/30 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1 }}
            >
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1l2.39 4.84L18 6.76l-4 3.9.94 5.5L10 13.47l-4.94 2.7.94-5.5-4-3.9 5.61-.92z"/></svg>
                <span>4.9 stars</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span>50K+ downloads</span>
              <div className="w-px h-4 bg-white/10" />
              <span>1M+ scans</span>
            </motion.div>
          </div>

          {/* Right: Phone */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────────────── */}
      <Section id="how-it-works" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <span className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Simple as 1-2-3</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">How it works</h2>
            <p className="text-white/40 max-w-lg mx-auto">Three simple steps to make every purchase count.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Scan or search"
              description="Point your camera at a barcode, upload a photo, or type a product name. It takes less than a second."
              delay={0.1}
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                  <path d="M7 12h10" />
                </svg>
              }
            />
            <StepCard
              number={2}
              title="We analyse it"
              description="We check environmental impact, labour practices, nutrition, and certifications using verified open data sources."
              delay={0.25}
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              }
            />
            <StepCard
              number={3}
              title="Get a clear score"
              description="See a simple 0-100 score plus a traffic-light verdict: Buy, Consider, or Avoid. No guesswork needed."
              delay={0.4}
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              }
            />
          </div>
        </div>
      </Section>

      {/* ── What we check ──────────────────────────────────────── */}
      <Section id="categories" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <span className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Four dimensions</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">What we check</h2>
            <p className="text-white/40 max-w-lg mx-auto">Every product is evaluated across four key impact areas.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 007.92 12.446A9 9 0 1112 3z"/></svg>}
              title="Environment"
              description="Carbon footprint, packaging waste, transport distance, and lifecycle analysis."
              delay={0.1}
              color="#22c55e"
            />
            <CategoryCard
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2M9 7a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
              title="Labour rights"
              description="Forced labour allegations, fair trade certification, and supply chain transparency."
              delay={0.2}
              color="#3b82f6"
            />
            <CategoryCard
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}
              title="Animal welfare"
              description="Factory farming practices, animal testing, and cruelty-free certifications."
              delay={0.3}
              color="#a855f7"
            />
            <CategoryCard
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>}
              title="Nutrition"
              description="Nutri-Score rating, NOVA processing level, and harmful additive detection."
              delay={0.4}
              color="#f59e0b"
            />
          </div>
        </div>
      </Section>

      {/* ── Score Meanings ──────────────────────────────────────── */}
      <Section id="scores" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <span className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Clear verdicts</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Score meanings</h2>
            <p className="text-white/40 max-w-lg mx-auto">A simple traffic-light system so you always know where you stand.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { score: 79, label: "Looks great", range: "70 - 100", desc: "Low impact, good practices. Feel confident buying this product.", color: "#22c55e", emoji: "BUY" },
              { score: 55, label: "Mixed", range: "45 - 69", desc: "Some concerns worth noting. Check the details and decide for yourself.", color: "#f59e0b", emoji: "CONSIDER" },
              { score: 22, label: "Avoid", range: "0 - 44", desc: "Significant ethical or environmental issues. We suggest alternatives.", color: "#ef4444", emoji: "AVOID" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card rounded-2xl p-8 text-center group hover:border-white/10 transition-all duration-500"
                variants={fadeUp}
                custom={i * 0.15}
              >
                <div className="mb-6">
                  <ScoreCircle score={item.score} size={100} strokeWidth={5} delay={i * 0.2} />
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-3"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                  {item.emoji}
                </span>
                <h3 className="text-lg font-bold text-white mb-1">{item.label}</h3>
                <p className="text-white/30 text-xs mb-3">{item.range}</p>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Live Demo Card ─────────────────────────────────────── */}
      <Section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass-card rounded-3xl p-8 md:p-12 glow-green relative overflow-hidden"
            variants={fadeUp} custom={0}
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-10 items-center relative">
              {/* Left: Product info */}
              <motion.div variants={slideLeft} custom={0.2}>
                <span className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Example result</span>
                <h3 className="text-3xl font-black text-white mb-1">Organic Oat Milk</h3>
                <p className="text-white/40 mb-6">Oatly &middot; 1L</p>

                <div className="glass-card rounded-xl p-4 mb-4">
                  <p className="text-white/40 text-sm leading-relaxed">
                    Low carbon footprint, fair trade certified, no labour concerns. Packaging is recyclable in most regions.
                  </p>
                </div>

                <p className="text-white/20 text-xs italic">This is an example &mdash; scan any product to see its real score</p>
              </motion.div>

              {/* Right: Scores */}
              <motion.div className="flex flex-col items-center gap-6" variants={slideRight} custom={0.2}>
                <ScoreCircle score={79} size={140} strokeWidth={7} label="Overall" />
                <div className="grid grid-cols-2 gap-4 w-full">
                  <ScoreCircle score={82} size={80} strokeWidth={4} delay={0.2} label="Environment" />
                  <ScoreCircle score={91} size={80} strokeWidth={4} delay={0.3} label="Labour" />
                  <ScoreCircle score={65} size={80} strokeWidth={4} delay={0.4} label="Nutrition" />
                  <ScoreCircle score={78} size={80} strokeWidth={4} delay={0.5} label="Animal" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Data Sources ───────────────────────────────────────── */}
      <Section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <span className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Trusted data</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Our data sources</h2>
            <p className="text-white/40 max-w-lg mx-auto">We combine multiple verified databases for comprehensive analysis.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "Open Food Facts", stat: "1M+ products", desc: "Eco-scores, ingredients, and nutrition data from the world's largest open food database." },
              { name: "Verified brand flags", stat: "35+ flags", desc: "Manually sourced labour & ethics flags with full citations and regular updates." },
              { name: "Eco-Score (EU)", stat: "LCA analysis", desc: "Lifecycle carbon analysis powered by the Agribalyse database for accurate footprints." },
              { name: "Nutri-Score", stat: "A-E grades", desc: "Official EU nutritional quality grading system for transparent health ratings." },
            ].map((source, i) => (
              <motion.div
                key={i}
                className="glass-card rounded-2xl p-6 flex gap-5 group hover:border-green-500/15 transition-all duration-500"
                variants={fadeUp}
                custom={i * 0.1}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
              >
                <div className="w-12 h-12 min-w-[3rem] rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 7V4a2 2 0 012-2h8.5L20 7.5V20a2 2 0 01-2 2H6a2 2 0 01-2-2v-3" />
                    <path d="M14 2v6h6" />
                    <path d="M3 15h6M6 12v6" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold">{source.name}</h3>
                    <span className="text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10">{source.stat}</span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">{source.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Features ───────────────────────────────────────────── */}
      <Section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <span className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Power features</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Built for conscious shoppers</h2>
            <p className="text-white/40 max-w-lg mx-auto">Tools that empower you to align purchases with your values.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Greener Swaps",
                desc: "We suggest lower-impact alternatives in the same category, so you can always find a better option.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                ),
                color: "#22c55e",
              },
              {
                title: "Personalised scoring",
                desc: "Set your values (environment, labour, nutrition, animal welfare) and every score is weighted just for you.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                ),
                color: "#3b82f6",
              },
              {
                title: "Dispute & transparency",
                desc: "Every flag has a citation. Disagree? Report it and we review within 14 days. Full transparency, always.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                color: "#a855f7",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="glass-card rounded-2xl p-8 group hover:border-white/10 transition-all duration-500 relative overflow-hidden"
                variants={fadeUp}
                custom={i * 0.15}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ backgroundColor: `${feature.color}08` }} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-500"
                  style={{ backgroundColor: `${feature.color}12`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <Section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 glass-card rounded-2xl p-10"
            variants={fadeUp} custom={0}
          >
            {[
              { value: 1, suffix: "M+", label: "Products scanned" },
              { value: 50, suffix: "K+", label: "Active users" },
              { value: 4, suffix: "", label: "Impact categories" },
              { value: 14, suffix: "-day", label: "Dispute review" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-green-400 mb-1">
                  <Counter value={stat.value} suffix={stat.suffix} delay={i * 0.15} />
                </p>
                <p className="text-white/30 text-xs uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <Section id="download" className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} custom={0}>
            <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </div>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-black text-white mb-4"
            variants={fadeUp} custom={0.1}
          >
            Start scanning{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">today</span>
          </motion.h2>

          <motion.p
            className="text-white/40 text-lg max-w-md mx-auto mb-10"
            variants={fadeUp} custom={0.2}
          >
            Join thousands making informed choices. Free to download, free to use, forever.
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-4" variants={fadeUp} custom={0.3}>
            {/* App Store button */}
            <a href="#" className="group flex items-center gap-3 px-6 py-3.5 bg-white text-black rounded-2xl hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/10">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div className="text-left">
                <p className="text-[10px] leading-none opacity-60">Download on the</p>
                <p className="text-sm font-bold leading-tight">App Store</p>
              </div>
            </a>

            {/* Google Play button */}
            <a href="#" className="group flex items-center gap-3 px-6 py-3.5 bg-white text-black rounded-2xl hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/10">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.651 1.535a1 1 0 010 1.73l-2.651 1.535-2.537-2.537 2.537-2.263zM5.864 3.458L16.8 9.791l-2.302 2.302-8.634-8.635z"/></svg>
              <div className="text-left">
                <p className="text-[10px] leading-none opacity-60">Get it on</p>
                <p className="text-sm font-bold leading-tight">Google Play</p>
              </div>
            </a>
          </motion.div>
        </div>
      </Section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white/70">GoodScan</span>
          </div>
          <div className="flex items-center gap-6 text-white/30 text-xs">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Methodology</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
          <p className="text-white/20 text-xs">&copy; 2026 GoodScan. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
