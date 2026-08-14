import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Short premium intro: the wordmark settles in, a gold line draws across,
 * then the whole veil lifts to reveal the page. Skipped instantly for
 * reduced-motion users. Session-scoped so it doesn't replay on every
 * client-side navigation back to "/".
 */
export default function LoadingScreen() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("celebro_intro_seen") !== "1";
  });

  useEffect(() => {
    if (!show) return;
    if (reduce) {
      setShow(false);
      return;
    }
    sessionStorage.setItem("celebro_intro_seen", "1");
    const t = setTimeout(() => setShow(false), 1700);
    return () => clearTimeout(t);
  }, [show, reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FCFAFF] pointer-events-none"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >

          <motion.img
            src="/images/celebro_logo.png"
            alt="Celebro"
            className="h-28 w-auto object-contain"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          <motion.div
            className="mt-4 h-px bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeInOut" }}
            style={{ boxShadow: "0 0 12px rgba(139,92,246,0.5)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
