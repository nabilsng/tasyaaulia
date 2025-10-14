import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Timer, Trophy, RefreshCw, ChevronRight } from "lucide-react";

/** Util kecil */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const now = () => performance.now();

/** SVG mortarboard dengan gradient-id unik */
const Mortarboard = ({ className }) => {
  const gid1 = useId();
  const gid2 = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M2 24l30-12 30 12-30 12z" fill={`url(#g1-${gid1})`} />
      <path d="M32 36L56 26v12c0 6-12 12-24 12S8 44 8 38V26l24 10z" fill={`url(#g2-${gid2})`} />
      <path d="M58 26v16" stroke="#cf5fa8" strokeWidth="3" strokeLinecap="round" />
      <circle cx="58" cy="46" r="3.2" fill="#cf5fa8" />
      <defs>
        <linearGradient id={`g1-${gid1}`} x1="0" x2="1">
          <stop offset="0" stopColor="#f9a8d4" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id={`g2-${gid2}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fde2f2" />
          <stop offset="1" stopColor="#f5d0fe" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/**
 * MiniGameCatch – tangkap mortarboard 🎓
 * Props: onNext / next untuk lanjut.
 */
export default function MiniGameCatch({ onNext, next }) {
  // ukuran arena
  const wrapRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // state game
  const GAME_TIME = 30; // detik
  const [time, setTime] = useState(GAME_TIME);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(true);

  // catcher (player) – posisi X dalam piksel (tengah)
  const [cx, setCx] = useState(0);
  const catcherW = useMemo(() => (box.w < 520 ? 90 : 120), [box.w]);
  const catcherY = useMemo(() => (box.h ? box.h - 26 : 0), [box.h]);

  // item jatuh
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  // ukuran + spawn
  useEffect(() => {
    const onResize = () => {
      const r = wrapRef.current?.getBoundingClientRect();
      if (r) {
        setBox({ w: r.width, h: r.height });
        setCx(r.width / 2);
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // kontrol: mouse/touch
  const moveToClientX = (clientX) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp(clientX - rect.left, 0, rect.width);
    setCx(x);
  };
  const onMouseMove = (e) => moveToClientX(e.clientX);
  const onTouchMove = (e) => {
    const t = e.touches[0];
    if (t) moveToClientX(t.clientX);
  };

  // kontrol: keyboard
  useEffect(() => {
    const step = () => (box.w < 520 ? 24 : 40);
    const onKey = (e) => {
      if (!running || !box.w) return;
      if (e.key === "ArrowLeft") setCx((x) => clamp(x - step(), 0, box.w));
      if (e.key === "ArrowRight") setCx((x) => clamp(x + step(), 0, box.w));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, box.w]);

  // spawn loop
  useEffect(() => {
    if (!running || !box.w || !box.h) return;
    let cancelled = false;
    let lastSpawn = now();
    const loop = () => {
      if (cancelled) return;
      const t = now();
      const interval = box.w < 520 ? 650 : 520; // makin lebar, makin cepat spawn
      if (t - lastSpawn > interval) {
        lastSpawn = t;
        setItems((prev) => [
          ...prev,
          {
            id: idRef.current++,
            x: rnd(40, box.w - 40), // pixel
            y: -40,
            size: box.w < 520 ? 38 : 46,
            vy: rnd(160, 240), // px/s
          },
        ]);
      }
      requestAnimationFrame(loop);
    };
    const r = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(r);
    };
  }, [running, box.w, box.h]);

  // physics loop
  useEffect(() => {
    if (!running) return;
    let live = true;
    let last = now();
    const step = () => {
      if (!live) return;
      const t = now();
      const dt = (t - last) / 1000;
      last = t;

      // waktu
      setTime((s) => (s > 0 ? Math.max(0, +(s - dt).toFixed(2)) : 0));

      // update items
      setItems((prev) => {
        const nextArr = [];
        let miss = 0;
        for (const it of prev) {
          const ny = it.y + it.vy * dt;
          const cxHalf = catcherW / 2;
          const itHalf = it.size / 2;

          // collision (cek ketika item melewati garis catcher)
          const hitY = ny + itHalf >= catcherY - 8;
          const hitX = Math.abs(it.x - cx) <= cxHalf + itHalf * 0.3; // toleransi kecil

          if (hitY && hitX) {
            setScore((s) => s + 1);
            continue; // tertangkap → jangan dipush lagi
          }

          // jatuh ke bawah (miss)
          if (ny - itHalf > box.h) {
            miss++;
            continue;
          }

          nextArr.push({ ...it, y: ny });
        }
        if (miss > 0) setLives((l) => Math.max(0, l - miss));
        return nextArr;
      });

      requestAnimationFrame(step);
    };
    const r = requestAnimationFrame(step);
    return () => {
      live = false;
      cancelAnimationFrame(r);
    };
  }, [running, box.h, catcherY, cx, catcherW]);

  // game over kondisi
  useEffect(() => {
    if (!running) return;
    if (time <= 0 || lives <= 0) setRunning(false);
  }, [time, lives, running]);

  // reset
  const reset = () => {
    setScore(0);
    setLives(3);
    setTime(GAME_TIME);
    setItems([]);
    setRunning(true);
  };

  const finish = () => (onNext || next || (() => {}))();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow ring-2 ring-white/70">
            🎓
          </span>
          <div>
            <h2 className="text-lg font-semibold text-zinc-800">Catch The Toga</h2>
            <p className="text-sm text-zinc-500">Geser untuk menangkap topi toga</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge><Timer className="h-4 w-4" /> {Math.ceil(time)}s</Badge>
          <Badge><Trophy className="h-4 w-4" /> {score}</Badge>
          <Badge><Heart className="h-4 w-4" /> {lives}</Badge>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-sm text-zinc-700 ring-1 ring-white/70 shadow-sm hover:bg-white"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Arena */}
      <div
        ref={wrapRef}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        className="relative h-[56vh] min-h-[380px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-pink-50 via-rose-50 to-fuchsia-50 ring-1 ring-black/5 shadow-inner"
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute -top-10 left-10 h-40 w-40 rounded-full bg-pink-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-2xl" />

        {/* items */}
        {items.map((it) => (
          <motion.div
            key={it.id}
            className="absolute"
            style={{
              left: it.x - it.size / 2,
              top: it.y - it.size / 2,
              width: it.size,
              height: it.size,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Mortarboard className="h-full w-full drop-shadow" />
          </motion.div>
        ))}

        {/* catcher */}
        <div
          className="absolute bottom-2 -translate-x-1/2 rounded-[18px] bg-white/80 px-4 py-2 shadow-lg ring-1 ring-white/70 backdrop-blur"
          style={{
            left: clamp(cx, catcherW * 0.5, Math.max(catcherW * 0.5, box.w - catcherW * 0.5)),
            width: catcherW,
          }}
        >
          <div className="pointer-events-none select-none text-center text-sm font-medium text-zinc-700">
            🎀 Catcher
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {!running && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 14, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full max-w-md rounded-2xl bg-white/80 p-5 backdrop-blur-xl ring-1 ring-white/70 shadow-2xl"
            >
              <h3 className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-lg font-bold text-transparent">
                Selesai!
              </h3>
              <p className="mt-1 text-sm text-zinc-700">
                Skor kamu <b>{score}</b> dalam {GAME_TIME - Math.ceil(time)} detik.
              </p>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={reset}
                  className="rounded-full bg-white/80 px-4 py-2 text-sm text-zinc-700 ring-1 ring-white/70 shadow-sm hover:bg-white"
                >
                  Main lagi
                </button>
                <button
                  onClick={finish}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 px-5 py-2 text-sm text-white shadow-lg hover:brightness-105 active:scale-[0.99]"
                >
                  Lanjut <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Badge kecil untuk header */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-sm text-zinc-700 ring-1 ring-white/70 shadow-sm">
      {children}
    </span>
  );
}
