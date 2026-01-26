"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; 

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

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

import { collectTelemetry } from "@/lib/telemetry";

// --------------------------------------------------------
// 1. SCHEMA CON VALIDAZIONE CONDIZIONALE TOTALE
// --------------------------------------------------------
const formSchema = z.object({
  firstName: z.string().min(2, "Il nome è obbligatorio"),
  lastName: z.string().min(2, "Il cognome è obbligatorio"),
  email: z.string().optional(), // Validato sotto
  
  isAttending: z.enum(["yes", "no"]),
  
  // Campi base opzionali (la logica stringente è in superRefine)
  hasGuests: z.boolean().optional(),
  guests: z.string().optional(),

  hasIntolerances: z.boolean().optional(),
  intolerances: z.string().optional(),

  hasFoodPreferences: z.boolean().optional(),
  foodPreferenceType: z.enum(["Vegetariano", "Vegano", "Altro"]).optional(),

  needsHotel: z.boolean().optional(),
  notes: z.string().optional(),
})
.superRefine((data, ctx) => {
  // SE NON PARTECIPA, tutto ok, esci.
  if (data.isAttending !== "yes") return;

  // --- 1. VALIDAZIONE EMAIL ---
  if (!data.email || !z.string().email().safeParse(data.email).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Inserisci un'email valida",
      path: ["email"],
    });
  }

  // --- 2. VALIDAZIONE OSPITI ---
  if (data.hasGuests === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleziona Sì o No", path: ["hasGuests"] });
  } else if (data.hasGuests === true) {
    // Se ha detto SI, deve scrivere i nomi
    if (!data.guests || data.guests.trim().length < 2) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Inserisci i nomi degli accompagnatori", 
        path: ["guests"] 
      });
    }
  }

  // --- 3. VALIDAZIONE INTOLLERANZE ---
  if (data.hasIntolerances === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleziona Sì o No", path: ["hasIntolerances"] });
  } else if (data.hasIntolerances === true) {
    // Se ha detto SI, deve specificare quali
    if (!data.intolerances || data.intolerances.trim().length < 3) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Specifica le intolleranze", 
        path: ["intolerances"] 
      });
    }
  }

  // --- 4. VALIDAZIONE CIBO ---
  if (data.hasFoodPreferences === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleziona Sì o No", path: ["hasFoodPreferences"] });
  } else if (data.hasFoodPreferences === true) {
    // Se ha detto SI, deve scegliere il tipo
    if (!data.foodPreferenceType) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Seleziona un'opzione", 
        path: ["foodPreferenceType"] 
      });
    }
  }

  // --- 5. VALIDAZIONE HOTEL ---
  if (data.needsHotel === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleziona Sì o No", path: ["needsHotel"] });
  }
});

// 2. COMPONENTE TOGGLE (Invariato)
const ToggleSection = ({ 
    label, 
    value, 
    onChange, 
    description,
    children,
    error 
  }: { 
    label: string; 
    value: boolean | undefined; 
    onChange: (val: boolean) => void; 
    description?: React.ReactNode;
    children?: React.ReactNode;
    error?: boolean;
  }) => (
    <div className={cn(
        "rounded-lg border bg-white p-3 shadow-sm transition-all duration-300",
        error ? "border-red-500 ring-1 ring-red-500" : "border-stone-200"
    )}>
      <div className="flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <span className={cn("text-sm font-medium block", error ? "text-red-600" : "text-stone-800")}>
            {label}
          </span>
          {description && <p className="text-[10px] text-stone-500 leading-tight">{description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(true)}
            className={cn(
              "h-7 px-4 text-xs rounded-md transition-all border",
              value === true 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold shadow-sm"
                : "bg-stone-50 text-stone-500 border-transparent hover:bg-stone-100"
            )}
          >
            Sì
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(false)}
            className={cn(
              "h-7 px-4 text-xs rounded-md transition-all border",
              value === false 
                ? "bg-rose-50 text-rose-700 border-rose-200 font-bold shadow-sm"
                : "bg-stone-50 text-stone-500 border-transparent hover:bg-stone-100"
            )}
          >
            No
          </Button>
        </div>
      </div>

      {value === true && children && (
        <div className="mt-3 pt-3 border-t border-stone-100 animate-in fade-in slide-in-from-top-1 duration-300">
          {children}
        </div>
      )}
    </div>
  );

