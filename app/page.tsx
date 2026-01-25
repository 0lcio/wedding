"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner"
import RingSequence from "./components/RingSequence";
import PaperSheet from "./components/PaperSheet";
import RsvpDialog from "./components/RsvpDialog"; // IMPORTANTE: Importa il componente

gsap.registerPlugin(ScrollTrigger);

const NameBride = process.env.NEXT_PUBLIC_NAME_BRIDE;
const NameGroom = process.env.NEXT_PUBLIC_NAME_GROOM;
const WeddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE;
const WeddingLocation = process.env.NEXT_PUBLIC_WEDDING_LOCATION;
const WeddingTime = process.env.NEXT_PUBLIC_WEDDING_TIME;
const WeddingAddress = process.env.NEXT_PUBLIC_WEDDING_ADDRESS;
const WeddingAddress2 = process.env.NEXT_PUBLIC_WEDDING_ADDRESS2;

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
              <Image
                src="/date.svg"
                alt="Decorazione floreale"
                width={400}
                height={50}
                className="mx-auto mb-6"
              />
              <p className="font-serif pb-5 uppercase text-stone-600">For the wedding of</p>
              <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 leading-none uppercase tracking-widest">
                {NameBride} & {NameGroom}
              </h1>
              <div className="font-serif text-sm md:text-base pt-3 uppercase tracking-[0.15em] text-stone-600">
                <p>{WeddingDate} {WeddingTime}</p>
                <div className="pt-2 leading-[1.3em]">
                  <p className="pt-6 font-bold text-stone-800">{WeddingLocation}</p>
                  <p className="">{WeddingAddress}</p>
                <p className="">{WeddingAddress2}</p>
                </div>
              </div>
              
              {/* Qui inseriamo il Dialog che contiene al suo interno il Trigger (bottone) */}
              <RsvpDialog />

            </PaperSheet>
          </div>

          {/* 3. Front-Envelope (z-30) */}
          <div className="absolute bottom-0 left-0 w-full z-30 pointer-events-none shadow-xl">
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