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
      <DialogTrigger className="underline hover:text-stone-600 transition-colors">
        Privacy Policy
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Informativa sulla Privacy</DialogTitle>
          <DialogDescription>
            Come trattiamo i tuoi dati per questo evento.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full pr-4 text-sm text-stone-600 space-y-4">
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-stone-800 mb-1">1. Chi siamo</h3>
              <p>
                I titolari del trattamento sono gli sposi (Gaia e Bledar). I dati raccolti servono esclusivamente per l'organizzazione del matrimonio.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-stone-800 mb-1">2. Dati raccolti</h3>
              <p>Raccogliamo le informazioni che inserisci volontariamente (Nome, Cognome, Preferenze alimentari, ecc.) per gestire la tua presenza.</p>
              
              <p className="mt-2 font-semibold">Dati tecnici e di sicurezza:</p>
              <p>
                Per garantire la sicurezza del sito e prevenire spam o attacchi informatici, il sistema processa temporaneamente dati tecnici come l'indirizzo IP e il tipo di browser.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-stone-800 mb-1">3. Finalità e Base Giuridica</h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Gestione Evento:</strong> Organizzare il catering e i posti. Il trattamento delle preferenze alimentari (intolleranze/allergie) avviene sulla base del tuo <strong>Consenso esplicito</strong>.
                </li>
                <li>
                  <strong>Sicurezza:</strong> Proteggere il modulo da bot e accessi non autorizzati (Base giuridica: Legittimo Interesse del titolare).
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-stone-800 mb-1">4. Condivisione dei dati</h3>
              <p>
                I tuoi dati sono salvati su servizi cloud sicuri (Google Cloud/Drive, Upstash, Gmail) e non verranno mai ceduti a terzi per marketing.
              </p>
            </section>
            
             <section>
              <h3 className="font-bold text-stone-800 mb-1">5. I tuoi diritti</h3>
              <p>
                Puoi chiederci di modificare o cancellare i tuoi dati in qualsiasi momento contattandoci direttamente.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}