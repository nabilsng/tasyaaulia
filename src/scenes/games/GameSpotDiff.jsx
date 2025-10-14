import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Undo2, ChevronRight, X } from "lucide-react";

/* ====== BASE-PATH HELPER (GH Pages) ====== */
const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
const withBase = (p) =>
  typeof p === "string" && p && !/^https?:\/\//i.test(p)
    ? `${BASE}/${p.replace(/^\/+/, "")}`
    : p;

/* ====== ASSETS ====== */
const IMG_A = "/media/spotdiff/ori.jpeg";
const IMG_B = "/media/spotdiff/edit.png";

/* Titik perbedaan dalam persen (0..1) */
const POINTS = [
  { id: "monkey", x: 0.53, y: 0.22, r: 0.06 },
  { id: "toga",   x: 0.47, y: 0.38, r: 0.05 },
  { id: "shoes",  x: 0.86, y: 0.86, r: 0.06 },
];

export default function GameSpotDiff({ next, onDone }) {
  const leftRef  = useRef(null);
  const rightRef = useRef(null);

  const [found, setFound] = useState(() => POINTS.map(() => false));
  const [showCongrats, setShowCongrats] = useState(false);

  const total = POINTS.length;
  const foundCount = useMemo(() => found.filter(Boolean).length, [found]);
  const finished = foundCount === total;

  // Resolve src dengan base-path
  const srcA = useMemo(() => withBase(IMG_A), []);
  const srcB = useMemo(() => withBase(IMG_B), []);

  const reset = () => {
    setFound(POINTS.map(() => false));
    setShowCongrats(false);
  };

  // Saat semua ketemu -> tampilkan modal
  useEffect(() => {
    if (finished) setShowCongrats(true);
  }, [finished]);

  const toPct = (rect, clientX, clientY) => {
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return { x, y };
  };

  const tryMatch = (pct) => {
    setFound((prev) => {
      const nextArr = [...prev];
      for (let i = 0; i < POINTS.length; i++) {
        if (nextArr[i]) continue;
        const dx = pct.x - POINTS[i].x;
        const dy = pct.y - POINTS[i].y;
        if (Math.hypot(dx, dy) <= POINTS[i].r) {
          nextArr[i] = true;
          break;
        }
      }
      return nextArr;
    });
  };

  const handlePointing = (ref, e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    // support mouse & touch
    if (e.changedTouches?.[0]) {
      const t = e.changedTouches[0];
      tryMatch(toPct(rect, t.clientX, t.clientY));
    } else if (typeof e.clientX === "number" && typeof e.clientY === "number") {
      tryMatch(toPct(rect, e.clientX, e.clientY));
    }
  };

  /* ====== Notif variants (selaras komponen lain) ====== */
  const backdropVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };
  const cardVar = {
    hidden: { y: -14, opacity: 0, scale: 0.98, filter: "blur(8px)" },
    visible: {
      y: 0, opacity: 1, scale: 1, filter: "blur(0px)",
      transition: { type: "spring", stiffness: 280, damping: 22 },
    },
    exit: { y: -8, opacity: 0, scale: 0.98, transition: { duration: 0.22 } },
  };

  const goNext = () => {
    setShowCongrats(false);
    (onDone || next)?.();
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow ring-2 ring-white/70">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold tracking-tight">Spot the Difference</h2>
            <p className="text-sm text-zinc-500 truncate">Cari 3 perbedaan antara dua foto.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/70 px-3 py-1 text-sm shadow ring-1 ring-white/60">
            {foundCount}/{total} ditemukan
          </span>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-sm shadow ring-1 ring-white/60 hover:brightness-105"
          >
            <Undo2 className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Grid gambar responsif */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Figure
          refEl={leftRef}
          src={srcA}
          points={POINTS}
          found={found}
          onPointer={(e) => handlePointing(leftRef, e)}
        />
        <Figure
          refEl={rightRef}
          src={srcB}
          points={POINTS}
          found={found}
          onPointer={(e) => handlePointing(rightRef, e)}
        />
      </div>

      {/* Modal selesai */}
      <AnimatePresence>
        {showCongrats && (
          <motion.div
            key="finish"
            className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4"
            variants={backdropVar}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowCongrats(false)}
          >
            <motion.div
              variants={cardVar}
              className="relative w-full max-w-md rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl ring-1 ring-white/70 dark:ring-zinc-800 shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ambient glow */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 left-10 h-40 w-40 rounded-full bg-pink-300/25 blur-3xl" />
                <div className="absolute -bottom-24 right-6 h-48 w-48 rounded-full bg-fuchsia-300/25 blur-3xl" />
              </div>

              {/* header mini */}
              <div className="relative px-4 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow ring-2 ring-white/70">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">Game Selesai</div>
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400">nice &amp; neat</div>
                  </div>
                </div>
                <button
                  aria-label="Tutup"
                  onClick={() => setShowCongrats(false)}
                  className="rounded-full p-1.5 text-zinc-500 hover:bg-white/60 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* body */}
              <div className="relative px-4 pb-4 pt-3">
                <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400">
                  Game nya beres—tapi belum selesai di sini ✨
                </h3>
                <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  Masih ada something habis ini
                </p>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 px-5 py-2 text-sm text-white shadow-lg hover:brightness-105 active:scale-[0.99]"
                  >
                    Lanjut <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ===== figure ===== */
function Figure({ refEl, src, points, found, onPointer }) {
  return (
    <div
      ref={refEl}
      onClick={onPointer}
      onTouchEnd={onPointer}
      className="group relative select-none cursor-crosshair overflow-hidden rounded-2xl bg-white/60 ring-1 ring-black/5 shadow-xl backdrop-blur"
    >
      <div className="relative w-full">
        <div className="pointer-events-none block w-full pt-[125%]" />
        <img
          src={src}
          alt="Perbandingan gambar"
          draggable={false}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-300 group-hover:scale-[1.01]"
        />
      </div>

      {/* Tanda ✔ hanya saat benar (ukuran responsif) */}
      {points.map((p, i) =>
        found[i] ? (
          <motion.span
            key={p.id}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 text-white shadow-lg"
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              paddingInline: "clamp(6px, 1.2vw, 10px)",
              paddingBlock: "clamp(2px, 0.5vw, 4px)",
              fontSize: "clamp(10px, 1.8vw, 13px)",
            }}
          >
            ✔
          </motion.span>
        ) : null
      )}
    </div>
  );
}
