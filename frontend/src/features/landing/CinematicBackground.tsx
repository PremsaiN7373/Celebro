import { motion, useReducedMotion } from "framer-motion";

/**
 * Celebro Lavender Premium cinematic background — light, elegant, and airy.
 * Uses soft lavender orbs, delicate geometric shapes, and a clean #FCFAFF base
 * with purple accent glows that shift based on the active celebration category.
 */
export default function CinematicBackground({ tint = "#8B5CF6" }: { tint?: string }) {
  const reduce = useReducedMotion();

  const animateOrb = (x: number[], y: number[]) =>
    reduce ? undefined : { x, y };
  const transitionOrb = reduce
    ? undefined
    : { duration: 24, repeat: Infinity, ease: "easeInOut" };

  // Deterministic soft particle dots
  const particles = Array.from({ length: 22 }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 53) % 100,
    size: 2 + (i % 3),
    delay: (i % 7) * 0.6,
    dur: 7 + (i % 5) * 1.4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Light lavender base */}
      <div className="absolute inset-0 bg-[#FCFAFF]" />

      {/* Primary category-tinted soft orb — top left */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px]"
        style={{ top: "-18%", left: "-10%", background: `${tint}22` }}
        animate={animateOrb([0, 60, 0], [0, 40, 0])}
        transition={transitionOrb}
      />

      {/* Secondary lavender orb — bottom right */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[130px]"
        style={{ bottom: "-15%", right: "-8%", background: "#8B5CF622" }}
        animate={animateOrb([0, -50, 0], [0, -30, 0])}
        transition={transitionOrb}
      />

      {/* Tertiary gentle purple glow — center right */}
      <motion.div
        className="absolute w-[380px] h-[380px] rounded-full blur-[120px]"
        style={{ top: "20%", right: "18%", background: "#EDE9FE80" }}
        animate={animateOrb([0, 30, 0], [0, 50, 0])}
        transition={transitionOrb}
      />

      {/* Very light lavender wash — center bottom */}
      <motion.div
        className="absolute w-[450px] h-[300px] rounded-full blur-[100px]"
        style={{ bottom: "5%", left: "30%", background: "#F5F3FF" }}
        animate={animateOrb([0, 20, 0], [0, -20, 0])}
        transition={transitionOrb}
      />

      {/* Soft diagonal shimmer rays */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background:
            "repeating-linear-gradient(115deg, transparent 0px, transparent 60px, rgba(91,33,182,0.5) 60px, transparent 62px)",
          maskImage: "radial-gradient(circle at 50% 0%, black, transparent 70%)",
        }}
      />

      {/* Floating lavender micro-dots */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#8B5CF6]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: 0.12,
          }}
          animate={reduce ? undefined : { y: [0, -16, 0], opacity: [0.06, 0.2, 0.06] }}
          transition={reduce ? undefined : { duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Very subtle dot grain texture for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #5B21B6 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      />

      {/* Soft gradient vignette at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FCFAFF] to-transparent" />
    </div>
  );
}
