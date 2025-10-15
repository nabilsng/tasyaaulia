import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SceneRouter from "./SceneRouter.jsx";
import Intro from "./scenes/Intro.jsx";
import MiniGameMemory from "./scenes/MiniGameMemory.jsx";
import MiniGameCatch from "./scenes/games/MiniGameCatch.jsx";
import MiniGameArrange from "./scenes/games/MiniGameArrange.jsx";
import GameSpotDiff from "./scenes/games/GameSpotDiff.jsx";
import WisudaJourney from "./scenes/WisudaJourney.jsx";
import PortfolioGift from "./scenes/PortfolioGift.jsx";

/* ---------- HELPER: prefix base path (GitHub Pages) ---------- */
const BASE = import.meta.env.BASE_URL || "/";
const withBase = (p) =>
  typeof p === "string" && p && !/^https?:\/\//i.test(p)
    ? `${BASE}${p.replace(/^\/+/, "")}`
    : p;

/* DATA (original) */
const DATA = {
  recipient: {
    name: "Tasya Aulia",
    nickname: "Tas",
    degree: "Sarjana Akuntansi",
    campus: "Universitas Negeri Riau",
    graduationDate: "Oktober 2025",
    avatar: "/media/tasya.jpeg",
  },
  theme: { primary: "from-pink-400 via-rose-400 to-fuchsia-400" },
  media: {
    songUrl: "/media/romance/enchanted.mp3",
    memoryImages: [
      "/media/memory/monyetcantik1.jpeg",
      "/media/memory/monyetcantik2.jpeg",
      "/media/memory/monyetcantik3.jpeg",
    ],
  },
  portfolio: [
    {
      title: "Moodie — App Tracking Mood",
      desc:
        "Aplikasi mini dengan React + Firebase untuk melacak mood harian.",
      link: "https://example.com/moodie",
      tech: ["React", "Firebase", "Tailwind"],
    },
    {
      title: "UI Kit Kampus",
      desc: "Set komponen UI reusable untuk tim internal UKM.",
      link: "https://example.com/uikit",
      tech: ["Figma", "Design System"],
    },
    {
      title: "Dashboard Skripsi",
      desc: "Visualisasi data penelitian dengan chart interaktif.",
      link: "https://example.com/dashboard",
      tech: ["Python", "Plotly", "Pandas"],
    },
  ],
  message: {
    headline: "Selamat wisuda, kamu hebat banget! 💐",
    body:
      "Bangga banget liat kamu sampai di titik ini. Semua begadang, revisi, dan perjuangan kamu berbuah manis.",
    ps: "PS: Coba klik ikon bintang 3x 😉",
  },
};

/* pengirim (kamu) */
const SENDER = {
  name: "Nabil",
  avatar: "/media/avatar_nabil.png", // kosongkan jika ingin inisial
};

function Avatar({ name = "", src = "" }) {
  if (src) {
    return (
      <span className="inline-block h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/70 shadow-sm">
        <img src={src} alt={name} className="h-full w-full object-cover" />
      </span>
    );
  }
  const initial = (name.trim()[0] || "?").toUpperCase();
  return (
    <span className="inline-grid place-items-center h-9 w-9 rounded-full
                     bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600
                     text-white font-semibold ring-2 ring-white/70 shadow-sm">
      {initial}
    </span>
  );
}

/* Backdrop: halus & elegan */
const backdropVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
};

