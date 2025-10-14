import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, GraduationCap, Gamepad2, X } from "lucide-react";

export default function Intro({ data, onNext, next }) {
  const r = data.recipient;

  /* ─────────────────────────────────────────────────────────
     STEP 1 + 2: Overlay judul tengah + efek ketik → fly back
  ────────────────────────────────────────────────────────── */
  const [heroOverlay, setHeroOverlay] = useState(true);   // overlay on/off
  const [typedTitle, setTypedTitle] = useState("");       // teks yang diketik
  const [typedDone, setTypedDone] = useState(false);      // flag selesai ketik
  const [reveal, setReveal] = useState(false);            // munculkan elemen lain (setelah fly)

  const fullTitle = `Selamat Wisuda,\n${r.name}!`;
  const TYPE_SPEED = 100 ; // ms per karakter
  const FLY_DURATION = 650; // durasi kira-kira animasi fly (ms)

  // Ketik judul di overlay
  useEffect(() => {
  if (!heroOverlay) return;

  setTypedTitle("");
  setTypedDone(false);

  let i = 0;
  let timeoutId;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    if (i < fullTitle.length) {
      const ch = fullTitle[i];
      if (ch !== undefined) {
        setTypedTitle(prev => prev + ch);
      }
      i += 1;
      timeoutId = setTimeout(tick, TYPE_SPEED);
    } else {
      setTypedDone(true);
    }
  };

  timeoutId = setTimeout(tick, TYPE_SPEED);

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };
}, [heroOverlay, fullTitle]);

  // Setelah selesai ketik, jeda sebentar → tutup overlay (mulai fly)
  useEffect(() => {
    if (!typedDone) return;
    const pause = setTimeout(() => setHeroOverlay(false), 260);
    return () => clearTimeout(pause);
  }, [typedDone]);

  // Setelah overlay tertutup (judul fly ke posisi final), munculkan elemen lain
  useEffect(() => {
    if (heroOverlay) {
      setReveal(false);
      return;
    }
    const id = setTimeout(() => setReveal(true), FLY_DURATION);
    return () => clearTimeout(id);
  }, [heroOverlay]);

  /* ───────────────────────────────────────────────────────── */
  const [showGamePrompt, setShowGamePrompt] = React.useState(false);

  const container = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Diamond separator (elegan baby-pink)
  const MetaSep = () => (
    <span
      aria-hidden
      className="mx-1 inline-flex h-1.5 w-1.5 rotate-45 rounded-[2px]
                 bg-gradient-to-br from-pink-400 via-rose-400 to-fuchsia-400
                 ring-[1px] ring-white/70 dark:ring-zinc-900/70"
    />
  );

  // animasi notif (mirip pre-intro)
  const backdropVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };
  const cardVar = {
    hidden: { y: -14, opacity: 0, scale: 0.98, filter: "blur(8px)" },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 280, damping: 22 },
    },
    exit: { y: -8, opacity: 0, scale: 0.98, transition: { duration: 0.22 } },
  };

  const handleNextClick = () => setShowGamePrompt(true);
  const goNext = onNext || next || (() => {});
  const proceed = () => {
    // tutup notif biar animasi rapi, lalu lanjut scene
    setShowGamePrompt(false);
    setTimeout(goNext, 120);
  };

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
      {/* Ambient premium glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-14%] top-[-10%] h-40 w-40 rounded-full bg-pink-300/20 blur-2xl md:left-[-8%] md:top-[-6%] md:h-64 md:w-64 md:blur-3xl" />
        <div className="absolute right-[-12%] top-[12%] h-44 w-44 rounded-full bg-rose-300/20 blur-2xl md:right-[-6%] md:top-[18%] md:h-80 md:w-80 md:blur-3xl" />
        <div className="absolute bottom-[-14%] left-[24%] h-40 w-40 rounded-full bg-fuchsia-300/15 blur-2xl md:bottom-[-10%] md:left-[30%] md:h-72 md:w-72 md:blur-3xl" />
      </div>

      {/* OVERLAY: Judul di tengah + typewriter. Klik overlay = skip */}
      <AnimatePresence>
        {heroOverlay && (
          <motion.div
            key="hero-overlay"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.35 }}
            onClick={() => setHeroOverlay(false)}
            className="fixed inset-0 z-[60] grid place-items-center bg-white/60 dark:bg-black/60 backdrop-blur-xl cursor-pointer"
            role="dialog"
            aria-modal="true"
            aria-label="Judul pembuka"
          >
            <div className="px-6 text-center">
              {/* layoutId SAMA dengan judul final -> shared layout fly */}
              <motion.h1
                layoutId="introTitle"
                className="whitespace-pre-line font-fancy 
                           text-[42px] sm:text-[56px] md:text-[72px]
                           leading-tight tracking-[-0.01em]
                           bg-clip-text text-transparent
                           bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400
                           drop-shadow-sm"
              >
                {typedTitle}
                <span className="animate-pulse opacity-40">|</span>
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID KONTEN */}
      <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10">
        {/* KIRI: Judul final + konten lain */}
        <div>
          {/* Badge keterangan – hanya muncul setelah reveal */}
          <motion.div
            variants={item}
            initial="hidden"
            animate={reveal ? "visible" : "hidden"}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs text-zinc-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-300"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Perayaan Wisuda</span>
          </motion.div>

          {/* Judul final: SELALU render + disembunyikan saat overlay aktif */}
          <motion.h1
            layoutId="introTitle"
            initial={false}
            animate={{ opacity: heroOverlay ? 0 : 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
              mass: 0.9,
              opacity: { duration: 0.18, delay: heroOverlay ? 0 : 0.02 },
            }}
            aria-hidden={heroOverlay}
            className="font-fancy leading-[1.08] tracking-[-0.01em]
                       text-[34px] sm:text-[40px] md:text-[68px]
                       bg-clip-text text-transparent
                       bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400
                       select-none pointer-events-none"
          >
            Selamat Wisuda,
            <br />
            {r.name}!
          </motion.h1>

          {/* KUMPULAN ELEMEN LAIN */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={reveal ? "visible" : "hidden"}
          >
            {/* Meta chips */}
            <motion.div variants={item} className="mt-3 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-[6px] md:px-3 md:py-1 rounded-full bg-white/70 dark:bg-zinc-900/40 ring-1 ring-pink-200/60 text-[12px] md:text-[13px] font-medium tracking-wide text-zinc-700 dark:text-zinc-200 shadow-sm backdrop-blur-sm">
                {r.degree}
              </span>
              <MetaSep />
              <span className="px-2.5 py-[6px] md:px-3 md:py-1 rounded-full bg-white/70 dark:bg-zinc-900/40 ring-1 ring-pink-200/60 text-[12px] md:text-[13px] font-medium tracking-wide text-zinc-700 dark:text-zinc-200 shadow-sm backdrop-blur-sm">
                {r.campus}
              </span>
              <MetaSep />
              <span className="px-2.5 py-[6px] md:px-3 md:py-1 rounded-full bg-white/70 dark:bg-zinc-900/40 ring-1 ring-pink-200/60 tabular-nums text-[12px] md:text-[13px] font-medium tracking-wide text-zinc-700 dark:text-zinc-200 shadow-sm backdrop-blur-sm">
                {r.graduationDate}
              </span>
            </motion.div>

            <motion.p
              variants={item}
              className="mt-4 md:mt-6 max-w-xl text-[13.5px] leading-[1.6] text-zinc-700 dark:text-zinc-200 md:text-base"
            >
              Selamat wisuda, Tas! Maaf ya telat seminggu, haha. So proud of you!! Sekarang
              waktunya jalani dengan santai dulu life after graduate nya wkwk, tetap classy ya ✨
            </motion.p>

            <motion.div variants={item} className="mt-6 md:mt-8">
              <button
                onClick={handleNextClick}
                aria-label="Lanjut ke halaman berikutnya"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2
                           rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400
                           px-6 py-3 text-white shadow-lg hover:brightness-105
                           active:scale-[0.99]"
              >
                <Sparkles className="h-4 w-4" />
                Lanjut
                <ChevronRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-xs opacity-70 text-center md:text-left">
                Nikmati tiap page nya yaa…
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* KANAN: FOTO — ikut reveal setelah fly selesai */}
        <motion.div
          variants={item}
          initial="hidden"
          animate={reveal ? "visible" : "hidden"}
          className="relative [perspective:1200px]"
        >
          <motion.div
            whileHover={{ rotateX: 2, rotateY: -2, z: 8 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white/60 shadow-2xl ring-1 ring-black/5 backdrop-blur">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/30 via-transparent to-white/0" />
              <img
  src={r.avatar}           // sudah di-prefix dari GradGiftSite.jsx
  alt={r.name}
  className="w-full aspect-[4/5] md:aspect-square object-cover"
  loading="eager"
  decoding="async"
  onError={(e) => {
    // fallback aman untuk GitHub Pages
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    e.currentTarget.src = `${base}/media/tasya.jpeg`; // pilih fallback yang ada di /public
  }}
/>

            </div>
          </motion.div>

          <div className="absolute right-2 top-2 md:right-3 md:top-3">
            <span className="rounded-full bg-white/70 backdrop-blur px-2.5 py-1 text-[10px] md:text-xs text-zinc-800 ring-1 ring-white/70 shadow-sm">
              UNRI • Okt 2025
            </span>
          </div>
        </motion.div>
      </div>

      {/* PROMPT / NOTIF ala kartu – muncul setelah klik Lanjut */}
      <AnimatePresence>
        {showGamePrompt && (
          <motion.div
            key="game-gate"
            className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4"
            variants={backdropVar}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={cardVar}
              className="relative w-full max-w-md rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl ring-1 ring-white/70 dark:ring-zinc-800 shadow-2xl overflow-hidden"
            >
              {/* glow tipis */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 left-10 h-40 w-40 rounded-full bg-pink-300/25 blur-3xl" />
                <div className="absolute -bottom-24 right-6 h-48 w-48 rounded-full bg-fuchsia-300/25 blur-3xl" />
              </div>

              {/* header kecil */}
              <div className="relative px-4 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow ring-2 ring-white/70">
                    <Gamepad2 className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Mini Games
                    </div>
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      seru & singkat
                    </div>
                  </div>
                </div>
                <button
                  aria-label="Tutup"
                  onClick={() => setShowGamePrompt(false)}
                  className="rounded-full p-1.5 text-zinc-500 hover:bg-white/60 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* body */}
              <div className="relative px-4 pb-4 pt-3">
                <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400">
                  Sebelum lanjut, ngegame dulu yuk ✨
                </h3>
                <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  Cuma sebentar kok, tas. Siap?
                </p>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    onClick={proceed}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 px-5 py-2 text-sm text-white shadow-lg hover:brightness-105 active:scale-[0.99]"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    Gas main!
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
