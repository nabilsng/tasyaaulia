import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

const transition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

// === THEME (bisa diedit kalau perlu) ===
const THEME_GRADIENT = "from-pink-400 via-rose-400 to-fuchsia-400";
const ACCENT_SOLID   = "bg-rose-500"; // untuk dot aktif, fokus ring, dsb.

// Variants untuk slide
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    filter: "blur(4px)",
  }),
};

export default function SceneRouter({ scenes, initial = 0, onLastReached }) {
  const [index, setIndex] = useState(initial);
  const [direction, setDirection] = useState(1);
  const [cooldown, setCooldown] = useState(false);

  const total = scenes.length;
  const Current = scenes[index].component;
  const opts = scenes[index].options || {}; // hideChrome dll.

  useEffect(() => {
    if (opts.hideChrome) return;
    const onKey = (e) => {
      if (cooldown) return;
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cooldown, opts.hideChrome]);

  const armCooldown = () => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), 500);
  };

  const next = () => {
    if (cooldown) return;
    armCooldown();
    setDirection(1);
    setIndex((i) => {
      const n = Math.min(i + 1, total - 1);
      if (n === total - 1 && onLastReached) onLastReached();
      return n;
    });
  };

  const prev = () => {
    if (cooldown) return;
    armCooldown();
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const dots = Array.from({ length: total });

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="min-h-[100dvh] flex"
        >
          <Current next={next} prev={prev} index={index} total={total} />
        </motion.div>
      </AnimatePresence>

      {/* Controls & Progress */}
      {!opts.hideChrome && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 flex items-center justify-between px-4 md:px-6">
          {/* BACK */}
          <button
            onClick={prev}
            disabled={index === 0}
            className={[
              "pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-lg backdrop-blur",
              "bg-gradient-to-r", THEME_GRADIENT,
              "hover:brightness-105 active:scale-[0.99]",
              "focus:outline-none focus:ring-2 focus:ring-offset-2", ACCENT_SOLID, "focus:ring-offset-white/60",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* DOTS */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {dots.map((_, i) => {
              const active = i === index;
              return (
                <div
                  key={i}
                  className={[
                    "h-2 rounded-full transition-all",
                    active ? `w-6 bg-gradient-to-r ${THEME_GRADIENT} shadow ring-1 ring-white/60` : "w-2 bg-zinc-300 dark:bg-zinc-600",
                  ].join(" ")}
                />
              );
            })}
          </div>

          {/* NEXT */}
          <button
            onClick={next}
            disabled={index === total - 1}
            className={[
              "pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white shadow-lg backdrop-blur",
              "bg-gradient-to-r", THEME_GRADIENT,
              "hover:brightness-105 active:scale-[0.99]",
              "focus:outline-none focus:ring-2 focus:ring-offset-2", ACCENT_SOLID, "focus:ring-offset-white/60",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
