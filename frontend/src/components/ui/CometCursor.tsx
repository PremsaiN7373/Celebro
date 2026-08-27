import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

const BRAND_COLORS = ["#5B21B6", "#6D28D9", "#4C1D95", "#7C3AED", "#8B5CF6", "#3B176D"];

export default function CometCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, speed: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if the device has a mouse/pointer and is wide enough
    const checkDevice = () => {
      const hasMouse = window.matchMedia("(pointer: fine)").matches;
      const isLargeScreen = window.innerWidth > 768;
      setIsMobile(!hasMouse || !isLargeScreen);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    // Apply global cursor hide stylesheet
    const style = document.createElement("style");
    style.id = "hide-default-cursor";
    style.innerHTML = `
      body, a, button, input, select, textarea, [role="button"], .cursor-pointer {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Fit canvas to viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const m = mouseRef.current;
      m.prevX = m.x;
      m.prevY = m.y;
      m.x = e.clientX;
      m.y = e.clientY;

      // Calculate speed for particle dispersion
      const dx = m.x - m.prevX;
      const dy = m.y - m.prevY;
      m.speed = Math.min(Math.sqrt(dx * dx + dy * dy), 35);

      // Spawn particles based on movement speed
      const particleCount = Math.floor(m.speed / 4) + 1;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Direction opposite of movement vector + random dispersion
        const baseVx = -dx * 0.15;
        const baseVy = -dy * 0.15;
        const spread = 0.5 + Math.random() * 1.5;

        particles.push({
          x: m.x,
          y: m.y,
          vx: baseVx + Math.cos(angle) * spread,
          vy: baseVy + Math.sin(angle) * spread,
          size: 3.5 + Math.random() * 4.5,
          alpha: 0.95,
          decay: 0.012 + Math.random() * 0.018,
          color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)]
        });
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Track hovered interactive elements to scale cursor dot
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.tagName === "INPUT" || 
        target.tagName === "SELECT" || 
        target.tagName === "TEXTAREA" || 
        target.closest("a") || 
        target.closest("button") || 
        target.closest("[role='button']") ||
        window.getComputedStyle(target).cursor === "pointer" ||
        target.classList.contains("cursor-pointer");

      setIsHovered(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOver);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size = Math.max(0.1, p.size - 0.04);

        if (p.alpha <= 0 || p.size <= 0.1) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // Draw Main Custom Cursor Dot/Ring
      if (isVisible) {
        const m = mouseRef.current;
        ctx.save();
        
        if (isHovered) {
          // Hover ring
          ctx.strokeStyle = "#5B21B6";
          ctx.lineWidth = 2;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(91, 33, 182, 0.8)";
          ctx.beginPath();
          ctx.arc(m.x, m.y, 16, 0, Math.PI * 2);
          ctx.stroke();

          // Core dot inside ring
          ctx.fillStyle = "#3B176D";
          ctx.beginPath();
          ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard elegant dot
          ctx.fillStyle = "#5B21B6";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(91, 33, 182, 0.9)";
          ctx.beginPath();
          ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
      
      const element = document.getElementById("hide-default-cursor");
      if (element) element.remove();
    };
  }, [isMobile, isHovered, isVisible]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99999]"
    />
  );
}
