import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpenText,
  Lock,
  KeyRound,
  MailOpen,
  X,
} from "lucide-react";

/* ================== BASE PATH HELPER (GH Pages) ================== */
const BASE = import.meta.env.BASE_URL || "/";
const withBase = (p) =>
  typeof p === "string" && p && !/^https?:\/\//i.test(p)
    ? `${BASE}${p.replace(/^\/+/, "")}`
    : p;

/* ================== CONFIG ================== */
const AVATAR_ME_RAW = "/media/avatar_nabil.png";
const AVATAR_ME = withBase(AVATAR_ME_RAW);

/* ================== DATA ================== */
const HEADER_PHOTOS_RAW = [
  "/media/journey/01.jpeg",
  "/media/journey/02.png",
  "/media/journey/03.png",
  "/media/journey/04.png",
  "/media/journey/05.png",
  "/media/journey/06.png",
  "/media/journey/07.png",
  "/media/journey/08.png",
  "/media/journey/09.png",
  "/media/journey/10.png",
];
const HEADER_PHOTOS = HEADER_PHOTOS_RAW.map(withBase);

const TIMELINE_RAW = [
  {
    key: "masuk",
    title: "Awal Perjalanan",
    subtitle: "Masuk Kuliah",
    desc:
      "Dari langkah pertama di kampus—kelas baru, teman baru, ritme baru. Semua dimulai dari sini.",
    photos: ["/media/journey/m1.jpeg", "/media/journey/m2.jpeg"],
  },
  {
    key: "sempro",
    title: "Menajamkan Arah",
    subtitle: "Seminar Proposal",
    desc:
      "Ah, Sempro! Momen di mana ide-ide mu mulai dibentuk jadi 'sesuatu'. Deg-degannya seru, kan? wkwk",
    photos: ["/media/journey/p1.jpeg"],
  },
  {
    key: "semhas",
    title: "Menguji Hasil",
    subtitle: "Seminar Hasil",
    desc:
      "Dari cuma draft ide, akhirnya di Semhas, Tasya lihat hasil nyatanya. Semua progres terbayar lunas. Keren!",
    photos: ["/media/journey/h1.png", "/media/journey/h2.png"],
  },
  {
    key: "sidang",
    title: "Puncak Perjuangan",
    subtitle: "Sidang Akhir",
    desc:
      "Siapa yang deg-degan pas Sidang Akhir? haha, ga banyak ngomong lah cuma mau bilang kaya kata-kata di acrylic itu 'Proud of you! You owned your moment.'",
    photos: ["/media/journey/s1.jpeg"],
  },
  {
    key: "wisuda",
    title: "Bab Baru",
    subtitle: "Wisuda",
    desc:
      "Dan jeng jeng jeng... Wisuda! Toga terpasang, senyum manis jadi signature look Tasya. Semua perjuangan berbuah manis pada hari itu. Sekarang tinggal siap-siap jemput masa depan yang super cerah!",
    photos: ["/media/journey/w1.jpeg", "/media/journey/w2.png"],
  },
];
const TIMELINE = TIMELINE_RAW.map((s) => ({
  ...s,
  photos: s.photos.map(withBase),
}));

