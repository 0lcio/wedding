import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const googleSheetUrl = process.env.GOOGLE_SHEET_URL;

    // --- 1. CONFIGURAZIONE EMAIL (GMAIL) ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // --- 4. INVIO MAIL CON IMMAGINE ---
    if (data.isAttending === "yes" && data.email) {
      // Costruiamo l'URL dell'immagine
      // Se sei in locale usa un placeholder, se sei online usa il tuo sito
      const siteUrl = "http://localhost:3000";
      const imageUrl = `${siteUrl}/bleGaia.jpg`; // Assicurati che il nome file sia giusto in /public

      const mailOptions = {
        from: `"Gaia & Bledar" <${process.env.GMAIL_USER}>`,
        to: data.email,
        subject: "Conferma Ricevuta! 🎉 Ci vediamo al matrimonio!",
        html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Ciao ${data.firstName}!</h2>
                    <p style="font-size: 16px; color: #555;">
                        Siamo felicissimi che tu abbia confermato la tua presenza.
                        Non vediamo l'ora di festeggiare con te!
                    </p>
                    
                    <div style="margin: 20px 0; text-align: center;">
                        <img src="${imageUrl}" alt="Grazie" style="max-width: 100%; border-radius: 8px;" />
                    </div>

                    <p style="font-size: 14px; color: #777;">
                        Abbiamo salvato le tue preferenze (eventuali intolleranze o note).
                        Se devi cambiare qualcosa, scrivici pure!
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        A presto,<br>
                        <strong>Gli Sposi</strong>
                    </p>
                </div>
            `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email inviata a:", data.email);
      if (googleSheetUrl) {
        await fetch(googleSheetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore API:", error);
    return NextResponse.json(
      { success: false, error: "Errore server" },
      { status: 500 },
    );
  }
}
