import type { Variants } from "framer-motion";

export type SceneVariant =
  | "birthday"
  | "anniversary"
  | "love"
  | "proposal"
  | "kids"
  | "corporate"
  | "private"
  | "custom";

export interface GalleryItem {
  id: string;
  title: string;
  category: SceneVariant;
  image: string;
}

export interface StatItem {
  number: string;
  label: string;
}

export interface StepItem {
  n: string;
  title: string;
  body: string;
}

export interface TestimonialItem {
  name: string;
  event: string;
  rating: number;
  quote: string;
  avatar: string;
}

export interface Category {
  id: SceneVariant;
  emoji: string;
  title: string;
  tagline: string;
  description: string;
  gradient: string;
  glow: string;
  image: string;
  startingPrice: string;
  rating: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "birthday",
    emoji: "🎂",
    title: "Birthday Celebrations",
    tagline: "Milestone moments crafted to perfection",
    description: "From lavish rooftop bashes to intimate fine dining experiences with cake, sparklers, and champagne.",
    gradient: "from-champagne-500 via-celebrate-500 to-royal-500",
    glow: "#F59E0B",
    image: "/images/birthday_hero.png",
    startingPrice: "$499",
    rating: 4.9,
  },
  {
    id: "anniversary",
    emoji: "💍",
    title: "Anniversaries",
    tagline: "Every year of love, celebrated in style",
    description: "Candlelight, red roses, violinists, and a romantic evening that honors your journey together.",
    gradient: "from-royal-600 via-royal-500 to-celebrate-500",
    glow: "#7C3AED",
    image: "/images/anniversary_hero.png",
    startingPrice: "$699",
    rating: 4.98,
  },
  {
    id: "love",
    emoji: "❤️",
    title: "Romantic Love Surprises",
    tagline: "Unforgettable heartfelt gestures",
    description: "Fairy light canopies, rose petal pathways, heart marquee lights, and unexpected magic.",
    gradient: "from-celebrate-600 via-celebrate-500 to-champagne-500",
    glow: "#EC4899",
    image: "/images/surprise_hero.png",
    startingPrice: "$399",
    rating: 4.95,
  },
  {
    id: "proposal",
    emoji: "✨",
    title: "Marriage Proposals",
    tagline: "The setting worthy of the biggest YES",
    description: "Rooftop sunset arches, illuminated marquee letters, luxury floral pathways, and photography.",
    gradient: "from-champagne-600 via-champagne-500 to-royal-400",
    glow: "#F59E0B",
    image: "/images/proposal_hero.png",
    startingPrice: "$899",
    rating: 5.0,
  },
  {
    id: "kids",
    emoji: "🎈",
    title: "Kids' Birthday Events",
    tagline: "Magical wonderlands brought to life",
    description: "Enchanted themes, pastel balloon installations, dessert bars, and joyful entertainment.",
    gradient: "from-celebrate-400 via-champagne-400 to-royal-400",
    glow: "#EC4899",
    image: "/images/kids_hero.png",
    startingPrice: "$549",
    rating: 4.88,
  },
  {
    id: "corporate",
    emoji: "🎊",
    title: "Corporate Events & Galas",
    tagline: "Executive polish & memorable gatherings",
    description: "Modern stage setups, ambient accent lighting, branded galas, and professional hospitality.",
    gradient: "from-royal-700 via-royal-500 to-royal-400",
    glow: "#7C3AED",
    image: "/images/corporate_hero.png",
    startingPrice: "$1,299",
    rating: 4.92,
  },
];

export interface Experience {
  id: string;
  title: string;
  category: SceneVariant;
  blurb: string;
  gradient: string;
  image: string;
  price: string;
  rating: number;
  location: string;
}

