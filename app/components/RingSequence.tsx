"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image"; // Importiamo Image per il fallback

interface RingSequenceProps {
  onLoaded?: () => void;
}

export default function RingSequence({ onLoaded }: RingSequenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useFallback, setUseFallback] = useState(false); // Stato per attivare la GIF/WebP

  useEffect(() => {
    const video = videoRef.current;
    
    // Se siamo già in modalità fallback, non fare nulla col video
    if (useFallback) {
      if (onLoaded) onLoaded();
      return;
    }

    if (!video) return;

    // Funzione robusta per tentare il play
    const tryPlay = async () => {
      try {
        // Proviamo a far partire il video
        await video.play();
        // Se arriviamo qui, il video sta andando -> Tutto ok
      } catch (err) {
        console.log("Autoplay bloccato (Low Power Mode?), passo al fallback.", err);
        // Se il browser blocca (errore), attiviamo il fallback
        setUseFallback(true);
        // Notifichiamo comunque che è "carico" per non bloccare il sito
        if (onLoaded) onLoaded();
      }
    };

    tryPlay();

    // Listener per quando il video è pronto (se non va in errore)
    const handleCanPlay = () => {
      if (onLoaded && !useFallback) onLoaded();
    };

    video.addEventListener("canplaythrough", handleCanPlay);
    
    // Controllo cache
    if (video.readyState >= 3 && !useFallback) {
      if (onLoaded) onLoaded();
    }

    return () => {
      video.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, [onLoaded, useFallback]);


  // --- RENDER DEL FALLBACK (Animated WebP) ---
  if (useFallback) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Image
          src="/ring-fallback.webp" // Il file che hai creato con FFmpeg
          alt="Ring Animation"
          width={600}
          height={600}
          className="w-full h-full object-contain"
          priority // Caricalo subito
          unoptimized // Importante per le WebP animate su Next.js a volte
        />
      </div>
    );
  }

  // --- RENDER DEL VIDEO (Default) ---
  return (
    <div className="w-full h-full flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-contain hide-video-controls"
        muted
        loop
        playsInline
        width={600}
        height={600}
        poster="/ring-fallback.webp" 
      >
        <source src="/ring-safari.mov" />
        <source src="/ring-chrome.webm" type="video/webm" />
      </video>
    </div>
  );
}