/* ================== HEADER – PAGE FLIP ================== */
const flipVariants = {
  enter: { rotateY: -90, opacity: 0, filter: "blur(6px)" },
  center: {
    rotateY: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    rotateY: 90,
    opacity: 0,
    filter: "blur(6px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function HeaderFlip({ photos, interval = 3500, caption }) {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const total = photos.length;

  useEffect(() => {
    if (hover || total === 0) return;
    const id = setInterval(() => setI((p) => (p + 1) % total), interval);
    return () => clearInterval(id);
  }, [hover, total, interval]);

  const next = () => total && setI((p) => (p + 1) % total);
  const prev = () => total && setI((p) => (p - 1 + total) % total);

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-white/60 ring-1 ring-black/5 shadow-2xl backdrop-blur"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ perspective: 1200 }}
    >
      {total > 0 && (
        <motion.img
          key={i}
          variants={flipVariants}
          initial="enter"
          animate="center"
          exit="exit"
          src={photos[i]}
          alt="Album wisuda"
          loading="eager"
          decoding="async"
          className="h-[48vh] md:h-[56vh] w-full object-cover"
        />
      )}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 md:p-7 text-white drop-shadow">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[12px] backdrop-blur">
          <BookOpenText className="h-3.5 w-3.5" />
          <span>Album Wisuda</span>
        </div>
        <h3 className="mt-2 font-fancy text-2xl md:text-4xl leading-[1.1]">
          {caption ?? "Satu lembar, seribu kenangan."}
        </h3>
      </div>
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          type="button"
          onClick={prev}
          className="m-3 rounded-full bg-white/80 p-2 shadow backdrop-blur hover:brightness-105"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          type="button"
          onClick={next}
          className="m-3 rounded-full bg-white/80 p-2 shadow backdrop-blur hover:brightness-105"
          aria-label="Berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* ================== REVEAL ================== */
const reveal = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function StepCard({ step, align = "left" }) {
  const left = align === "left";
  const isSingle = step.photos.length === 1;

  return (
    <motion.div
      variants={reveal}
      viewport={{ once: true, amount: 0.3 }}
      whileInView="show"
      initial="hidden"
      className={`grid items-center gap-6 md:grid-cols-2 ${
        left ? "" : "md:[&>*:first-child]:order-2"
      }`}
    >
      <div className={`relative ${isSingle ? "flex justify-center" : ""}`}>
        <div
          className={
            isSingle ? "w-full flex justify-center" : "grid grid-cols-2 gap-3 w-full"
          }
        >
          {step.photos.map((p, idx) => (
            <motion.img
              key={idx}
              src={p}
              alt=""
              loading="lazy"
              decoding="async"
              className={
                isSingle
                  ? "mx-auto aspect-[4/5] w-[78%] max-w-[420px] rounded-2xl object-cover ring-1 ring-black/5 shadow-lg"
                  : "aspect-[4/5] w-full rounded-2xl object-cover ring-1 ring-black/5 shadow-lg"
              }
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-pink-200/20 blur-2xl" />
      </div>

      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-zinc-700 ring-1 ring-white/60 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{step.subtitle}</span>
        </div>
        <h4 className="mt-2 font-fancy text-3xl md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 leading-tight">
          {step.title}
        </h4>
        <p className="mt-3 text-zinc-700 dark:text-zinc-200 max-w-prose">{step.desc}</p>
      </div>
    </motion.div>
  );
}

/* ================== SECRET EPILOGUE ================== */
function SecretEpilogue() {
  const [hasKey, setHasKey] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [hoverLock, setHoverLock] = useState(false);

  const modalRef = useRef(null);
  const lastActiveRef = useRef(null);

  // Kunci muncul cepat: auto 3s ATAU scroll >= 50%
  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY || document.documentElement.scrollTop;
      const h = window.innerHeight || document.documentElement.clientHeight;
      const full =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const progress = (top + h) / full;
      if (progress >= 0.5) setHasKey(true);
    };
    const t = setTimeout(() => setHasKey(true), 3000);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Kunci body & fokus ke modal
  useEffect(() => {
    if (unlocked) {
      lastActiveRef.current = document.activeElement;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        modalRef.current?.focus();
        modalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 20);
      return () => {
        document.body.style.overflow = prev;
      };
    } else {
      lastActiveRef.current instanceof HTMLElement &&
        lastActiveRef.current.focus?.();
    }
  }, [unlocked]);

  const closeModal = () => setUnlocked(false);

  const onDropToLock = (e) => {
    e.preventDefault();
    setHoverLock(false);
    if (hasKey) setUnlocked(true);
  };
  const onDragOverLock = (e) => {
    e.preventDefault();
    setHoverLock(true);
  };
  const onDragLeaveLock = () => setHoverLock(false);

  const KeyBadge = (
    <motion.button
      type="button"
      aria-label="Kunci rahasia"
      draggable
      onClick={() => setUnlocked(true)}
      onTouchEnd={() => setUnlocked(true)}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-amber-950 px-3 py-1.5 shadow ring-1 ring-amber-800/20"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <KeyRound className="h-4 w-4" />
      <span className="text-sm font-medium">Kunci</span>
    </motion.button>
  );

  // Animasi surat: efek kertas terlipat (unfold)
  const PaperWrapper = ({ children }) => (
    <div
      style={{ perspective: 1200 }}
      className="relative w-full max-w-lg"
      aria-hidden="true"
    >
      <motion.div
        initial={{ rotateX: -65, scaleY: 0.6, opacity: 0 }}
        animate={{ rotateX: 0, scaleY: 1, opacity: 1 }}
        exit={{ rotateX: 10, scaleY: 0.95, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "top center" }}
        className="relative rounded-3xl bg-white/90 backdrop-blur-xl ring-1 ring-white/70 shadow-2xl overflow-hidden"
      >
        <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent" />
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent" />
        {children}
      </motion.div>
    </div>
  );

  return (
    <div className="relative mt-16 md:mt-20">
      {/* foil glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl rounded-3xl bg-white/70 backdrop-blur ring-1 ring-white/60 shadow-xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400 text-white shadow ring-2 ring-white/70">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h5 className="font-fancy text-2xl bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400">
                Segel Rahasia
              </h5>
              <p className="text-sm text-zinc-600">Buka segelnya dengan kunci emas.</p>
            </div>
          </div>
          {hasKey ? KeyBadge : <span className="text-xs text-zinc-500">Gulir dulu… ✨</span>}
        </div>

        <div className="mt-5 grid place-items-center">
          <div
            onDrop={onDropToLock}
            onDragOver={onDragOverLock}
            onDragLeave={onDragLeaveLock}
            onClick={() => hasKey && setUnlocked(true)}
            className={`relative grid place-items-center rounded-2xl p-8 md:p-10 ring-1 shadow-inner ${
              hoverLock ? "bg-amber-100/60 ring-amber-300" : "bg-white/60 ring-white/60"
            }`}
          >
            <motion.div
              animate={hoverLock ? { rotate: [-2, 2, -2, 0] } : { rotate: 0 }}
              transition={{ duration: 0.6 }}
              className="grid place-items-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 p-4 text-white shadow-lg"
            >
              <Lock className="h-7 w-7" />
            </motion.div>
            <p className="mt-3 text-sm text-zinc-600">Seret atau tap untuk membuka</p>
          </div>
        </div>
      </div>

      {/* Modal surat */}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-black/45 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PaperWrapper>
              <div
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label="Surat Kecil dari Nabil"
                onKeyDown={(e) => e.key === "Escape" && closeModal()}
                className="relative p-5 md:p-6 focus:outline-none"
              >
                {/* ambient glow */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-20 left-10 h-40 w-40 rounded-full bg-pink-300/25 blur-3xl" />
                  <div className="absolute -bottom-24 right-6 h-48 w-48 rounded-full bg-fuchsia-300/25 blur-3xl" />
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 shadow ring-2 ring-white/70">
                    <MailOpen className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <div className="font-semibold text-zinc-900">Surat Kecil dari Nabil</div>
                    <div className="text-[11px] text-zinc-600">private & warm</div>
                  </div>
                </div>

                <div className="text-zinc-800 leading-relaxed">
                  <p>Hi Tas,</p>
                  <p className="mt-3">
                    Congrats yaa uda officially S.Ak, Semoga gelar nya jadi jalan buat lebih sukses dan berkah kedepannya, Aamiin. Kalo lulus, jangan lupa kabarin!!
                  </p>
                  <p className="mt-3">Lowkey scared to lose u, you're rare and fineshyt fr. 😤</p>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 ring-1 ring-black/5 shadow">
                    <img
                      src={AVATAR_ME}
                      alt="Nabil"
                      className="h-6 w-6 rounded-full object-cover"
                      loading="eager"
                      decoding="async"
                    />
                    <span className="text-sm text-zinc-700">Nabil</span>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 px-5 py-2 text-white shadow-lg hover:brightness-105 active:scale-[0.99]"
                  >
                    Tutup
                  </button>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-3 top-3 rounded-full bg-white/70 p-1.5 text-zinc-600 shadow hover:brightness-105"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </PaperWrapper>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================== PAGE ================== */
export default function WisudaJourney() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-6%] h-64 w-64 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute right-[-6%] top-[18%] h-72 w-72 rounded-full bg-rose-300/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[30%] h-72 w-72 rounded-full bg-fuchsia-300/15 blur-3xl" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <HeaderFlip photos={HEADER_PHOTOS} />
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
          className="flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs text-zinc-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-300 w-max">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Kisah di balik toga</span>
          </div>
          <h2 className="mt-3 font-fancy text-[40px] md:text-[56px] leading-[1.06] tracking-[-0.01em] bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400">
            Perjalanan Wisuda
          </h2>
          <p className="mt-3 max-w-prose text-zinc-700 dark:text-zinc-200">
            Flashback dikit perjalanan wisuda mu, Tas? Dari deg-degan pas awal masuk, sampai akhirnya toga terpasang rapi. Rasanya baru kemarin, ya? Sekarang tinggal senyum-senyum sendiri mengingat semua cerita lucunya.
          </p>
        </motion.div>
      </div>

      <div className="mt-12 space-y-12 md:space-y-16">
        {TIMELINE.map((s, idx) => (
          <StepCard key={s.key} step={s} align={idx % 2 === 0 ? "left" : "right"} />
        ))}
      </div>

      <SecretEpilogue />
    </section>
  );
}