export const DEFAULT_EXPERIENCES: Experience[] = [
  { id: "exp-1", title: "Rooftop Sunset Birthday Gala", category: "birthday", blurb: "Skyline views, fairy light canopy, multi-tier cake under stars.", gradient: "from-champagne-500 to-celebrate-500", image: "/images/birthday_hero.png", price: "$750", rating: 4.96, location: "New York, NY" },
  { id: "exp-2", title: "Private Candlelight Dinner for Two", category: "anniversary", blurb: "Private dining room, rose petals, violin player, wine pairing.", gradient: "from-royal-600 to-celebrate-500", image: "/images/anniversary_hero.png", price: "$620", rating: 4.99, location: "Los Angeles, CA" },
  { id: "exp-3", title: "Luxury Suite Surprise Styling", category: "love", blurb: "Rose petal pathway, floating heart balloons, champagne setup.", gradient: "from-celebrate-600 to-champagne-500", image: "/images/surprise_hero.png", price: "$450", rating: 4.93, location: "Miami, FL" },
  { id: "exp-4", title: "Rooftop Marquee Proposal setup", category: "proposal", blurb: "MARRY ME giant illuminated letters, floral arch, photographer.", gradient: "from-champagne-600 to-royal-500", image: "/images/proposal_hero.png", price: "$1,100", rating: 5.0, location: "Chicago, IL" },
  { id: "exp-5", title: "Enchanted Castle Kids Bash", category: "kids", blurb: "Custom balloon arches, castle candy bar, entertainment crew.", gradient: "from-celebrate-400 to-royal-400", image: "/images/kids_hero.png", price: "$590", rating: 4.91, location: "Dallas, TX" },
  { id: "exp-6", title: "VIP Product Launch & Gala", category: "corporate", blurb: "Modern stage lighting, cocktail lounge, live DJ, catering.", gradient: "from-royal-700 to-royal-400", image: "/images/corporate_hero.png", price: "$1,850", rating: 4.94, location: "San Francisco, CA" },
];

export const DEFAULT_HERO_CONFIG = {
  tagline: "Luxury Celebration & Event Marketplace",
  titleLine1: "Plan. Connect.",
  titleHighlight: "Celebrate.",
  subtitle: "Discover trusted event planners and manage every detail of your celebration in one beautiful place.",
};

export const DEFAULT_STEPS: StepItem[] = [
  { n: "01", title: "Choose Your Celebration", body: "Select your event type — Birthday, Anniversary, Proposal, or Custom Surprise." },
  { n: "02", title: "Customize Your Experience", body: "Pick themes, floral decor, lighting, entertainment, and cake options." },
  { n: "03", title: "Select Date & Venue", body: "Choose your preferred date, luxury private venue, or home setup address." },
  { n: "04", title: "Book Your Event", body: "Pay securely with milestone protection and connect with your dedicated planner." },
  { n: "05", title: "Celebrate The Moment", body: "Step into your dream celebration seamlessly created for you." },
];

export const DEFAULT_STATS: StatItem[] = [
  { number: "10,000+", label: "Celebrations Created" },
  { number: "500+", label: "Verified Event Partners" },
  { number: "4.9 / 5", label: "Average Customer Rating" },
  { number: "100+", label: "Cities Nationwide" },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Elena & Marcus V.",
    event: "5th Anniversary Dinner",
    rating: 5,
    quote: "The candlelight dinner setup blew our minds. Every rose petal was placed with such artistry. Truly an unforgettable night!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "David K.",
    event: "Rooftop Marriage Proposal",
    rating: 5,
    quote: "She said YES! The illuminated Marry Me marquee letters and violinist on the rooftop felt straight out of a movie.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Sophia Martinez",
    event: "30th Birthday Celebration",
    rating: 5,
    quote: "Celebro made planning my 30th completely stress-free. The planner managed everything from balloons to the DJ seamlessly.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  },
];

export const DEFAULT_CTA_CONFIG = {
  title: "Ready To Plan Your Dream Event?",
  subtitle: "Join thousands of celebrators and connect with verified luxury event planners today.",
  buttonText: "Create Your Celebration Now",
};

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  { id: "g1", title: "Luxury Rooftop Gala", category: "birthday", image: "/images/birthday_hero.png" },
  { id: "g2", title: "Candlelight Anniversary Table", category: "anniversary", image: "/images/anniversary_hero.png" },
  { id: "g3", title: "Romantic Suite Decoration", category: "love", image: "/images/surprise_hero.png" },
  { id: "g4", title: "Sunset Marquee Proposal", category: "proposal", image: "/images/proposal_hero.png" },
  { id: "g5", title: "Enchanted Birthday Party", category: "kids", image: "/images/kids_hero.png" },
  { id: "g6", title: "Executive Celebration Gala", category: "corporate", image: "/images/corporate_hero.png" },
];

export const DEFAULT_VIDEO_URL = "https://www.youtube-nocookie.com/embed/xvT1jH8B9AM?autoplay=1";
export const DEFAULT_VIDEO_COVER = "/images/proposal_hero.png";


