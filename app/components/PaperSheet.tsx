"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface PaperSheetProps {
  children: React.ReactNode;
  className?: string;
}

export default function PaperSheet({
  children,
  className = "",
}: PaperSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2, 
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto w-full max-w-2xl bg-[#FDFBF7] shadow-2xl ${className}`}
      style={{
        boxShadow:
          "0 20px 40px -5px rgba(0,0,0,0.1), 0 10px 20px -5px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.7] pointer-events-none"
        style={{
          backgroundImage: `url("/paper-texture.jpg")`,
          backgroundSize: "cover", 
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat", 
        }}
      />

      {/* CONTENUTO DEL FOGLIO */}
      <div className="relative z-10 p-12 md:p-16 flex flex-col items-center text-center">
        {children}
      </div>
    </div>
  );
}
