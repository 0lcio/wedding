"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function RingSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const frameCount = 96; 
  const folder = "/frames/"; 
  
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const renderLoop = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const promises = [];
      const loadedImages: HTMLImageElement[] = [];

      for (let i = 0; i < frameCount; i++) {
        // Formatta il numero: 0 -> "000", 15 -> "015"
        const index = i.toString().padStart(3, "0");
        const src = `${folder}frame_${index}.webp`;

        const img = new Image();
        img.src = src;
        
        const promise = new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });

        promises.push(promise);
        loadedImages.push(img);
      }

      await Promise.all(promises);
      imagesRef.current = loadedImages;
      setImagesLoaded(true);
    };

    loadImages();

    return () => {
      if (renderLoop.current) renderLoop.current.kill();
    };
  }, []);

  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imagesRef.current[0].width;
    canvas.height = imagesRef.current[0].height;

    const frameObj = { val: 0 };

    renderLoop.current = gsap.to(frameObj, {
      val: frameCount - 1,
      duration: 3,         
      repeat: -1,      
      ease: "none",        
      onUpdate: () => {

        const frameIndex = Math.round(frameObj.val);
        const img = imagesRef.current[frameIndex];
        
        if (img) {

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
      },
    });

  }, [imagesLoaded]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      {!imagesLoaded && <p className="text-gray-400 animate-pulse">Caricamento anello...</p>}
      
      <canvas 
        ref={canvasRef} 
        className={`max-w-full max-h-full object-contain ${imagesLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      />
    </div>
  );
}