// CMS Getters & Setters
export function getHeroCMS() {
  try {
    const saved = localStorage.getItem("celebro_cms_hero");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_HERO_CONFIG;
}
export function saveHeroCMS(hero: any) {
  localStorage.setItem("celebro_cms_hero", JSON.stringify(hero));
}

export function getStatsCMS(): StatItem[] {
  try {
    const saved = localStorage.getItem("celebro_cms_stats");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_STATS;
}
export function saveStatsCMS(stats: StatItem[]) {
  localStorage.setItem("celebro_cms_stats", JSON.stringify(stats));
}

export function getStepsCMS(): StepItem[] {
  try {
    const saved = localStorage.getItem("celebro_cms_steps");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_STEPS;
}
export function saveStepsCMS(steps: StepItem[]) {
  localStorage.setItem("celebro_cms_steps", JSON.stringify(steps));
}

export function getTestimonialsCMS(): TestimonialItem[] {
  try {
    const saved = localStorage.getItem("celebro_cms_testimonials");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_TESTIMONIALS;
}
export function saveTestimonialsCMS(tests: TestimonialItem[]) {
  localStorage.setItem("celebro_cms_testimonials", JSON.stringify(tests));
}

export function getCtaCMS() {
  try {
    const saved = localStorage.getItem("celebro_cms_cta");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_CTA_CONFIG;
}
export function saveCtaCMS(cta: any) {
  localStorage.setItem("celebro_cms_cta", JSON.stringify(cta));
}

export function getCategoriesCMS(): Category[] {
  try {
    const saved = localStorage.getItem("celebro_cms_categories");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_CATEGORIES;
}

export function saveCategoriesCMS(cats: Category[]) {
  localStorage.setItem("celebro_cms_categories", JSON.stringify(cats));
}

export function getExperiencesCMS(): Experience[] {
  try {
    const saved = localStorage.getItem("celebro_cms_experiences");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_EXPERIENCES;
}

export function saveExperiencesCMS(exps: Experience[]) {
  localStorage.setItem("celebro_cms_experiences", JSON.stringify(exps));
}

export function getGalleryItemsCMS(): GalleryItem[] {
  try {
    const saved = localStorage.getItem("celebro_cms_gallery");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_GALLERY_ITEMS;
}

export function saveGalleryItemsCMS(items: GalleryItem[]) {
  localStorage.setItem("celebro_cms_gallery", JSON.stringify(items));
}

export function getVideoConfigCMS() {
  try {
    const saved = localStorage.getItem("celebro_cms_video");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { url: DEFAULT_VIDEO_URL, cover: DEFAULT_VIDEO_COVER };
}

export function saveVideoConfigCMS(config: { url: string; cover: string }) {
  localStorage.setItem("celebro_cms_video", JSON.stringify(config));
}

// Dynamic data getters that always fetch fresh CMS data without Proxy crashes
export function getCategories(): Category[] {
  return getCategoriesCMS();
}

export function getExperiences(): Experience[] {
  return getExperiencesCMS();
}

export function getGalleryItems(): GalleryItem[] {
  return getGalleryItemsCMS();
}

export function getStats(): StatItem[] {
  return getStatsCMS();
}

export function getSteps(): StepItem[] {
  return getStepsCMS();
}

export function getTestimonials(): TestimonialItem[] {
  return getTestimonialsCMS();
}

export function getHeroConfig(): any {
  return getHeroCMS();
}

export function getCtaConfig(): any {
  return getCtaCMS();
}

// Direct safe array exports for backwards compatibility
export const CATEGORIES = getCategoriesCMS();
export const EXPERIENCES = getExperiencesCMS();
export const GALLERY_ITEMS = getGalleryItemsCMS();
export const STATS = getStatsCMS();
export const STEPS = getStepsCMS();
export const TESTIMONIALS = getTestimonialsCMS();
export const HERO_CONFIG = getHeroCMS();
export const CTA_CONFIG = getCtaCMS();


export const TRUST_POINTS = [
  { icon: "verified", title: "Verified Planners", body: "Rigorously vetted luxury event designers & vendors." },
  { icon: "secure", title: "Milestone Payments", body: "Encrypted payment handling with full client protection." },
  { icon: "chat", title: "Direct Real-time Chat", body: "Message your dedicated planner anytime with custom requests." },
  { icon: "workspace", title: "All-in-One Workspace", body: "Manage budget, guest RSVPs, timelines, and invites in one place." },
];

export const fadeUp = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 26 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: reduce ? 0 : i * 0.08 },
  }),
});




