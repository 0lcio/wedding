import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import process from "process";
import { isEmailAllowed } from "@/lib/allowed-domains";
import { rsvpSchema } from "@/lib/schemas";
import { ratelimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Troppe richieste. Riprova tra un minuto." },
        { status: 429 }
      );
    }

    // 2. RECUPERO E VALIDAZIONE DATI
    const incomingData = await req.json();
    const parsed = rsvpSchema.safeParse(incomingData.rsvpData);

    if (!parsed.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Dati non validi", 
          details: parsed.error.format() 
        }, 
        { status: 400 }
      );
    }

    const rsvpData = parsed.data;
    const rsvpSheetUrl = process.env.GOOGLE_SHEET_URL;

    // Gestione note condizionali (motivo "Forse")
    let finalNotes = rsvpData.notes || "";
    if (rsvpData.isAttending === "maybe" && rsvpData.maybeReason) {
        finalNotes = `MOTIVO FORSE: ${rsvpData.maybeReason} ${finalNotes}`;
    }

    const tasks = [];

    // 3. SALVATAGGIO SU GOOGLE SHEET (Solo dati essenziali)
    if (rsvpSheetUrl) {
        const rsvpPayload = {
            ...rsvpData,
            notes: finalNotes,
            // Rimosso deviceInfo/IP/Geo per privacy
        };
        tasks.push(
            fetch(rsvpSheetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rsvpPayload),
            }).catch(e => console.error("Err RSVP Sheet:", e))
        );
    }

    // 4. INVIO EMAIL DI CONFERMA (Solo se partecipa)
    if (rsvpData.isAttending === "yes" && rsvpData.email) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const rawName = rsvpData.firstName || "Carissimo";
        const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        const imagePath = path.join(process.cwd(), 'public', 'bleGaia.jpg');

        const mailOptions = {
            from: `"Gaia & Bledar" <${process.env.GMAIL_USER}>`,
            to: rsvpData.email,
            subject: "Conferma Ricevuta! 🎉 Ci vediamo al matrimonio!",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Ciao ${firstName}!</h2>
                    <p style="font-size: 16px; color: #555;">
                        Siamo felicissimi che tu abbia confermato la tua presenza.
                        Non vediamo l'ora di festeggiare con te!
                    </p>
                    <div style="margin: 20px 0; text-align: center;">
                        <img src="cid:wedding-image-unique-id" alt="Grazie" style="max-width: 100%; border-radius: 8px;" />
                    </div>
                    <p style="font-size: 14px; color: #777;">
                        Abbiamo salvato le tue preferenze. A presto,<br>
                        <strong>Gli Sposi</strong>
                    </p>
                </div>
            `,
            attachments: [{
                filename: 'bleGaia.jpg',
                path: imagePath,
                cid: 'wedding-image-unique-id'
            }]
        };

        tasks.push(transporter.sendMail(mailOptions).catch(e => console.error("Errore Mail:", e)));
    }

    await Promise.all(tasks);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Errore API:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}