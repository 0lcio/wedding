"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RingSequence from "./components/RingSequence";
import PaperSheet from "./components/PaperSheet";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1, 
      },

    });
    tl.to(paperRef.current, {
      y: -400, 
      ease: "none",
    });

  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="h-[200vh] w-full bg-[#EBE9E4] relative">
      <div className="fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-end pb-0 overflow-hidden">
        
        {/* RING */}
        <div className="absolute top-10 md:top-20 w-[200px] h-[200px] md:w-[250px] md:h-[250px] z-40 pointer-events-none">
          <RingSequence />
        </div>

        <div className="relative w-full max-w-[350px] md:max-w-xl translate-y-[15%] transition-transform duration-300">
          
          {/* 1. Back-Envelope (z-10) */}
          <div className="relative z-10 w-full">
             <Image
              src="/bustaAperta1.svg"
              alt="Interno Busta"
              width={800}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* 2. Invite (z-20) */}
          <div 
            ref={paperRef}
            className="absolute left-1/2 -translate-x-1/2 w-[90%] z-20 top-[2%]" 
          >
            <PaperSheet className="w-full pb-20 shadow-sm">
              <p className="font-sans text-[10px] tracking-[0.3em] text-stone-400 uppercase mb-4 mt-2">
                Save the Date
              </p>
              <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 leading-none uppercase tracking-widest">
                Name <br/> <span className="text-2xl text-stone-400">&</span> Name2
              </h1>
              <div className="w-8 h-[1px] bg-stone-300 my-6 mx-auto"></div>
              <div className="font-serif text-sm md:text-base space-y-1 uppercase tracking-[0.15em] text-stone-600">
                <p>DATE</p>
                <p className="text-[10px] text-stone-400 lowercase italic">HH</p>
                <p className="pt-6 font-bold text-stone-800">PLACE</p>
                <p className="text-[10px]">CITY</p>
              </div>
              <button className="mt-8 px-6 py-2 border border-stone-800 text-stone-800 font-sans text-[10px] tracking-widest uppercase hover:bg-stone-800 hover:text-white transition-colors">
                RSVP
              </button>
            </PaperSheet>
          </div>

          {/* 3. Front-Envelope (z-30) */}
          <div className="absolute bottom-0 left-0 w-full z-30 pointer-events-none">
             <Image
              src="/bustaAperta2.svg"
              alt="Fronte Busta"
              width={800}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>

        </div>
      </div>
    </main>
  );
}