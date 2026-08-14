import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IconMenu, IconClose } from "./icons";

const LINKS = [
  { label: "Celebrations", href: "/celebrations" },
  { label: "Experiences", href: "/experiences" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Lookbook", href: "/lookbook" },
];

export default function LandingNav() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-[#E9E4F5] py-3 shadow-[0_4px_25px_rgba(91,33,182,0.06)]"
          : "bg-[#FCFAFF]/60 backdrop-blur-md border-b border-[#E9E4F5]/60 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo Header */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/images/celebro_icon.png"
            alt="Celebro"
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col justify-center">
            <span className="font-display text-2xl font-bold tracking-wider text-[#5B21B6] leading-none">
              CELEBRO
            </span>
            <span className="text-[9px] uppercase tracking-[0.22em] text-[#D08A24] font-bold mt-1">
              LUXURY EVENTS
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="group relative text-sm font-semibold text-[#17142A] hover:text-[#5B21B6] transition-colors py-1"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#5B21B6] transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
          ))}
        </nav>


        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {localStorage.getItem("access_token") ? (
            <Link
              to="/dashboard"
              className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-sm font-bold px-5 py-2.5 rounded-[10px] shadow-md transition-all hover:scale-105 flex items-center gap-2"
            >
              Dashboard ➔
            </Link>
          ) : (
            <>
              <Link
                to="/marketplace"
                className="text-xs font-bold text-[#5B21B6] bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#E9E4F5] px-4 py-2.5 rounded-[10px] transition-all"
              >
                Browse Planners
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold text-[#17142A] hover:text-[#5B21B6] px-3 py-2 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-sm font-bold px-5 py-2.5 rounded-[10px] shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
              >
                <span>Plan a Celebration</span>
                <span className="text-[#D08A24]">✦</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#17142A] p-2 -mr-2 rounded-lg hover:bg-[#F5F3FF] transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-2xl border-t border-[#E9E4F5] shadow-xl"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="py-3 font-semibold text-[#17142A] hover:text-[#5B21B6] border-b border-[#E9E4F5] flex items-center justify-between"
                >
                  <span>{l.label}</span>
                  <span className="text-xs text-[#5B21B6]">→</span>
                </Link>
              ))}

              <div className="flex flex-col gap-2.5 mt-5">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-3 rounded-[10px] border border-[#E9E4F5] text-[#17142A] font-semibold bg-[#F5F3FF]"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-3 rounded-[10px] bg-[#5B21B6] text-white font-bold shadow-md"
                >
                  Plan a Celebration ✦
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}




