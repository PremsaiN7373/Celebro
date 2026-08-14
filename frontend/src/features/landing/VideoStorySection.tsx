import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconClose } from "./icons";
import { getVideoConfigCMS } from "./data";

export function formatYoutubeEmbedUrl(rawUrl: string): string {
  if (!rawUrl) return "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1";
  
  if (rawUrl.includes("/embed/")) {
    return rawUrl.includes("autoplay=") ? rawUrl : `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}autoplay=1`;
  }

  let videoId = "";
  const watchMatch = rawUrl.match(/[?&]v=([^&]+)/);
  const shortMatch = rawUrl.match(/youtu\.be\/([^?&]+)/);
  const shortsMatch = rawUrl.match(/shorts\/([^?&]+)/);

  if (watchMatch && watchMatch[1]) {
    videoId = watchMatch[1];
  } else if (shortMatch && shortMatch[1]) {
    videoId = shortMatch[1];
  } else if (shortsMatch && shortsMatch[1]) {
    videoId = shortsMatch[1];
  } else {
    videoId = rawUrl.trim();
  }

  if (videoId && !videoId.includes("://")) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
  }

  return rawUrl;
}

export default function VideoStorySection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoConfig, setVideoConfig] = useState(getVideoConfigCMS());

  useEffect(() => {
    setVideoConfig(getVideoConfigCMS());
  }, []);

  const embedUrl = formatYoutubeEmbedUrl(videoConfig.url);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-[16px] overflow-hidden border border-[#E9E4F5] aspect-[21/9] min-h-[360px] shadow-md group grid place-items-center">
          {/* Background Cover */}
          <img
            src={videoConfig.cover}
            alt="Cinematic Celebration Story"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3B176D]/90 via-[#3B176D]/60 to-[#3B176D]/30" />

          {/* Center Callout */}
          <div className="relative z-10 text-center px-6 max-w-2xl text-white">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#EDE9FE] mb-3 block">
              Cinematic Atmosphere
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              Every Celebration Deserves A Story.
            </h2>
            <p className="text-white/90 text-sm sm:text-base mt-3 max-w-lg mx-auto font-medium">
              Experience how our master planners turn ordinary venues into magical, lifelong memories.
            </p>

            {/* Glowing Play Button */}
            <motion.button
              onClick={() => setIsPlaying(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Play Celebration Trailer"
              className="mt-8 mx-auto w-16 h-16 rounded-full bg-[#5B21B6] border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-white text-xl pl-1"
            >
              ▶
            </motion.button>
          </div>
        </div>
      </div>

      {/* Video Modal Preview */}
      {isPlaying && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center p-4 bg-[#3B176D]/90 backdrop-blur-md"
          onClick={() => setIsPlaying(false)}
        >
          <div className="relative w-full max-w-5xl aspect-video rounded-[16px] overflow-hidden border border-[#E9E4F5] bg-black shadow-2xl">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 z-20 grid place-items-center w-11 h-11 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all border border-white/20"
            >
              <IconClose />
            </button>
            <iframe
              className="w-full h-full"
              src={embedUrl}
              title="Celebration Experience Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}





