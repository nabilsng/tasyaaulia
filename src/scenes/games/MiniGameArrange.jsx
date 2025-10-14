import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Check, Lightbulb, ChevronRight, Undo2 } from "lucide-react";

/* Util */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function MiniGameArrange({ onNext, next, sentence }) {
  // Kalimat target: pisah dengan " | "
  const TARGET = useMemo(() => {
    const raw =
      sentence ||
      // ====== DEFAULT KALIMAT ======
      "Aku | ingin | sekali | menonton | konser | Taylor | Swift";
    return raw
      .split("|")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [sentence]);

  const tokensBase = useMemo(
    () => TARGET.map((text, i) => ({ id: `t${i}`, text })),
    [TARGET]
  );

  const [bank, setBank] = useState(() => shuffle(tokensBase));
  const [slots, setSlots] = useState(() => Array(tokensBase.length).fill(null)); // id/null
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(false);

  const wrapRef = useRef(null);

  /* ---------- Drag (desktop) ---------- */
  const onDragStart = (e, tid, from) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ tid, from }));
    e.dataTransfer.effectAllowed = "move";
  };
  const allowDrop = (e) => e.preventDefault();

  // Refactor: hitung perubahan sekali, lalu set state
  const placeToSlot = (slotIdx, tid, from) => {
    setSlots((prevSlots) => {
      const nextSlots = [...prevSlots];
      let nextBank = [...bank];

      // jika slot sudah terisi, kembalikan token lama ke bank (di depan)
      const current = nextSlots[slotIdx];
      if (current) {
        const backTok = tokensBase.find((t) => t.id === current);
        if (backTok) nextBank = [backTok, ...nextBank];
      }

      nextSlots[slotIdx] = tid;

      if (from === "bank") {
        nextBank = nextBank.filter((t) => t.id !== tid);
      } else if (from?.startsWith("slot:")) {
        const fromIdx = parseInt(from.split(":")[1], 10);
        if (!Number.isNaN(fromIdx)) nextSlots[fromIdx] = null;
      }

      setBank(nextBank);
      return nextSlots;
    });
  };

  const returnToBank = (tid, from) => {
    setBank((prevBank) => {
      const tok = tokensBase.find((t) => t.id === tid);
      if (!tok) return prevBank;

      const filtered = prevBank.filter((t) => t.id !== tid);
      const nextBank = [tok, ...filtered];

      if (from?.startsWith("slot:")) {
        const fromIdx = parseInt(from.split(":")[1], 10);
        if (!Number.isNaN(fromIdx)) {
          setSlots((s) => {
            const ns = [...s];
            ns[fromIdx] = null;
            return ns;
          });
        }
      }
      return nextBank;
    });
  };

  const onDropSlot = (e, slotIdx) => {
    e.preventDefault();
    try {
      const { tid, from } = JSON.parse(e.dataTransfer.getData("text/plain"));
      placeToSlot(slotIdx, tid, from);
    } catch {}
  };
  const onDropBank = (e) => {
    e.preventDefault();
    try {
      const { tid, from } = JSON.parse(e.dataTransfer.getData("text/plain"));
      returnToBank(tid, from);
    } catch {}
  };

  /* ---------- Tap (mobile) ---------- */
  const tapPlaceFromBank = (tid) => {
    const emptyIdx = slots.findIndex((s) => !s);
    if (emptyIdx !== -1) placeToSlot(emptyIdx, tid, "bank");
  };
  const tapReturnFromSlot = (slotIdx) => {
    const sid = slots[slotIdx];
    if (sid) returnToBank(sid, `slot:${slotIdx}`);
  };

  /* ---------- Check / hint / reset ---------- */
  const isComplete = slots.every(Boolean);
  const check = () => {
    setAttempts((a) => a + 1);
    const ok = slots.every((sid, i) => sid === tokensBase[i].id);
    setCorrect(ok);
    if (!ok && wrapRef.current) {
      wrapRef.current.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-4px)" },
          { transform: "translateX(4px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 180, easing: "ease-in-out" }
      );
    }
  };
  const reset = () => {
    setBank(shuffle(tokensBase));
    setSlots(Array(tokensBase.length).fill(null));
    setAttempts(0);
    setCorrect(false);
  };
  const giveHint = () => {
    const firstWrong = slots.findIndex((sid, i) => sid !== tokensBase[i].id);
    if (firstWrong === -1) return;
    const needId = tokensBase[firstWrong].id;

    const inBank = bank.find((t) => t.id === needId);
    if (inBank) placeToSlot(firstWrong, needId, "bank");
    else {
      const otherIdx = slots.findIndex((sid) => sid === needId);
      if (otherIdx >= 0) {
        setSlots((s) => {
          const ns = [...s];
          [ns[otherIdx], ns[firstWrong]] = [ns[firstWrong], ns[otherIdx]];
          return ns;
        });
      }
    }
  };

  const finish = () => (onNext || next || (() => {}))();

  return (
    <section
      className="
        mx-auto w-full
        max-w-[720px] md:max-w-4xl
        min-h-[100dvh]
        flex flex-col
        px-3 sm:px-4
        py-3 sm:py-6
        bg-gradient-to-b from-pink-50/60 to-fuchsia-50/40
      "
    >
      {/* Header sticky */}
      <div className="sticky top-0 z-10 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/50 rounded-b-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-fuchsia-400 text-white shadow ring-2 ring-white/70">
              ✍️
            </span>
            <div className="leading-tight">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-800">
                Susun Kalimat Ucapan
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500">
                Tap/drag token ke urutan yang benar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge><Undo2 className="h-4 w-4" /> {attempts}x coba</Badge>
            <button
              onClick={giveHint}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm text-zinc-700 ring-1 ring-white/70 shadow-sm hover:bg-white"
            >
              <Lightbulb className="h-4 w-4" /> Hint
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm text-zinc-700 ring-1 ring-white/70 shadow-sm hover:bg-white"
            >
              <RefreshCw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Scroll area untuk papan */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="grid gap-4 sm:gap-6">
          {/* Slots */}
          <div ref={wrapRef} className="rounded-2xl bg-white/70 p-3 sm:p-4 ring-1 ring-white/70 shadow-sm backdrop-blur">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              {slots.map((sid, i) => {
                const token = tokensBase.find((t) => t.id === sid);
                return (
                  <div
                    key={i}
                    onDragOver={allowDrop}
                    onDrop={(e) => onDropSlot(e, i)}
                    onClick={() => tapReturnFromSlot(i)}
                    className="min-h-[44px] sm:min-h-[52px] rounded-xl
                               bg-gradient-to-r from-pink-50 to-fuchsia-50
                               ring-1 ring-pink-100/70 shadow-inner
                               flex items-center justify-center
                               text-[13px] sm:text-sm text-zinc-700
                               active:scale-[0.99] transition"
                    role="button"
                    aria-label={token ? `Keluarkan token: ${token.text}` : `Slot ${i + 1}`}
                  >
                    {token ? (
                      <Token
                        text={token.text}
                        onDragStart={(e) => onDragStart(e, token.id, `slot:${i}`)}
                      />
                    ) : (
                      <span className="text-[11px] sm:text-xs text-zinc-400">
                        tap/drag ke sini
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Check */}
            <div className="mt-3 sm:mt-4 flex justify-end">
              <button
                onClick={check}
                disabled={!isComplete || correct}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 px-4 sm:px-5 py-2 text-white shadow-lg disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> Cek jawaban
              </button>
            </div>
          </div>

          {/* Bank */}
          <div
            onDragOver={allowDrop}
            onDrop={onDropBank}
            className="rounded-2xl bg-white/70 p-3 sm:p-4 ring-1 ring-white/70 shadow-sm backdrop-blur"
          >
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {bank.map((t) => (
                <Token
                  key={t.id}
                  text={t.text}
                  onDragStart={(e) => onDragStart(e, t.id, "bank")}
                  onClick={() => tapPlaceFromBank(t.id)}
                />
              ))}
              {bank.length === 0 && (
                <span className="text-[11px] sm:text-xs text-zinc-400">
                  Semua token sudah dipakai
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal sukses */}
      <AnimatePresence>
        {correct && (
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
                Yeay! Kalimatnya pas 🎀
              </h3>
              <p className="mt-2 text-sm text-zinc-700">
                Bagus—kalimatnya tersusun rapi. Lanjut ke tahap berikutnya?
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

/* Token item */
function Token({ text, onDragStart, onClick }) {
  return (
    <motion.button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="cursor-grab active:cursor-grabbing select-none rounded-full
                 bg-gradient-to-r from-pink-100 via-rose-100 to-fuchsia-100
                 px-3 py-1.5 sm:px-3.5 sm:py-2
                 text-[13px] sm:text-[15px] leading-none text-zinc-700
                 ring-1 ring-pink-200/60 shadow-sm"
      aria-label={`Token: ${text}`}
    >
      {text}
    </motion.button>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1.5 text-sm text-zinc-700 ring-1 ring-white/70 shadow-sm">
      {children}
    </span>
  );
}
