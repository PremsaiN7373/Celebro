import { useCallback, useRef, useState } from "react";
import type { SceneVariant } from "./data";

export default function BeforeAfter({ variant }: { variant: SceneVariant }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.max(4, Math.min(96, p)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[16/10] rounded-[16px] overflow-hidden border border-[#E9E4F5] bg-white select-none touch-none cursor-ew-resize shadow-md group"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* AFTER (Fully Styled Luxury Venue) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/venue_after.png"
          alt="Fully Styled Luxury Venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute bottom-4 right-5 text-xs font-bold uppercase tracking-widest text-white bg-[#5B21B6] backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xs">
          ✨ Styled Celebration
        </span>
      </div>

      {/* BEFORE (Bare Venue) */}
      <div
        className="absolute inset-0 z-10"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <img
          src="/images/venue_before.png"
          alt="Bare Venue Before Styling"
          className="w-full h-full object-cover filter brightness-95"
        />
        <div className="absolute inset-0 bg-black/20" />
        <span className="absolute bottom-4 left-5 text-xs font-bold uppercase tracking-widest text-white bg-[#3B176D]/80 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full shadow-xs">
          🏰 Raw Blank Space
        </span>
      </div>

      {/* Drag Split Handle */}
      <div className="absolute inset-y-0 z-20 -ml-px pointer-events-none" style={{ left: `${pct}%` }}>
        <div className="absolute inset-y-0 w-0.5 bg-[#5B21B6] shadow-xs" />
        <button
          role="slider"
          aria-label="Reveal the decorated celebration venue"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPct((p) => Math.max(4, p - 4));
            if (e.key === "ArrowRight") setPct((p) => Math.min(96, p + 4));
          }}
          className="pointer-events-auto absolute top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-white text-[#5B21B6] shadow-md cursor-ew-resize focus:outline-none hover:scale-110 transition-transform border border-[#E9E4F5]"
        >
          <span className="text-base font-bold">⇄</span>
        </button>
      </div>
    </div>
  );
}




