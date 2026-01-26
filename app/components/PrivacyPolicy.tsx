import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PrivacyPolicy() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="underline cursor-pointer hover:text-stone-800 transition-colors">
          Termini e Privacy Policy
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[80vh] flex flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Informativa Privacy</DialogTitle>
          <DialogDescription>
            Come trattiamo i tuoi dati per il matrimonio.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 text-sm text-stone-600 leading-relaxed">
          <div className="space-y-4">
            <section>
              <h4 className="font-bold text-stone-800 mb-1">1. Titolare del Trattamento</h4>
              <p>
                I dati sono raccolti da <strong>Gaia & Bledar</strong> (gli "Sposi") esclusivamente per l'organizzazione del matrimonio.
              </p>
            </section>

            <section>
              <h4 className="font-bold text-stone-800 mb-1">2. Dati Raccolti</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Dati Personali:</strong> Nome, cognome, email, numero di telefono.</li>
                <li><strong>Preferenze:</strong> Intolleranze alimentari, necessità di hotel, accompagnatori.</li>
                <li><strong>Dati Tecnici:</strong> Indirizzo IP, informazioni sul dispositivo (browser, risoluzione schermo, sistema operativo) e, previo consenso del dispositivo, dati di geolocalizzazione approssimativa.</li>
              </ul>
            </section>

            <section>
              <h4 className="font-bold text-stone-800 mb-1">3. Finalità</h4>
              <p>
                I dati personali servono per gestire gli inviti, il catering e la logistica. 
                I dati tecnici (IP, device fingerprint) vengono utilizzati esclusivamente per <strong>fini di sicurezza</strong>, prevenzione spam e per garantire il corretto funzionamento del sito web.
              </p>
            </section>

            <section>
              <h4 className="font-bold text-stone-800 mb-1">4. Condivisione dei Dati</h4>
              <p>
                I dati non saranno mai venduti. Vengono processati tramite servizi terzi sicuri:
                Google (Fogli di calcolo), Appwrite (Hosting/Database) e servizi di invio email transazionali.
              </p>
            </section>

            <section>
              <h4 className="font-bold text-stone-800 mb-1">5. Diritti dell'Utente</h4>
              <p>
                In qualsiasi momento puoi richiedere la modifica o la cancellazione dei tuoi dati contattando direttamente gli Sposi.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}