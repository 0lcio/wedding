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
    
    // Chiediamo a Upstash se questo IP può passare
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
    const telemetryData = incomingData.telemetry || {};

    const rsvpSheetUrl = process.env.GOOGLE_SHEET_URL;
    const telemetrySheetUrl = process.env.GOOGLE_SHEET_TELEMETRY_URL;

    const headersToCheck = [
        "x-forwarded-for",
        "x-real-ip",
        "cf-connecting-ip",
        "true-client-ip",
        "x-client-ip",
        "forwarded",
        "x-cluster-client-ip",
        "fastly-client-ip"
    ];

    let allIpsLog = ""; 
    let candidateIpForGeo: string | undefined = undefined; 

    headersToCheck.forEach(header => {
        const val = req.headers.get(header);
        if (val) {
            allIpsLog += `${header}: ${val} || `;
        }
    });

    if (!allIpsLog) allIpsLog = "Nessun Header IP trovato (probabile localhost o proxy nascosto)";

    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const foundIps = allIpsLog.match(ipRegex) || [];

    for (const ip of foundIps) {
        if (!ip.startsWith("10.") && 
            !ip.startsWith("192.168.") && 
            !ip.startsWith("127.") && 
            !ip.startsWith("172.")) {
            candidateIpForGeo = ip;
            break; 
        }
    }

    if (!candidateIpForGeo && foundIps.length > 0) {
        const firstIp = foundIps[0];
        if (firstIp) {
            candidateIpForGeo = firstIp;
        }
    }

    let geo = "Sconosciuta";
    
    if (candidateIpForGeo && candidateIpForGeo !== "127.0.0.1") {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const geoRes = await fetch(`https://ipapi.co/${candidateIpForGeo}/json/`, {
                signal: controller.signal,
                headers: { 
                    'User-Agent': 'Wedding-RSVP-App/1.0' 
                }
            });
            clearTimeout(timeoutId);

            if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.city) {
                    geo = `${geoData.city}, ${geoData.country_name}`;
                    if (geoData.org) geo += ` (${geoData.org})`;
                }
            }
        } catch (e) {
        }
    }

    const tasks = [];
    
    let finalNotes = rsvpData.notes || "";
    if (rsvpData.isAttending === "maybe" && rsvpData.maybeReason) {
        finalNotes = `MOTIVO FORSE: ${rsvpData.maybeReason} ${finalNotes}`;
    }

    if (rsvpSheetUrl) {
        const rsvpPayload = {
            ...rsvpData,
            notes: finalNotes,
            deviceInfo: { ip: allIpsLog, city: geo } 
        };
        tasks.push(
            fetch(rsvpSheetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rsvpPayload),
            }).catch(e => console.error("Err RSVP Sheet:", e))
        );
    }

    if (telemetrySheetUrl) {
        const telemetryPayload = {
            rsvpData: rsvpData,
            telemetry: telemetryData,
            ip: allIpsLog,
            geo: geo
        };
        tasks.push(
            fetch(telemetrySheetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(telemetryPayload),
            }).catch(e => console.error("Err Telemetry Sheet:", e))
        );
    }

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