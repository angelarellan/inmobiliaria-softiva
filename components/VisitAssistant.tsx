"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import type { OperationType, PropertySummary } from "@/lib/types";
import { formatPropertyPrice, formatVisitDate } from "@/lib/format";
import { propertyPath, propertyUrl } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  BUDGET_OPTIONS,
  matchesBudget,
  slotsFor,
  upcomingVisitDays,
  type BudgetOption,
} from "@/lib/visit-options";
import {
  OPEN_ASSISTANT_EVENT,
  type OpenAssistantDetail,
} from "@/lib/assistant-events";

type Step =
  | "loading"
  | "operation"
  | "zone"
  | "budget"
  | "results"
  | "noMatch"
  | "day"
  | "slot"
  | "name"
  | "phone"
  | "confirm"
  | "sending"
  | "done"
  | "error";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  cards?: PropertySummary[];
  /** Las tarjetas de resultados se pueden elegir (solo las del último resultado). */
  choosable?: boolean;
  summary?: string[];
}

type BotItem = Omit<Message, "id" | "from">;

const ANY_ZONE = "Cualquier zona";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function shortDay(iso: string) {
  const label = formatVisitDate(iso);
  const [weekday, date] = label.split(" ");
  return `${weekday.slice(0, 3).replace(/^./, (c) => c.toUpperCase())} ${date}`;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export default function VisitAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<Step>("loading");
  const [properties, setProperties] = useState<PropertySummary[] | null>(null);

  // Lo que va eligiendo la persona
  const [operation, setOperation] = useState<OperationType | null>(null);
  const [zone, setZone] = useState<string | null>(null);
  const [budget, setBudget] = useState<BudgetOption | null>(null);
  const [property, setProperty] = useState<PropertySummary | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const runId = useRef(0);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const started = useRef(false);

  const push = useCallback((from: Message["from"], item: BotItem) => {
    setMessages((m) => [...m, { id: nextId.current++, from, ...item }]);
  }, []);

  /** Muestra mensajes del asistente de a uno, con "escribiendo…" entre medio. */
  const botSay = useCallback(
    async (items: BotItem[], then?: () => void) => {
      const id = runId.current;
      for (const item of items) {
        setTyping(true);
        await wait(Math.min(1200, 450 + item.text.length * 12));
        if (id !== runId.current) return;
        setTyping(false);
        push("bot", item);
        await wait(150);
        if (id !== runId.current) return;
      }
      then?.();
    },
    [push]
  );

  const loadProperties = useCallback(async () => {
    try {
      const res = await fetch("/api/visit-properties", { cache: "no-store" });
      const body = await res.json();
      const list = (body.properties ?? []) as PropertySummary[];
      setProperties(list);
      return list;
    } catch {
      setProperties([]);
      return [];
    }
  }, []);

  const start = useCallback(
    async (propertyId?: string) => {
      runId.current += 1;
      started.current = true;
      setMessages([]);
      setTyping(false);
      setStep("loading");
      setOperation(null);
      setZone(null);
      setBudget(null);
      setProperty(null);
      setDay(null);
      setSlot(null);
      setName("");
      setPhone("");
      setInput("");
      setInputError(null);
      setErrorText(null);

      setTyping(true);
      const list = properties ?? (await loadProperties());
      const chosen = propertyId ? list.find((p) => p.id === propertyId) : undefined;

      if (chosen) {
        setProperty(chosen);
        setOperation(chosen.operation);
        await botSay(
          [
            { text: "¡Hola! Soy el asistente de visitas de AURA." },
            { text: `Coordinemos tu visita a esta propiedad:`, cards: [chosen] },
            { text: "¿Qué día te queda bien?" },
          ],
          () => setStep("day")
        );
        return;
      }

      await botSay(
        [
          {
            text: "¡Hola! Soy el asistente de visitas de AURA. Te ayudo a encontrar una propiedad y agendar la visita en un minuto.",
          },
          { text: "¿Estás buscando para comprar o para alquilar?" },
        ],
        () => setStep("operation")
      );
    },
    [botSay, loadProperties, properties]
  );

  // Abrir desde cualquier botón "Agendar visita"
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<OpenAssistantDetail>).detail;
      setOpen(true);
      if (detail?.propertyId || !started.current) void start(detail?.propertyId);
    };
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
  }, [start]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!started.current) void start();
  };

  // Siempre mostrar el último mensaje
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing, step]);

  // En celular el chat ocupa toda la pantalla: se bloquea el scroll de atrás
  useEffect(() => {
    if (!open || window.innerWidth >= 640) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (step === "name" || step === "phone") inputRef.current?.focus();
  }, [step]);

  // -------------------------------------------------------------------------
  // Pasos
  // -------------------------------------------------------------------------

  const zonesFor = (op: OperationType) =>
    Array.from(
      new Set((properties ?? []).filter((p) => p.operation === op).map((p) => p.neighborhood))
    ).sort((a, b) => a.localeCompare(b, "es"));

  const chooseOperation = (op: OperationType) => {
    setOperation(op);
    push("user", { text: op === "Venta" ? "Comprar" : "Alquilar" });
    setStep("loading");
    void botSay([{ text: "¿En qué zona te gustaría?" }], () => setStep("zone"));
  };

  const chooseZone = (z: string) => {
    setZone(z);
    push("user", { text: z });
    setStep("loading");
    void botSay([{ text: "¿Cuál es tu presupuesto aproximado?" }], () => setStep("budget"));
  };

  const chooseBudget = (b: BudgetOption) => {
    setBudget(b);
    push("user", { text: b.label });
    setStep("loading");
    const matches = (properties ?? [])
      .filter((p) => p.operation === operation)
      .filter((p) => !zone || zone === ANY_ZONE || p.neighborhood === zone)
      .filter((p) => matchesBudget(b, p.price, p.currency))
      .slice(0, 3);

    if (matches.length === 0) {
      void botSay(
        [
          { text: "Por ahora no tengo propiedades que coincidan con lo que buscás." },
          {
            text: "Podés ver todo el catálogo o escribirnos por WhatsApp y te avisamos apenas entre algo así.",
          },
        ],
        () => setStep("noMatch")
      );
      return;
    }

    void botSay(
      [
        {
          text:
            matches.length === 1
              ? "Encontré esta propiedad que te puede interesar:"
              : `Encontré ${matches.length} propiedades que te pueden interesar:`,
          cards: matches,
          choosable: true,
        },
        { text: "¿Cuál te gustaría visitar?" },
      ],
      () => setStep("results")
    );
  };

  const chooseProperty = (p: PropertySummary) => {
    setProperty(p);
    push("user", { text: `Quiero visitar "${p.title}"` });
    setStep("loading");
    void botSay([{ text: "¡Excelente elección! ¿Qué día te queda bien?" }], () =>
      setStep("day")
    );
  };

  const chooseDay = (d: string) => {
    setDay(d);
    push("user", { text: formatVisitDate(d) });
    setStep("loading");
    void botSay([{ text: "¿En qué horario?" }], () => setStep("slot"));
  };

  const chooseSlot = (s: string) => {
    setSlot(s);
    push("user", { text: s });
    setStep("loading");
    if (name && phone) {
      showSummary(name, phone, day, s);
      return;
    }
    void botSay([{ text: "Perfecto. ¿A nombre de quién agendo la visita?" }], () =>
      setStep("name")
    );
  };

  const showSummary = (n: string, ph: string, d: string | null, s: string | null) => {
    void botSay(
      [
        {
          text: "Revisá los datos de tu visita:",
          summary: [
            `Propiedad: ${property?.title ?? ""}`,
            `Día: ${d ? formatVisitDate(d) : ""}`,
            `Horario: ${s ?? ""}`,
            `Nombre: ${n}`,
            `Teléfono: ${ph}`,
          ],
        },
      ],
      () => setStep("confirm")
    );
  };

  const submitText = (e: FormEvent) => {
    e.preventDefault();
    const value = input.replace(/\s+/g, " ").trim();
    if (step === "name") {
      if (value.length < 2) {
        setInputError("Escribí tu nombre.");
        return;
      }
      setName(value);
      setInput("");
      setInputError(null);
      push("user", { text: value });
      setStep("loading");
      void botSay(
        [{ text: `Gracias, ${firstName(value)}. ¿A qué teléfono te confirmamos la visita?` }],
        () => setStep("phone")
      );
      return;
    }
    if (step === "phone") {
      if (value.replace(/\D/g, "").length < 8) {
        setInputError("Revisá el número (con código de área).");
        return;
      }
      setPhone(value);
      setInput("");
      setInputError(null);
      push("user", { text: value });
      setStep("loading");
      showSummary(name, value, day, slot);
    }
  };

  const confirm = async () => {
    if (!property || !day || !slot) return;
    push("user", { text: "Confirmar visita" });
    setStep("sending");
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          visitDate: day,
          timeSlot: slot,
          name,
          phone,
          operation: operation ?? property.operation,
          zone: zone ?? undefined,
          budget: budget?.label,
          website: trapRef.current?.value ?? "",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No pudimos agendar la visita.");
      }
      await botSay(
        [
          { text: `¡Listo, ${firstName(name)}! Tu visita quedó agendada.` },
          {
            text: "Un asesor te va a escribir para confirmarla. Si querés, mandanos el resumen por WhatsApp y te respondemos al toque.",
          },
        ],
        () => setStep("done")
      );
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "No pudimos agendar la visita.");
      await botSay(
        [
          {
            text: `Uy, no pude agendar la visita: ${
              error instanceof Error ? error.message : "probá de nuevo en un rato."
            }`,
          },
        ],
        () => setStep("error")
      );
    }
  };

  const changeDay = () => {
    push("user", { text: "Cambiar día u horario" });
    setStep("loading");
    void botSay([{ text: "Dale. ¿Qué día te queda bien?" }], () => setStep("day"));
  };

  const visitWhatsAppText = () =>
    [
      "Hola AURA Bienes Raíces, quiero confirmar una visita:",
      `• Propiedad: ${property?.title ?? ""}`,
      property ? `• Link: ${propertyUrl(property.slug)}` : "",
      `• Día: ${day ? formatVisitDate(day) : ""}`,
      `• Horario: ${slot ?? ""}`,
      `• Nombre: ${name}`,
      `• Teléfono: ${phone}`,
    ]
      .filter(Boolean)
      .join("\n");

  const searchWhatsAppText = () => {
    const parts = [
      `Hola AURA Bienes Raíces, estoy buscando para ${operation === "Alquiler" ? "alquilar" : "comprar"}`,
    ];
    if (zone && zone !== ANY_ZONE) parts.push(`en ${zone}`);
    if (budget && budget.id !== "any") parts.push(`con un presupuesto de ${budget.label.toLowerCase()}`);
    return `${parts.join(" ")}. ¿Me avisan si tienen algo así?`;
  };

  const lastCardsId = [...messages].reverse().find((m) => m.choosable)?.id;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Cerrar asistente de visitas" : "Agendar una visita"}
        aria-expanded={open}
        className="group fixed bottom-24 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-gold pl-4 pr-4 text-emerald shadow-lg shadow-emerald/30 transition-transform hover:scale-105 sm:pr-5"
      >
        {open ? <X size={24} /> : <CalendarCheck size={24} />}
        <span className="hidden text-sm font-semibold sm:inline">
          {open ? "Cerrar" : "Agendar visita"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Asistente de visitas"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-warm-white sm:inset-auto sm:bottom-40 sm:right-6 sm:h-[min(600px,calc(100dvh-12rem))] sm:w-[390px] sm:rounded-2xl sm:shadow-2xl sm:shadow-emerald/30 sm:ring-1 sm:ring-slate/10"
          >
            {/* Encabezado */}
            <div className="flex items-center gap-3 bg-emerald px-4 py-3 text-warm-white">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold font-serif-display text-lg text-emerald">
                A
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">Asistente de visitas</p>
                <p className="text-xs text-warm-white/70">AURA Bienes Raíces · responde al instante</p>
              </div>
              <button
                type="button"
                onClick={() => void start()}
                aria-label="Empezar de nuevo"
                title="Empezar de nuevo"
                className="rounded-full p-2 text-warm-white/80 transition-colors hover:bg-emerald-light hover:text-gold"
              >
                <RotateCcw size={18} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="rounded-full p-2 text-warm-white/80 transition-colors hover:bg-emerald-light hover:text-gold"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mensajes */}
            <div
              ref={listRef}
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin"
            >
              {messages.map((m) => (
                <div key={m.id} className={m.from === "user" ? "flex justify-end" : ""}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.from === "user"
                        ? "rounded-br-sm bg-emerald text-warm-white"
                        : "rounded-bl-sm bg-white text-slate shadow-sm ring-1 ring-slate/5"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.summary && (
                      <ul className="mt-2 space-y-1 rounded-xl bg-warm-white p-3 text-[13px]">
                        {m.summary.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {m.cards && (
                    <div className="mt-2 space-y-2">
                      {m.cards.map((p) => (
                        <ChatPropertyCard
                          key={p.id}
                          property={p}
                          onChoose={
                            step === "results" && m.id === lastCardsId
                              ? () => chooseProperty(p)
                              : undefined
                          }
                          onNavigate={() => setOpen(false)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {(typing || step === "sending") && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-slate/5">
                    <span className="sr-only">Escribiendo…</span>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-emerald/60"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate/50">
                    {step === "sending" ? "Agendando…" : "escribiendo…"}
                  </span>
                </div>
              )}
            </div>

            {/* Respuestas */}
            <div className="border-t border-slate/10 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <input
                ref={trapRef}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute -left-[10000px] h-px w-px opacity-0"
              />

              {step === "operation" && (
                <Options>
                  <Option onClick={() => chooseOperation("Venta")}>Comprar</Option>
                  <Option onClick={() => chooseOperation("Alquiler")}>Alquilar</Option>
                </Options>
              )}

              {step === "zone" && operation && (
                <Options>
                  {zonesFor(operation).map((z) => (
                    <Option key={z} onClick={() => chooseZone(z)}>
                      {z}
                    </Option>
                  ))}
                  <Option onClick={() => chooseZone(ANY_ZONE)}>{ANY_ZONE}</Option>
                </Options>
              )}

              {step === "budget" && operation && (
                <Options>
                  {BUDGET_OPTIONS[operation].map((b) => (
                    <Option key={b.id} onClick={() => chooseBudget(b)}>
                      {b.label}
                    </Option>
                  ))}
                </Options>
              )}

              {step === "results" && (
                <Options>
                  <Option subtle onClick={() => void start()}>
                    Buscar otra cosa
                  </Option>
                </Options>
              )}

              {step === "noMatch" && (
                <Options>
                  <Link
                    href={`/?operation=${operation ?? "Venta"}#propiedades`}
                    onClick={() => setOpen(false)}
                    className={optionClass()}
                  >
                    Ver todas las propiedades
                  </Link>
                  <a
                    href={buildWhatsAppLink(searchWhatsAppText())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${optionClass()} border-[#25D366] text-[#128C4B]`}
                  >
                    <MessageCircle size={16} />
                    Escribir por WhatsApp
                  </a>
                  <Option subtle onClick={() => void start()}>
                    Empezar de nuevo
                  </Option>
                </Options>
              )}

              {step === "day" && (
                <Options>
                  {upcomingVisitDays().map((d) => (
                    <Option key={d} onClick={() => chooseDay(d)}>
                      {shortDay(d)}
                    </Option>
                  ))}
                </Options>
              )}

              {step === "slot" && day && (
                <Options>
                  {slotsFor(day).map((s) => (
                    <Option key={s} onClick={() => chooseSlot(s)}>
                      {s}
                    </Option>
                  ))}
                  <Option subtle onClick={changeDay}>
                    Otro día
                  </Option>
                </Options>
              )}

              {(step === "name" || step === "phone") && (
                <form onSubmit={submitText}>
                  <div className="flex items-center gap-2">
                    <label htmlFor="assistant-input" className="sr-only">
                      {step === "name" ? "Tu nombre" : "Tu teléfono"}
                    </label>
                    <input
                      ref={inputRef}
                      id="assistant-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      type={step === "phone" ? "tel" : "text"}
                      inputMode={step === "phone" ? "tel" : "text"}
                      autoComplete={step === "phone" ? "tel" : "name"}
                      maxLength={step === "phone" ? 40 : 120}
                      placeholder={step === "phone" ? "Ej: 11 5555-1234" : "Nombre y apellido"}
                      className="min-w-0 flex-1 rounded-full border border-slate/15 px-4 py-3 text-base focus:border-gold focus:outline-none sm:text-sm"
                    />
                    <button
                      type="submit"
                      aria-label="Enviar"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald text-gold transition-colors hover:bg-emerald-light"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  {inputError && (
                    <p className="mt-2 px-2 text-xs text-red-600" role="alert">
                      {inputError}
                    </p>
                  )}
                </form>
              )}

              {step === "confirm" && (
                <Options>
                  <button
                    type="button"
                    onClick={() => void confirm()}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-emerald-light"
                  >
                    <CheckCircle2 size={18} />
                    Confirmar visita
                  </button>
                  <Option subtle onClick={changeDay}>
                    Cambiar día u horario
                  </Option>
                </Options>
              )}

              {step === "sending" && (
                <p className="flex items-center justify-center gap-2 py-2 text-sm text-slate/60">
                  <Loader2 size={16} className="animate-spin" />
                  Agendando tu visita…
                </p>
              )}

              {step === "done" && (
                <Options>
                  <a
                    href={buildWhatsAppLink(visitWhatsAppText())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                  >
                    <MessageCircle size={18} />
                    Enviar por WhatsApp
                  </a>
                  <Option subtle onClick={() => setOpen(false)}>
                    Cerrar
                  </Option>
                </Options>
              )}

              {step === "error" && (
                <Options>
                  <Option onClick={() => void confirm()}>Reintentar</Option>
                  <a
                    href={buildWhatsAppLink(visitWhatsAppText())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${optionClass()} border-[#25D366] text-[#128C4B]`}
                    title={errorText ?? undefined}
                  >
                    <MessageCircle size={16} />
                    Escribir por WhatsApp
                  </a>
                </Options>
              )}

              {step === "loading" && <div className="h-10" aria-hidden="true" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function optionClass(subtle = false) {
  return subtle
    ? "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate/60 transition-colors hover:text-emerald"
    : "inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-white px-4 py-2 text-sm font-medium text-emerald transition-colors hover:border-emerald hover:bg-emerald hover:text-warm-white";
}

function Options({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2">{children}</div>;
}

function Option({
  children,
  onClick,
  subtle,
}: {
  children: React.ReactNode;
  onClick: () => void;
  subtle?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={optionClass(subtle)}>
      {children}
    </button>
  );
}

function ChatPropertyCard({
  property,
  onChoose,
  onNavigate,
}: {
  property: PropertySummary;
  onChoose?: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-slate/10">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-emerald/10">
        {property.image && (
          <Image src={property.image} alt="" fill sizes="80px" className="object-cover" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate">
          {property.title}
        </p>
        <p className="text-xs text-slate/60">
          {property.neighborhood} · {property.operation}
        </p>
        <p className="mt-0.5 font-serif-display text-sm text-gold">
          {formatPropertyPrice(property)}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          {onChoose && (
            <button
              type="button"
              onClick={onChoose}
              className="rounded-full bg-emerald px-3 py-1 text-xs font-semibold text-warm-white transition-colors hover:bg-emerald-light"
            >
              Elegir esta
            </button>
          )}
          <Link
            href={propertyPath(property.slug)}
            onClick={onNavigate}
            className="text-xs font-semibold text-emerald underline-offset-2 hover:text-gold hover:underline"
          >
            Ver ficha
          </Link>
        </div>
      </div>
    </div>
  );
}
