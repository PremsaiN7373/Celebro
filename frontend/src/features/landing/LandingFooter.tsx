import { Link } from "react-router-dom";
import { CATEGORIES } from "./data";

const IconInstagram = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconPinterest = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M8 22a9 9 0 0 1-1.91-8.39c.2-.74 1.2-3.8 1.2-3.8s-.3-.6-.3-1.48c0-1.39.8-2.43 1.8-2.43.85 0 1.26.64 1.26 1.4 0 .86-.55 2.14-.83 3.32-.24 1 .5 1.81 1.48 1.81 1.78 0 3.15-1.88 3.15-4.59 0-2.4-1.73-4.08-4.19-4.08-2.86 0-4.53 2.14-4.53 4.35 0 .86.33 1.79.74 2.29a.3.3 0 0 1 .07.28c-.08.33-.26 1.07-.3 1.21a.22.22 0 0 1-.22.15c-1.34-.62-2.18-2.58-2.18-4.15 0-3.38 2.46-6.49 7.08-6.49 3.72 0 6.61 2.65 6.61 6.19 0 3.7-2.33 6.68-5.56 6.68-1.09 0-2.11-.56-2.46-1.23l-.67 2.56c-.24.93-.9 2.1-1.34 2.82A10 10 0 1 0 8 22z" />
  </svg>
);

const IconTwitter = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const IconLinkedIn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function LandingFooter() {
  const companyLinks = [
    { label: "About Us", to: "/" },
    { label: "How It Works", to: "/how-it-works" },
    { label: "Verified Partners", to: "/marketplace" },
    { label: "Careers", to: "/" },
  ];

  const supportLinks = [
    { label: "Help Center", to: "/" },
    { label: "Planner Portal", to: "/login" },
    { label: "Trust & Safety", to: "/" },
    { label: "Terms of Service", to: "/" },
    { label: "Privacy Policy", to: "/" },
  ];

  const socialLinks = [
    { name: "Instagram", icon: <IconInstagram />, href: "https://instagram.com" },
    { name: "Pinterest", icon: <IconPinterest />, href: "https://pinterest.com" },
    { name: "Twitter / X", icon: <IconTwitter />, href: "https://x.com" },
    { name: "LinkedIn", icon: <IconLinkedIn />, href: "https://linkedin.com" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-white to-[#FAF9FF] border-t border-[#E9E4F5] overflow-hidden">
      {/* Premium ambient light glow effect */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[#F5F2FF] rounded-full blur-[100px] pointer-events-none opacity-50 -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-[#EEF2FF] rounded-full blur-[90px] pointer-events-none opacity-40 translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand & Newsletter Column */}
        <div className="flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity duration-200">
              <img src="/images/celebro_logo.png" alt="Celebro" className="h-20 sm:h-24 w-auto object-contain" />
            </Link>
            <p className="text-sm text-[#6B6780] mt-4 max-w-xs leading-relaxed font-medium">
              Plan. Connect. Celebrate. The ultimate luxury marketplace connecting dreamers with master event specialists.
            </p>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-[#4C1D95] font-bold mb-3">Stay Inspired</p>
            <div className="flex gap-2 max-w-xs bg-white p-1 rounded-[12px] border border-[#E9E4F5] shadow-xs focus-within:ring-2 focus-within:ring-[#5B21B6]/30 focus-within:border-[#5B21B6] transition-all duration-300">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-[#17142A] placeholder:text-[#9A95B6] outline-none font-medium"
              />
              <Link
                to="/register"
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-semibold px-4 py-2 rounded-[10px] shadow-sm hover:scale-102 active:scale-98 transition-all duration-200 flex items-center justify-center"
              >
                Join
              </Link>
            </div>
          </div>
        </div>

        {/* Celebrations Column */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#4C1D95] font-bold mb-5">Celebrations</p>
          <div className="flex flex-col gap-3 text-sm text-[#6B6780] font-medium">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                to={`/experiences?cat=${cat.id}`}
                className="hover:text-[#5B21B6] hover:translate-x-1.5 transition-all duration-300 block"
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Company Column */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#4C1D95] font-bold mb-5">Company</p>
          <div className="flex flex-col gap-3 text-sm text-[#6B6780] font-medium">
            {companyLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="hover:text-[#5B21B6] hover:translate-x-1.5 transition-all duration-300 block"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Support Column */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#4C1D95] font-bold mb-5">Support</p>
          <div className="flex flex-col gap-3 text-sm text-[#6B6780] font-medium">
            {supportLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="hover:text-[#5B21B6] hover:translate-x-1.5 transition-all duration-300 block"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="relative border-t border-[#E9E4F5]/80 bg-white/50 backdrop-blur-xs py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6 text-xs text-[#6B6780] font-medium">
          <span>© {new Date().getFullYear()} Celebro Inc. All rights reserved.</span>
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 rounded-full border border-[#E9E4F5] bg-white text-[#6B6780] hover:text-[#5B21B6] hover:border-[#5B21B6] hover:bg-[#FAF9FF] hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xs"
                title={social.name}
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
