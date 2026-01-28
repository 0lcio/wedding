import type { Metadata } from "next";
import { Amiri, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { Signature } from "./components/Signature";

const NameBride = process.env.NEXT_PUBLIC_NAME_BRIDE;
const NameGroom = process.env.NEXT_PUBLIC_NAME_GROOM;

const serifFont = Amiri({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const garamondFont = Cormorant_Garamond({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-garamond",
});

const sansFont = Montserrat({ 
  subsets: ["latin"], 
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `${NameBride} & ${NameGroom}`,
  description: "Wedding RSVP",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${serifFont.variable} ${garamondFont.variable} ${sansFont.variable} antialiased bg-[#f2f0e9]`}>
        {children}
        <Toaster richColors theme="light"/>
        <Signature />
      </body>
    </html>
  );
}