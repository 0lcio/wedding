import { NextResponse } from "next/server";
import { Resend } from "resend";
import process from "process";
import { rsvpSchema } from "@/lib/schemas";
import { ratelimit } from "@/lib/ratelimit";

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
        { success: false, error: "Dati non validi", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const rsvpData = parsed.data;
    const rsvpSheetUrl = process.env.GOOGLE_SHEET_URL;

    let finalNotes = rsvpData.notes || "";
    if (rsvpData.isAttending === "maybe" && rsvpData.maybeReason) {
        finalNotes = `MOTIVO FORSE: ${rsvpData.maybeReason} — ${finalNotes}`;
    }

    const tasks: Promise<any>[] = [];

    if (rsvpSheetUrl) {
        const rsvpPayload = { ...rsvpData, notes: finalNotes };
        tasks.push(
            fetch(rsvpSheetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rsvpPayload),
            }).catch(e => console.error("Err RSVP Sheet:", e))
        );
    }

    let imageBuffer: Buffer | null = null;
    
    if (rsvpData.email && rsvpData.isAttending === "yes") {
        try {
            const imageUrl = "https://gaiasposabledar.me/bleGaia.jpg"; 
            const response = await fetch(imageUrl);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                imageBuffer = Buffer.from(arrayBuffer);
            } else {
                console.error("Impossibile scaricare immagine:", response.statusText);
            }
        } catch (e) {
            console.error("Errore fetch immagine:", e);
        }
    }

    if (rsvpData.email) {
        
        const rawName = rsvpData.firstName || "Carissimo";
        const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        
        let subject = "";
        let htmlBody = "";
        let attachments = [];

        if (rsvpData.isAttending === "yes") {
            subject = "Conferma Ricevuta! 🎉 Ci vediamo al matrimonio!";
            
            const imgTag = imageBuffer 
                ? `<img src="cid:wedding-image-unique-id" alt="Grazie" style="max-width: 100%; border-radius: 8px;" />`
                : `<p>(Immagine non caricata)</p>`; 

            if (imageBuffer) {
                attachments.push({
                    filename: 'bleGaia.jpg',
                    content: imageBuffer,
                    content_id: 'wedding-image-unique-id', 
                });
            }

            htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Ciao ${firstName}!</h2>
                    <p style="font-size: 16px; color: #555;">
                        Siamo felicissimi che tu abbia confermato la tua presenza.<br>
                        Non vediamo l'ora di festeggiare con te!
                    </p>
                    <div style="margin: 20px 0; text-align: center;">
                        ${imgTag}
                    </div>
                    <p style="font-size: 14px; color: #777;">
                        Abbiamo salvato le tue preferenze. A presto,<br>
                        <strong>Gli Sposi</strong>
                    </p>
                </div>
            `;

        } else if (rsvpData.isAttending === "no") {
            subject = "Ci dispiace che non potrai esserci";
            htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Ciao ${firstName},</h2>
                    <p style="font-size: 16px; color: #555;">
                        Grazie per averci risposto.<br>Ci dispiace molto che non potrai essere dei nostri, ma capiamo perfettamente.
                    </p>
                    <p style="font-size: 14px; color: #777; margin-top: 30px;">
                        Un caro saluto,<br><strong>Gaia & Bledar</strong>
                    </p>
                </div>
            `;
        } else {
            subject = "Grazie per la risposta (In attesa di conferma)";
            htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Ciao ${firstName},</h2>
                    <p style="font-size: 16px; color: #555;">
                        Abbiamo ricevuto la tua risposta temporanea ("Forse").<br>
                        Facci sapere appena puoi!
                    </p>
                    <p style="font-size: 14px; color: #777; margin-top: 30px;">
                        A presto,<br><strong>Gaia & Bledar</strong>
                    </p>
                </div>
            `;
        }

        const fromEmail = "Gaia & Bledar <noreply@gaiasposabledar.me>";
        const replyToEmail = process.env.GMAIL_USER || "wedding.gaiabledar@gmail.com";

        tasks.push(
            resend.emails.send({
                from: fromEmail,
                to: rsvpData.email,
                replyTo: replyToEmail,
                subject: subject,
                html: htmlBody,
                attachments: attachments, 
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