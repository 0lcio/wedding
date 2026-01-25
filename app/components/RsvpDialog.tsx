"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  firstName: z.string().min(2, "Il nome è obbligatorio"),
  lastName: z.string().min(2, "Il cognome è obbligatorio"),
  isAttending: z.enum(["yes", "no"]),
  guests: z.string().optional(),
  intolerances: z.string().optional(),
  needsHotel: z.boolean().optional(),
  notes: z.string().optional(),
});

export default function RsvpDialog() {
  const [open, setOpen] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false); // Stato per il dialog di conferma uscita
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      needsHotel: false,
      guests: "",
      intolerances: "",
      notes: "",
    },
  });

  const isAttending = form.watch("isAttending");
  
  // LOGICA FONDAMENTALE: controlliamo se il form è "sporco" (l'utente ha digitato qualcosa)
  const { isDirty } = form.formState;

  // Questa funzione gestisce il tentativo di apertura/chiusura del Dialog principale
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setOpen(true);
    } else {
      // Se sta provando a chiudere (isOpen è false)
      if (isDirty) {
        // Se ha scritto qualcosa, blocchiamo la chiusura e mostriamo l'alert
        setShowExitAlert(true);
      } else {
        // Se non ha scritto nulla, chiudiamo direttamente
        setOpen(false);
      }
    }
  };

  // Se conferma di voler uscire perdendo i dati
  const handleConfirmExit = () => {
    setShowExitAlert(false); // Chiude l'alert
    setOpen(false);          // Chiude il form
    form.reset();            // Pulisce il form
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500)); // Un po' di delay realistico

    console.log("Dati inviati:", values);

    values.isAttending === "yes"
        ? toast.success("Fantastico! ", {
          description: "Non vediamo l'ora di festeggiare con te!", position: "bottom-center"} )
        : toast.info("Ci dispiace!", {
          description: "Grazie comunque per averci avvisato!", position: "bottom-center"});

    setIsLoading(false);
    setOpen(false);
    form.reset(); 
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="mt-8 px-6 py-2 border border-stone-800 text-stone-800 font-sans text-[11px] tracking-widest uppercase hover:bg-stone-800 hover:text-white transition-colors">
            Sarai presente?
          </button>
        </DialogTrigger>
        
        <DialogContent 
          className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-[#EBE9E4]"
          onInteractOutside={(e) => {
            if (isDirty) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-stone-900 uppercase tracking-widest">
              Répondez s'il vous plaît
            </DialogTitle>
            <DialogDescription className="text-stone-600 font-sans text-xs tracking-wide">
              Compila il modulo per confermare la tua presenza.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-stone-800">Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-stone-800">Cognome</FormLabel>
                      <FormControl>
                        <Input placeholder="Rossi" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isAttending"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-stone-800">Parteciperai al matrimonio?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" className="bg-white"/>
                          </FormControl>
                          <FormLabel className="font-normal">
                            Sì, sarò presente!
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" className="bg-white"/>
                          </FormControl>
                          <FormLabel className="font-normal">
                            No, purtroppo non potrò esserci...
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isAttending === "yes" && (
                <div className="space-y-4 border-t border-stone-300 pt-4 animate-in fade-in slide-in-from-top-2">
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-stone-800">Accompagnatori</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Inserisci i nomi di chi verrà con te" 
                            className="resize-none bg-white" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Lascia vuoto se vieni solo/a.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="intolerances"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-stone-800">Allergie o Intolleranze</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. Celiachia, vegetariano..." {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="needsHotel"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-stone-800">Pernottamento</FormLabel>
                          <FormDescription>
                            Hai bisogno di una stanza? Pagato da noi!
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-stone-800">Note aggiuntive</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Messaggio per gli sposi..." className="bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-stone-800 hover:bg-stone-700 text-white uppercase tracking-widest"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Invio in corso..." : "Conferma"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG DI CONFERMA CHIUSURA */}
      <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
        <AlertDialogContent className="bg-[#EBE9E4]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-stone-900 uppercase">Sei sicuro di voler uscire?</AlertDialogTitle>
            <AlertDialogDescription className="text-stone-600">
              Hai inserito delle informazioni nel modulo. Se esci ora, i dati andranno persi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-stone-400 hover:bg-stone-200 text-stone-800">
              Continua a compilare
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmExit}
              className="bg-red-900 hover:bg-red-800 text-white"
            >
              Esci
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}