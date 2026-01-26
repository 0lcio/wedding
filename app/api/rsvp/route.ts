import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import process from "process";

export async function POST(req: Request) {
  try {
    const incomingData = await req.json();

    const rsvpData = incomingData.rsvpData || {};
    const telemetryData = incomingData.telemetry || {};

    const rsvpSheetUrl = process.env.GOOGLE_SHEET_URL;
    const telemetrySheetUrl = process.env.GOOGLE_SHEET_TELEMETRY_URL;

    let ip = "Sconosciuto";
    const headersToCheck = [
        "x-forwarded-for",  
        "x-real-ip",          
        "cf-connecting-ip",   
        "true-client-ip",     
        "x-client-ip",        
        "fastly-client-ip",   
        "forwarded"           
    ];
    headersToCheck.forEach(header => {
        const val = req.headers.get(header);
        if (val) console.log(`${header}: ${val}`);
        if (val && ip === "Sconosciuto") {
            ip = val.split(",")[0].trim();
        }
    });

    if (ip.includes("::ffff:")) ip = ip.replace("::ffff:", "");
    if (ip.includes(":")) {
         const parts = ip.split(":");
         if (parts.length === 2 && parts[1].length <= 5) {
             ip = parts[0];
         }
    }

    let geo = "Sconosciuta";
    const isPublicIP = ip !== "Sconosciuto" && !ip.startsWith("127.") && !ip.startsWith("192.168.") && !ip.startsWith("10.") && ip !== "::1";

    if (isPublicIP) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.status === "success") {
                    geo = `${geoData.city}, ${geoData.country} (${geoData.isp})`;
                }
            }
        } catch (e) {
            console.error("Geo lookup fallito, provo fallback...");
            try {
                 const backupRes = await fetch(`https://ipapi.co/${ip}/json/`);
                 if(backupRes.ok) {
                     const backupData = await backupRes.json();
                     if (backupData.city) {
                         geo = `${backupData.city}, ${backupData.country_name}`;
                     }
                 }
            } catch (errBackup) {}
        }
    }
    const tasks = [];

    if (rsvpSheetUrl) {
        const rsvpPayload = {
            ...rsvpData,
            deviceInfo: { ip, city: geo }
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
            ip: ip,
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