import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

const transition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

// Variants untuk slide elegan
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
  const opts = scenes[index].options || {}; // <-- opsi per scene

  // keyboard: ←/→/Space (dimatikan jika hideChrome)
  useEffect(() => {
    if (opts.hideChrome) return; // jangan pasang listener jika disembunyikan
    const onKey = (e) => {
      if (cooldown) return;
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooldown, opts.hideChrome]);

  // cooldown kecil agar transisi tidak dobel
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

  // progress dots
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
          {/* teruskan API navigasi ke scene */}
          <Current next={next} prev={prev} index={index} total={total} />
        </motion.div>
      </AnimatePresence>

      {/* Controls & Progress — sembunyikan jika options.hideChrome === true */}
      {!opts.hideChrome && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 flex items-center justify-between px-4 md:px-6">
          <button
            onClick={prev}
            disabled={index === 0}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-zinc-800/70 shadow px-4 py-2 text-sm backdrop-blur disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {/* Dots */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex gap-2">
            {dots.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === index ? "bg-rose-500 w-6" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={index === total - 1}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-zinc-800/70 shadow px-4 py-2 text-sm backdrop-blur disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
