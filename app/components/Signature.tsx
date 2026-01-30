// app/components/Signature.tsx
"use client";

import { useEffect } from "react";

export function Signature() {
  useEffect(() => {
    console.log(
      "%c 💍 Gaia & Bledar Wedding \n Developed by 0lcio (find me on GitHub, https://github.com/0lcio). \n Thanks to Bianca🦎 for the design 🙏",
      
      "font-size: 14px; color: #57534e; margin-top: 10px;"
    );
  }, []);

  return (
    <div style={{ display: "none" }} aria-hidden="true">
      <p>Developed by: 0lcio (https://github.com/0lcio)</p>
    </div>
  );
}