export default function RsvpDialog() {
  const [open, setOpen] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      isAttending: undefined, 
      hasGuests: undefined,
      guests: "",
      hasIntolerances: undefined,
      intolerances: "",
      hasFoodPreferences: undefined,
      needsHotel: undefined,
      notes: "",
    },
  });

  const isAttending = form.watch("isAttending");
  const hasGuests = form.watch("hasGuests");
  const hasIntolerances = form.watch("hasIntolerances");
  const hasFoodPreferences = form.watch("hasFoodPreferences");
  const { isDirty } = form.formState;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setOpen(true);
    } else {
      if (isDirty) {
        setShowExitAlert(true);
      } else {
        setOpen(false);
      }
    }
  };

  const handleConfirmExit = () => {
    setShowExitAlert(false);
    setOpen(false);
    form.reset();
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {

    setIsLoading(true);
    
    const telemetryData = await collectTelemetry();

    const fullPayload = {
        rsvpData: values,
        telemetry: telemetryData
    };

    try {
      // 1. Chiamata alla TUA API (che poi gira tutto a Google Sheets)
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });

      if (!response.ok) {
        throw new Error("Errore durante l'invio");
      }

      values.isAttending === "yes"
        ? toast.success("Fantastico!", {
            description: "La tua presenza è stata registrata!",
            position: "bottom-center",
          })
        : toast.info("Ci dispiace!", {
            description: "Grazie comunque per averci avvisato!",
            position: "bottom-center",
          });

      // 3. Chiudi e pulisci il form
      setOpen(false);
      form.reset();

    } catch (error) {
      console.error(error);
      toast.error("Errore di connessione", {
        description: "Non siamo riusciti a salvare la risposta. Riprova.",
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
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
          onOpenAutoFocus={(e) => e.preventDefault()}
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
                        <Input placeholder="Mario" {...field} className="bg-white capitalize" />
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
                        <Input placeholder="Rossi" {...field} className="bg-white capitalize" />
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
                            <RadioGroupItem value="yes" className="bg-white text-emerald-600 border-stone-300"/>
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Sì, sarò presente!
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" className="bg-white text-stone-600 border-stone-300"/>
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
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
                  
                  {/* --- EMAIL --- */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-stone-800">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="mario.rossi@email.com" 
                            {...field} 
                            className="bg-white" 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px] text-stone-500">
                          Ti invieremo qui la conferma della prenotazione.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* --- ACCOMPAGNATORI --- */}
                  <FormField
                    control={form.control}
                    name="hasGuests"
                    render={({ field }) => (
                      <FormItem>
                         <ToggleSection 
                            label="Sarai accompagnato?"
                            description="Amici o familiari che verranno con te"
                            value={field.value} 
                            onChange={field.onChange}
                            error={!!form.formState.errors.hasGuests}
                          >
                             <FormField
                                control={form.control}
                                name="guests"
                                render={({ field: guestField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Inserisci i nomi dei tuoi accompagnatori" 
                                        className="bg-stone-50 border-stone-200 resize-none focus:bg-white transition-colors" 
                                        {...guestField}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                          </ToggleSection>
                          <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* --- INTOLLERANZE --- */}
                  <FormField
                    control={form.control}
                    name="hasIntolerances"
                    render={({ field }) => (
                      <FormItem>
                        <ToggleSection 
                          label="Allergie o Intolleranze?" 
                          description="Celiachia, lattosio, ecc."
                          value={field.value} 
                          onChange={field.onChange}
                          error={!!form.formState.errors.hasIntolerances}
                        >
                          <FormField
                              control={form.control}
                              name="intolerances"
                              render={({ field: intolField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Es. allergia alle noci..." 
                                      className="bg-stone-50 border-stone-200 resize-none focus:bg-white transition-colors" 
                                      {...intolField}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </ToggleSection>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                   {/* --- PREFERENZE CIBO --- */}
                   <FormField
                    control={form.control}
                    name="hasFoodPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <ToggleSection 
                          label="Segui un regime alimentare?" 
                          description="Vegetariano, vegano, ecc."
                          value={field.value} 
                          onChange={field.onChange}
                          error={!!form.formState.errors.hasFoodPreferences}
                        >
                           <FormField
                                control={form.control}
                                name="foodPreferenceType"
                                render={({ field: typeField }) => (
                                  <FormItem>
                                    <RadioGroup 
                                      onValueChange={typeField.onChange} 
                                      defaultValue={typeField.value}
                                      className="flex flex-col gap-3"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Vegetariano" id="veg" className="bg-stone-100" />
                                        <label htmlFor="veg" className="text-sm font-medium text-stone-700 cursor-pointer">Vegetariano</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Vegano" id="vegan" className="bg-stone-100" />
                                        <label htmlFor="vegan" className="text-sm font-medium text-stone-700 cursor-pointer">Vegano</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Altro" id="other" className="bg-stone-100" />
                                        <label htmlFor="other" className="text-sm font-medium text-stone-700 cursor-pointer">
                                          Altro <span className="text-stone-400 text-xs font-normal ml-1 italic">"Dai, non esagerare..." -Ble</span>
                                        </label>
                                      </div>
                                    </RadioGroup>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                        </ToggleSection>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* --- PERNOTTAMENTO --- */}
                  <FormField
                    control={form.control}
                    name="needsHotel"
                    render={({ field }) => (
                      <FormItem>
                        <ToggleSection 
                          label="Pernottamento" 
                          description={
                            <>
                                Festeggiamo fino a tardi! 🕺🥂💃
                                <br />
                                L'hotel è già pagato, vi fermate a dormire?
                            </>
                          }
                          value={field.value} 
                          onChange={field.onChange} 
                          error={!!form.formState.errors.needsHotel}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* --- NOTE --- */}
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