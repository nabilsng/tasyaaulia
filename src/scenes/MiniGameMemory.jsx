import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RefreshCw, TimerReset } from "lucide-react";

/* ========= CONFIG ========= */
const DEFAULT_PAIRS = 3;
const STORAGE_KEY = "miniMemory_best";

/* ========= HELPERS ========= */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Buat URL absolut tanpa mendobel BASE_URL.
// - Jika path sudah diawali BASE_URL (mis. "/gradgift/..."), JANGAN tambah base lagi.
// - Jika belum, tambahkan BASE_URL agar jalan di GitHub Pages.
const toAbsPublicUrl = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;

  const origin = window.location.origin;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, ""); // "" atau "/gradgift"
  const path = p.startsWith("/") ? p : `/${p}`;
  const needsBase = base && !path.startsWith(`${base}/`);

  return `${origin}${needsBase ? base : ""}${path}`;
};

/* ========= COMPONENT ========= */
export default function MiniGameMemory({
  data,
  next,
  onNext,
  pairs = DEFAULT_PAIRS,
  forceEmoji = false,
  fallbackImages,
}) {
  // Gambar dari props.data → absolut
  const configuredAbs = useMemo(() => {
    const arr = Array.isArray(data?.media?.memoryImages)
      ? data.media.memoryImages
      : [];
    return arr.map(toAbsPublicUrl);
  }, [data]);

  // Fallback internal (absolut)
  const internalFallbackAbs = useMemo(
    () => [
      toAbsPublicUrl("/media/memory/monyetcantik1.jpeg"),
      toAbsPublicUrl("/media/memory/monyetcantik2.jpeg"),
      toAbsPublicUrl("/media/memory/monyetcantik3.jpeg"),
    ],
    []
  );

  const prefersReducedMotion = useReducedMotion();

  // Sumber final (tanpa preload/validasi — langsung dipakai)
  const sources = useMemo(() => {
    if (forceEmoji) return [];
    const fb = Array.isArray(fallbackImages)
      ? fallbackImages.map(toAbsPublicUrl)
      : [];
    const primary =
      configuredAbs.length > 0
        ? configuredAbs
        : fb.length > 0
        ? fb
        : internalFallbackAbs;

    if (primary.length >= pairs) return primary.slice(0, pairs);
    if (primary.length > 0)
      return Array.from({ length: pairs }, (_, i) => primary[i % primary.length]);
    return [];
  }, [configuredAbs, fallbackImages, internalFallbackAbs, pairs, forceEmoji]);

  const useEmoji = forceEmoji || sources.length === 0;

  const makeDeck = (srcs) => {
    const base = useEmoji ? ["🌸", "🎓", "💫"].slice(0, pairs) : srcs.slice(0, pairs);
    const doubled = shuffle([...base, ...base]);
    return doubled.map((src, i) => ({
      id: `${String(src)}-${i}`,
      src,
      flipped: false,
      matched: false,
    }));
  };

  const [deck, setDeck] = useState([]);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [secs, setSecs] = useState(0);
  const [lock, setLock] = useState(false);
  const [best, setBest] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  });

  // Build deck SETIAP kali sources berubah
  useEffect(() => {
    setDeck(makeDeck(sources));
    setSelected([]);
    setMoves(0);
    setSecs(0);
    setLock(false);
  }, [sources]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const onFlip = (idx) => {
    if (lock || !deck.length) return;
    if (deck[idx].flipped || deck[idx].matched) return;

    const nd = deck.slice();
    nd[idx] = { ...nd[idx], flipped: true };
    setDeck(nd);

    const ns = [...selected, idx];
    if (ns.length === 2) {
      setLock(true);
      setMoves((m) => m + 1);
      const [a, b] = ns;
      const same = nd[a].src === nd[b].src;

      setTimeout(() => {
        const nd2 = nd.slice();
        if (same) {
          nd2[a].matched = true;
          nd2[b].matched = true;
        } else {
          nd2[a].flipped = false;
          nd2[b].flipped = false;
        }
        setDeck(nd2);
        setSelected([]);
        setLock(false);
      }, prefersReducedMotion ? 300 : 650);
    } else {
      setSelected(ns);
    }
  };

  const allMatched = deck.length > 0 && deck.every((c) => c.matched);

  useEffect(() => {
    if (!allMatched) return;
    setBest((prev) => {
      const nextBest =
        !prev || moves < prev.moves || (moves === prev.moves && secs < prev.secs)
          ? { moves, secs }
          : prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBest));
      } catch {}
      return nextBest;
    });
    const id = setTimeout(
      () => (onNext || next || (() => {}))(),
      prefersReducedMotion ? 500 : 900
    );
    return () => clearTimeout(id);
  }, [allMatched, moves, secs, next, onNext, prefersReducedMotion]);

  const reset = () => {
    setDeck(makeDeck(sources));
    setSelected([]);
    setMoves(0);
    setSecs(0);
    setLock(false);
  };

  return (
    <section className="mx-auto w-full max-w-[480px] px-3 py-6 sm:max-w-2xl sm:px-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow ring-2 ring-white/70 sm:h-9 sm:w-9">
            ✨
          </span>
          <div>
            <h2 className="text-base font-semibold text-zinc-800 sm:text-lg">Memory Lane</h2>
            <p className="text-[12px] text-zinc-500 sm:text-sm">
              Temukan semua pasangan {useEmoji ? "ikon" : "foto"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {best && (
            <div className="rounded-full bg-white/70 backdrop-blur px-2.5 py-1 text-[12px] text-zinc-700 ring-1 ring-white/70 shadow-sm sm:text-sm sm:px-3">
              🏁 Best: {best.moves} langkah • {best.secs}s
            </div>
          )}
          <div className="rounded-full bg-white/70 backdrop-blur px-2.5 py-1 text-[12px] text-zinc-700 ring-1 ring-white/70 shadow-sm sm:text-sm sm:px-3">
            ⏱ {secs}s
          </div>
          <div className="rounded-full bg-white/70 backdrop-blur px-2.5 py-1 text-[12px] text-zinc-700 ring-1 ring-white/70 shadow-sm sm:text-sm sm:px-3">
            • {moves} langkah
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[12px] text-zinc-700 ring-1 ring-white/70 shadow-sm hover:bg-white sm:gap-2 sm:px-3 sm:text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Reset
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
        {deck.map((card, idx) => (
          <Card
            key={card.id}
            data={card}
            onClick={() => onFlip(idx)}
            useEmoji={useEmoji}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>

      <AnimatePresence>
        {allMatched && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[12px] text-zinc-700 ring-1 ring-white/70 shadow sm:mt-6 sm:px-4 sm:py-2 sm:text-sm"
          >
            <TimerReset className="h-4 w-4" />
            Selesai! {secs}s • {moves} langkah
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Card({ data, onClick, useEmoji, prefersReducedMotion }) {
  const { flipped, matched, src } = data;
  const show = flipped || matched;

  return (
    <motion.button
      onClick={onClick}
      disabled={matched}
      whileTap={{ scale: 0.98 }}
      className="relative w-full overflow-hidden rounded-2xl bg-white/70 ring-1 ring-black/5 shadow-lg backdrop-blur aspect-square sm:aspect-[3/4] will-change-transform"
    >
      <motion.div
        className="h-full w-full [transform-style:preserve-3d]"
        initial={false}
        animate={
          prefersReducedMotion
            ? { rotateY: 0, opacity: show ? 1 : 0 }
            : { rotateY: show ? 0 : 180 }
        }
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.35 }}
      >
        {/* FRONT */}
        <div className="absolute inset-0 grid place-items-center [backface-visibility:hidden]">
          {useEmoji ? (
            <span className="text-4xl sm:text-5xl">{src}</span>
          ) : (
            <img
              src={src}
              alt="Memori"
              className="h-full w-full object-cover"
              draggable={false}
              loading="eager"
              decoding="async"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/0" />
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 grid place-items-center rounded-2xl [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-full w-full rounded-2xl bg-gradient-to-br from-pink-100 via-rose-100 to-fuchsia-100" />
          <span className="pointer-events-none absolute text-xl sm:text-2xl">🎀</span>
        </div>
      </motion.div>

      {matched && (
        <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-white sm:right-2 sm:top-2 sm:px-2 sm:text-[11px]">
          ✓
        </span>
      )}
    </motion.button>
  );
}

