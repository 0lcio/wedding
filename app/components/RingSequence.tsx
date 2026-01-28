"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

interface RingSequenceProps {
  onLoaded?: () => void;
}

export default function RingSequence({ onLoaded }: RingSequenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (useFallback) {
      if (onLoaded) onLoaded();
      return;
    }

    if (!video) return;

    const tryPlay = async () => {
      try {
        video.currentTime = 0;
        await video.play();
      } catch (err) {
        setUseFallback(true);
        if (onLoaded) onLoaded();
      }
    };

    tryPlay();

    const handlePlaying = () => {
      if (!useFallback) {
        setIsVideoVisible(true);
        if (onLoaded) onLoaded();
      }
    };

    video.addEventListener("timeupdate", handlePlaying, { once: true });

    return () => {
      video.removeEventListener("timeupdate", handlePlaying);
    };
  }, [onLoaded, useFallback]);

  if (useFallback) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Image
          src="/ring-fallback.webp"
          alt="Ring Animation"
          width={600}
          height={600}
          className="w-full h-full object-contain"
          priority
          unoptimized
        />
      </div>
    );
  }

  // --- RENDER VIDEO (Default) ---
  return (
    <div className="w-full h-full flex items-center justify-center isolate">
      <video
        ref={videoRef}
        className={`w-full h-full object-contain pointer-events-none mix-blend-screen transition-opacity duration-500 ${
          isVideoVisible ? "opacity-100" : "opacity-0"
        }`}
        muted
        loop
        playsInline
        preload="auto"
        width={600}
        height={600}
        style={{ background: "transparent" }} 
      >
        <source src="/ring-safari.mov" type='video/quicktime; codecs="hvc1"' />
        <source src="/ring-chrome.webm" type="video/webm" />
      </video>
    </div>
  );
}