/* Card: notif feel – slide-down + micro-overshoot + blur→crisp */
const cardVar = {
  hidden: { y: -24, opacity: 0, scale: 0.985, filter: "blur(6px)" },
  visible: {
    y: [-24, 6, 0],
    scale: [0.985, 1.005, 1],
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.62,
      times: [0, 0.65, 1],
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: { y: -14, opacity: 0, scale: 0.99, transition: { duration: 0.22 } },
};

/* Stagger isi kartu */
const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const itemVar = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function GradGiftSite() {
  const audioRef = useRef(null);
  const [gateOpen, setGateOpen] = useState(true);

  // --- Resolve semua path relatif dengan BASE (untuk GH Pages) ---
  const DATA_RESOLVED = React.useMemo(() => {
    return {
      ...DATA,
      recipient: {
        ...DATA.recipient,
        avatar: withBase(DATA.recipient.avatar),
      },
      media: {
        ...DATA.media,
        songUrl: withBase(DATA.media.songUrl),
        memoryImages: (DATA.media.memoryImages || []).map(withBase),
      },
      // portfolio.link dibiarkan (eksternal)
    };
  }, []);

  const displayName =
    (DATA_RESOLVED.recipient.nickname || DATA_RESOLVED.recipient.name || "").split(" ")[0];

  // play audio saat user tap "Buka" (fade-in volume)
  const startAudio = async () => {
    const a = audioRef.current;
    if (!a) return;
    const fadeIn = (target = 0.65, step = 0.05, every = 120) => {
      const id = setInterval(() => {
        a.volume = Math.min(target, (a.volume || 0) + step);
        if (a.volume >= target) clearInterval(id);
      }, every);
    };
    try {
      if (a.readyState < 2) a.load();
      a.muted = false;
      a.volume = 0.0;
      await a.play();
      fadeIn();
    } catch (e) {
      console.warn("Play gagal:", e);
    }
  };

  const handleBegin = async () => {
    await startAudio();
    setGateOpen(false);
  };

  const SCENES = [
    { key: "intro",    component: (p) => <Intro {...p} data={DATA_RESOLVED} />, options: { hideChrome: true } },
    { key: "memory",   component: (p) => <MiniGameMemory {...p} data={DATA_RESOLVED} /> },
    { key: "catch",    component: (p) => <MiniGameCatch {...p} data={DATA_RESOLVED} /> },
    { key: "arrange",  component: (p) => <MiniGameArrange {...p} data={DATA_RESOLVED} /> },
    { key: "spotdiff", component: (p) => <GameSpotDiff {...p} data={DATA_RESOLVED} /> },
    { key: "journey",  component: (p) => <WisudaJourney {...p} data={DATA_RESOLVED} />, options: { hideChrome: true } },
    { key: "portfolio", component: (p) => <PortfolioGift {...p} data={DATA_RESOLVED} /> },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br
               from-pink-50 via-rose-50 to-fuchsia-50
               dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900
               text-zinc-800 dark:text-zinc-100"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* audio tanpa kontrol */}
      <audio
        ref={audioRef}
        src={DATA_RESOLVED.media.songUrl}
        preload="auto"
        playsInline
        loop
      />

      {/* Overlay center */}
      <AnimatePresence>
        {gateOpen && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[70] grid place-items-center
                       bg-white/70 dark:bg-black/60 backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            variants={backdropVar}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* ambient glow lembut */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              <div className="absolute -top-16 left-1/4 h-72 w-72 rounded-full bg-rose-400/20 blur-3xl" />
              <div className="absolute -bottom-16 right-1/5 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
            </motion.div>

            <motion.div
              key="card"
              variants={cardVar}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-[92%] max-w-md"
            >
              <motion.div
                variants={cardStagger}
                onClick={handleBegin}
                className="relative rounded-2xl bg-white/70 dark:bg-zinc-900/60
                           backdrop-blur-md ring-1 ring-white/60 dark:ring-white/10
                           shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] overflow-hidden cursor-pointer"
              >
                {/* header */}
                <motion.div variants={itemVar} className="flex items-center gap-3 px-4 pt-4">
                  <Avatar name={SENDER.name} src={withBase(SENDER.avatar)} />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-semibold tracking-tight">{SENDER.name}</h3>
                      <span className="h-1 w-1 rounded-full bg-zinc-400/70" />
                      <span className="text-xs text-zinc-500/80">baru saja</span>
                    </div>
                    <p className="text-xs text-zinc-500/90">🎓 Wisuda Gift</p>
                  </div>
                </motion.div>

                {/* body */}
                <motion.div variants={itemVar} className="px-4 pb-4 pt-3">
                  <h4 className="text-lg font-bold bg-clip-text text-transparent
                                 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-600">
                    Selamat datang, {displayName}!
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    Ini hadiah kecil dari aku. Semoga suka yaa
                  </p>

                  <motion.div variants={itemVar} className="mt-4 flex justify-end">
                    <button
                      onClick={handleBegin}
                      className="inline-flex items-center gap-2 rounded-full
                                  bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400
                                  text-white px-5 py-2 text-sm shadow-lg hover:brightness-105
                                  active:scale-[0.99] transition"
                    >
                      Buka
                    </button>
                  </motion.div>
                </motion.div>

                <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />
              </motion.div>

              <motion.p
                variants={itemVar}
                className="mt-3 text-center text-[11px] text-zinc-500/80"
              >
                Ketuk untuk membuka.
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* scene container */}
      <SceneRouter scenes={SCENES} initial={0} />
    </motion.div>
  );
}
