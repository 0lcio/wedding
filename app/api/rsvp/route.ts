import { NextResponse } from "next/server";
import { Resend } from "resend"; 
import process from "process";
import { rsvpSchema } from "@/lib/schemas";
import { ratelimit } from "@/lib/ratelimit";

// Inizializza Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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

    let finalNotes = rsvpData.notes || "";
    if (rsvpData.isAttending === "maybe" && rsvpData.maybeReason) {
        finalNotes = `MOTIVO FORSE: ${rsvpData.maybeReason} — ${finalNotes}`;
    }

    const tasks = [];

    if (rsvpSheetUrl) {
        const rsvpPayload = {
            ...rsvpData,
            notes: finalNotes,
        };
        tasks.push(
            fetch(rsvpSheetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rsvpPayload),
            }).catch(e => console.error("Err RSVP Sheet:", e))
        );
    }

    if (rsvpData.email) {
        
        const rawName = rsvpData.firstName || "Carissimo";
        const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        
        let subject = "";
        let htmlBody = "";
        let textBody = "";
        
        const imageUrl = "https://gaiasposabledar.me/bleGaia.jpg";

        if (rsvpData.isAttending === "yes") {
            subject = "Conferma Ricevuta! 🎉 Ci vediamo al matrimonio!";
            textBody = `Ciao ${firstName}!\n\nSiamo felicissimi che tu abbia confermato la tua presenza. Non vediamo l'ora di festeggiare con te!\n\nAbbiamo salvato le tue preferenze.\n\nA presto,\nGli Sposi`;
            htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Ciao ${firstName}!</h2>
                    <p style="font-size: 16px; color: #555;">
                        Siamo felicissimi che tu abbia confermato la tua presenza.<br>
                        Non vediamo l'ora di festeggiare con te!
                    </p>
                    <div style="margin: 20px 0; text-align: center;">
                        <img src="${imageUrl}" style="max-width: 100%; border-radius: 8px;" />
                    </div>
                    <p style="font-size: 14px; color: #777;">
                        Abbiamo salvato le tue preferenze. A presto,<br>
                        <strong>Gli Sposi</strong>
                    </p>
                </div>
            `;

        } else if (rsvpData.isAttending === "no") {
            subject = "Ci dispiace che non potrai esserci";
            textBody = `Ciao ${firstName}!\n\nSiamo felicissimi che tu abbia confermato la tua presenza. Non vediamo l'ora di festeggiare con te!\n\nAbbiamo salvato le tue preferenze.\n\nA presto,\nGli Sposi`;
            htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Ciao ${firstName},</h2>
                    <p style="font-size: 16px; color: #555;">
                        Grazie per averci risposto.<br>Ci dispiace molto che non potrai essere dei nostri nel nostro giorno speciale, 
                        ma capiamo perfettamente e ti ringraziamo per avercelo comunicato.
                    </p>
                    <p style="font-size: 14px; color: #777; margin-top: 30px;">
                        Un caro saluto,<br>
                        <strong>Gaia & Bledar</strong>
                    </p>
                </div>
            `;

        } else {
            subject = "Grazie per la risposta (In attesa di conferma)";
            textBody = `Ciao ${firstName}!\n\nSiamo felicissimi che tu abbia confermato la tua presenza. Non vediamo l'ora di festeggiare con te!\n\nAbbiamo salvato le tue preferenze.\n\nA presto,\nGli Sposi`;
            htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Ciao ${firstName},</h2>
                    <p style="font-size: 16px; color: #555;">
                        Abbiamo ricevuto la tua risposta temporanea ("Forse").
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Non preoccuparti, sappiamo che a volte è difficile organizzarsi con largo anticipo.<br>
                        Ti chiediamo gentilmente di farci sapere una risposta definitiva appena ti sarà possibile, <br>
                        così da aiutarci con l'organizzazione.
                    </p>
                    <p style="font-size: 14px; color: #777; margin-top: 30px;">
                        A presto,<br>
                        <strong>Gaia & Bledar</strong>
                    </p>
                </div>
            `;
        }

        const fromEmail = "Gaia & Bledar <wedding@gaiasposabledar.me>";
        
        const replyToEmail = process.env.GMAIL_USER || "wedding.gaiabledar@gmail.com";

        tasks.push(
            resend.emails.send({
                from: fromEmail,
                to: rsvpData.email,
                subject: subject,
                html: htmlBody,
                text: textBody,
            }).catch(e => console.error("Errore Resend:", e))
        );
    }

    await Promise.all(tasks);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Errore API:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}