// app/components/Signature.tsx
"use client";

import { useEffect } from "react";

export function Signature() {
  useEffect(() => {
    // Questo appare nella Console del browser (F12 -> Console)
    // Il %c permette di usare stile CSS nel log!
    console.log(
      "%c 💍 Gaia & Bledar Wedding \n Developed by 0lcio (find me on GitHub, https://github.com/0lcio). \n Thanks to Bianca🦎 for the design 🙏",
      
      "font-size: 14px; color: #57534e; margin-top: 10px;"
    );
  }, []);

  return (
    <div style={{ display: "none" }} aria-hidden="true">
      {/* Qui puoi scrivere un poema se vuoi. 
        Chi scarica il sito con "Salva pagina con nome" si prenderà anche questo.
      */}
      <p>Developed by: 0lcio (https://github.com/0lcio)</p>
    </div>
  );
}