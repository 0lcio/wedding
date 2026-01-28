"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Toaster } from "sonner"; 
import { Loader2 } from "lucide-react"; 
import RingSequence from "./components/RingSequence"; 
import PaperSheet from "./components/PaperSheet";
import RsvpDialog from "./components/RsvpDialog"; 

gsap.registerPlugin(ScrollTrigger);

const NameBride = process.env.NEXT_PUBLIC_NAME_BRIDE;
const NameGroom = process.env.NEXT_PUBLIC_NAME_GROOM;
const WeddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE;
const WeddingLocation = process.env.NEXT_PUBLIC_WEDDING_LOCATION;
const WeddingTime = process.env.NEXT_PUBLIC_WEDDING_TIME;
const WeddingAddress = process.env.NEXT_PUBLIC_WEDDING_ADDRESS;
const WeddingAddress2 = process.env.NEXT_PUBLIC_WEDDING_ADDRESS2;

export default function Home() {
  const [isPageLoaded, setIsPageLoaded] = useState(false); 
  const [isRingLoaded, setIsRingLoaded] = useState(false); 
  
  const isEverythingReady = isPageLoaded && isRingLoaded;

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const bustaAperta1Ref = useRef<HTMLImageElement>(null);
  const busta3Ref = useRef<HTMLImageElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    if (typeof window !== "undefined") window.scrollTo(0, 0);

    const handleLoad = () => setIsPageLoaded(true);
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  useGSAP(() => {
    if (!isEverythingReady) return;

    window.scrollTo(0, 0);

    const elementsToAnimate = [wrapperRef.current, busta3Ref.current, bustaAperta1Ref.current, paperRef.current];
    gsap.set(elementsToAnimate, { 
      willChange: "transform, opacity", 
      force3D: true,
      backfaceVisibility: "hidden" 
    });

    gsap.set(wrapperRef.current, { y: 300, autoAlpha: 0 }); 
    gsap.set(bustaAperta1Ref.current, { autoAlpha: 0 });
    gsap.set(paperRef.current, { autoAlpha: 0, y: 250 });

    const introTl = gsap.timeline({ 
      defaults: { ease: "power3.out" },
      onComplete: () => {
        document.body.style.overflow = "auto";
        document.body.style.overflowX = "hidden";
        initScrollTrigger();
      }
    });

    introTl
    .to(loaderRef.current, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
            if (loaderRef.current) loaderRef.current.style.display = "none";
        }
    })
    .set({}, {}, "+=0.2")

    // ENTRATA
    .to(wrapperRef.current, {
        y: 0,
        autoAlpha: 1,
        duration: 1, 
        ease: "sine.out", 
    })
    
    // APERTURA
    .to(busta3Ref.current, {
        autoAlpha: 0,
        duration: 1.5,
        ease: "power2.inOut",
    })
    
    .to(bustaAperta1Ref.current, {
        autoAlpha: 1,
        duration: 1.5,
        ease: "power2.inOut",
    }, "<") 
    .set(busta3Ref.current, { display: "none" })
    // USCITA FOGLIO
    .to(paperRef.current, {
        y: 0, 
        autoAlpha: 1,
        duration: 3.0, 
        ease: "power2.out", 
    }, "-=0.5");


    function initScrollTrigger() {
      gsap.set([wrapperRef.current, busta3Ref.current, bustaAperta1Ref.current], { willChange: "auto" });
      
      gsap.fromTo(paperRef.current, 
        { y: 0 }, 
        {
          y: -400,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          }
        }
      );
    }

  }, { scope: containerRef, dependencies: [isEverythingReady] });

  return (
    <main ref={containerRef} className="h-[200vh] w-full bg-[#EBE9E4] relative">
      <Toaster /> 

      {/* LOADER */}
      <div 
        ref={loaderRef}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#EBE9E4] h-screen w-screen"
        style={{ touchAction: "none" }} 
      >
         <div className="flex flex-col items-center gap-4">
             <h2 className="font-serif text-xl text-stone-800 tracking-[0.2em] uppercase animate-pulse">
                {!isRingLoaded ? "Loading..." : "Welcome"}
             </h2>
             <Loader2 className="w-6 h-6 text-stone-600 animate-spin" />
         </div>
      </div>

      <div className="fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-end pb-0 overflow-hidden">
        
        {/* RING */}
        <div className="absolute top-10 md:top-20 w-[200px] h-[200px] md:w-[250px] md:h-[250px] z-40 pointer-events-none">
          <RingSequence onLoaded={() => setIsRingLoaded(true)} />
        </div>

        {/* WRAPPER BUSTA */}
        <div 
          ref={wrapperRef}
          className="relative w-full max-w-[350px] md:max-w-xl translate-y-[15%] transition-transform duration-300"
        >
          {/* ... STESSE IMMAGINI DI PRIMA ... */}
          <div className="relative bottom-[-68] md:bottom-[-108] z-10 w-full">
             <Image
              ref={bustaAperta1Ref}
              src="/bustaAperta1.webp"
              alt="Interno Busta"
              width={800}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>

          <div 
            ref={paperRef}
            className="absolute left-1/2 -translate-x-1/2 w-[90%] z-20 top-[2%]" 
          >
            <PaperSheet className="w-full pb-20 shadow-sm will-change-transform">
              <Image
                src="/date.webp"
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
              <RsvpDialog />
            </PaperSheet>
          </div>

          <div className="absolute bottom-[-68] md:bottom-[-108] left-0 w-full z-30 pointer-events-none shadow-xl">
             <Image
              src="/bustaAperta2.webp"
              alt="Fronte Busta"
              width={800}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>

          <Image
            ref={busta3Ref}
            src="/busta3.webp"
            alt="Busta Chiusa"
            width={800}
            height={500}
            className="absolute bottom-[-68] md:bottom-[-108] left-0 w-full h-auto z-50 pointer-events-none" 
            priority
          />
        </div>
      </div>
    </main>
  );
}