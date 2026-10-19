"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Gauge, Power, Radio, RefreshCw, Timer } from "lucide-react";

/**
 * Calentando motores: despierta y monitorea los servicios que corren en Render free.
 *
 * Render duerme cada servicio gratuito tras 15 min sin tráfico y el primer request
 * queda colgado ~30-60 s mientras levanta. No hay forma de saber si está dormido
 * sin pegarle (y pegarle ya lo despierta), así que el estado se infiere por el
 * tiempo de respuesta: si tarda más de COLD_THRESHOLD_MS, estaba dormido.
 *
 * Cualquier respuesta HTTP (aunque sea 401 o 404) significa que el proceso está vivo.
 */

type Service = {
  id: string;
  name: string;
  role: string;
  url: string;
  color: string;
  /** Si responde con headers CORS se puede leer el status; si no, la respuesta es opaca. */
  cors: boolean;
};

const SERVICES: Service[] = [
  {
    id: "api",
    name: "API Principal",
    role: "Backend de eventos, reservas y usuarios",
    url: "https://grand-prix-tracker-api.onrender.com",
    color: "#E10600",
    cors: true,
  },
  {
    id: "ticketing",
    name: "Microservicio Ticketing",
    role: "Reserva y sincronización de entradas",
    url: "https://microservice-ticketing-gp.onrender.com",
    color: "#7C4DFF",
    cors: true,
  },
  {
    id: "soap",
    name: "Legacy SOAP",
    role: "Servicio SOAP legacy de ticketing",
    url: "https://f1-ticketing-legacy-soap.onrender.com",
    color: "#14B8A6",
    cors: false,
  },
];

/** A partir de acá sin respuesta, se asume arranque en frío. */
const COLD_THRESHOLD_MS = 3_000;
/** Duración típica de un arranque en frío en Render free (solo para animar el progreso). */
const EXPECTED_COLD_MS = 50_000;
/** Pasado este tiempo sin respuesta se declara el abandono. */
const TIMEOUT_MS = 120_000;
/** Cadencia de encendido de cada columna del semáforo. */
const LIGHT_STEP_MS = 450;
/** Cuánto quedan las 5 luces prendidas antes del apagado. */
const LIGHTS_HOLD_MS = 900;
const MAX_LAPS = 8;
const MAX_LOG = 40;

const MONITOR_OPTIONS = [
  { ms: 0, label: "Off" },
  { ms: 30_000, label: "30 s" },
  { ms: 60_000, label: "1 min" },
  { ms: 300_000, label: "5 min" },
  { ms: 600_000, label: "10 min" },
];

type Phase = "idle" | "checking" | "waking" | "up" | "down";

type Lap = { id: number; ms: number; cold: boolean; ok: boolean };

type ServiceState = {
  phase: Phase;
  startedAt: number | null;
  lastMs: number | null;
  /** Status HTTP, "opaque" si no hay CORS para leerlo, null si nunca respondió. */
  lastCode: number | "opaque" | null;
  wasCold: boolean;
  checkedAt: number | null;
  error: string | null;
  laps: Lap[];
};

type Race = {
  startedAt: number;
  doneAt: number | null;
  outcome: "go" | "abort" | null;
};

type Tone = "info" | "ok" | "warn" | "err";

type LogEntry = {
  id: number;
  at: number;
  source: string;
  color: string;
  text: string;
  tone: Tone;
};

const PHASE_UI: Record<Phase, { label: string; color: string; pulse: boolean }> = {
  idle: { label: "En garaje", color: "#7E808F", pulse: false },
  checking: { label: "Radio check", color: "#0284C7", pulse: true },
  waking: { label: "Calentando motor", color: "#D97706", pulse: true },
  up: { label: "En pista", color: "#16A34A", pulse: false },
  down: { label: "Abandono", color: "#E10600", pulse: false },
};

const TONE_COLOR: Record<Tone, string> = {
  info: "#0284C7",
  ok: "#16A34A",
  warn: "#D97706",
  err: "#E10600",
};

// Luces de cambio del volante: 5 verdes, 5 rojas, 5 violetas.
const SHIFT_LEDS = [
  ...Array<string>(5).fill("#22C55E"),
  ...Array<string>(5).fill("#E10600"),
  ...Array<string>(5).fill("#7C4DFF"),
];

const RACE_CONTROL = { name: "Dirección de carrera", color: "#F3F1EA" };

function initialState(): Record<string, ServiceState> {
  return Object.fromEntries(
    SERVICES.map((s) => [
      s.id,
      {
        phase: "idle",
        startedAt: null,
        lastMs: null,
        lastCode: null,
        wasCold: false,
        checkedAt: null,
        error: null,
        laps: [],
      } satisfies ServiceState,
    ]),
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Un GET al root del servicio. Con CORS devuelve el status; sin CORS (o si el
 * origen no está habilitado) cae a no-cors, que igual despierta el servicio y
 * resuelve cuando responde, pero no deja leer nada.
 */
async function hit(svc: Service, signal: AbortSignal): Promise<number | "opaque"> {
  if (svc.cors) {
    try {
      const res = await fetch(svc.url, { cache: "no-store", signal });
      return res.status;
    } catch (err) {
      if (signal.aborted) throw err;
    }
  }
  await fetch(svc.url, { mode: "no-cors", cache: "no-store", signal });
  return "opaque";
}

function progressOf(s: ServiceState, now: number): number {
  if (s.phase === "up" || s.phase === "down") return 1;
  if (s.phase === "idle" || s.startedAt === null) return 0;
  return Math.min(0.95, Math.max(0, now - s.startedAt) / EXPECTED_COLD_MS);
}

function fmtClock(ms: number): string {
  const total = Math.max(0, ms) / 1000;
  const min = Math.floor(total / 60);
  const sec = (total - min * 60).toFixed(1).padStart(4, "0");
  return `${String(min).padStart(2, "0")}:${sec}`;
}

function fmtDuration(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function fmtAgo(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 5) return "recién";
  if (s < 60) return `hace ${s} s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `hace ${m} min` : `hace ${Math.floor(m / 60)} h`;
}

function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function fmtTime(at: number): string {
  return new Date(at).toLocaleTimeString("es-AR", { hour12: false });
}

export default function CalentandoMotoresPage() {
  const [services, setServices] = useState(initialState);
  const [race, setRace] = useState<Race | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [monitorMs, setMonitorMs] = useState(0);
  const [nextPingAt, setNextPingAt] = useState<number | null>(null);
  // Reloj de la UI: lo actualiza un intervalo para no leer Date.now() en el render.
  const [now, setNow] = useState(0);

  const inFlight = useRef(new Map<string, Promise<boolean>>());
  const controllers = useRef(new Set<AbortController>());
  const seq = useRef(0);

  const patch = useCallback((id: string, fn: (s: ServiceState) => ServiceState) => {
    setServices((prev) => ({ ...prev, [id]: fn(prev[id]) }));
  }, []);

  const pushLog = useCallback((svc: Service | null, text: string, tone: Tone) => {
    seq.current += 1;
    const source = svc ?? RACE_CONTROL;
    const entry: LogEntry = {
      id: seq.current,
      at: Date.now(),
      source: source.name,
      color: source.color,
      text,
      tone,
    };
    setLog((prev) => [entry, ...prev].slice(0, MAX_LOG));
  }, []);

  /** Le pega a un servicio hasta que responde. Si ya hay un ping en curso, reusa ese. */
  const probe = useCallback(
    (svc: Service): Promise<boolean> => {
      const running = inFlight.current.get(svc.id);
      if (running) return running;

      const run = (async () => {
        const startedAt = Date.now();
        const t0 = performance.now();
        const controller = new AbortController();
        controllers.current.add(controller);
        patch(svc.id, (s) => ({ ...s, phase: "checking", startedAt, error: null }));

        const coldTimer = setTimeout(() => {
          patch(svc.id, (s) => (s.phase === "checking" ? { ...s, phase: "waking" } : s));
          pushLog(svc, "Sin respuesta: estaba dormido, Render lo está levantando…", "warn");
        }, COLD_THRESHOLD_MS);
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
          let code = await hit(svc, controller.signal);
          // Un 5xx legible suele ser Render todavía levantando: se reintenta.
          while (typeof code === "number" && code >= 500) {
            await wait(2_500);
            code = await hit(svc, controller.signal);
          }
          const ms = performance.now() - t0;
          const cold = ms >= COLD_THRESHOLD_MS;
          seq.current += 1;
          const lap: Lap = { id: seq.current, ms, cold, ok: true };
          patch(svc.id, (s) => ({
            ...s,
            phase: "up",
            lastMs: ms,
            lastCode: code,
            wasCold: cold,
            checkedAt: Date.now(),
            laps: [...s.laps, lap].slice(-MAX_LAPS),
          }));
          pushLog(
            svc,
            cold
              ? `¡Motor caliente! Arranque en frío de ${fmtDuration(ms)}`
              : `En pista · respondió en ${fmtDuration(ms)}`,
            "ok",
          );
          return true;
        } catch {
          const ms = performance.now() - t0;
          const reason = controller.signal.aborted
            ? `sin respuesta tras ${fmtDuration(ms)}`
            : "error de red";
          seq.current += 1;
          const lap: Lap = { id: seq.current, ms, cold: false, ok: false };
          patch(svc.id, (s) => ({
            ...s,
            phase: "down",
            lastMs: ms,
            checkedAt: Date.now(),
            error: reason,
            laps: [...s.laps, lap].slice(-MAX_LAPS),
          }));
          pushLog(svc, `Abandono: ${reason}`, "err");
          return false;
        } finally {
          clearTimeout(coldTimer);
          clearTimeout(timeout);
          controllers.current.delete(controller);
        }
      })();

      inFlight.current.set(svc.id, run);
      void run.then(() => inFlight.current.delete(svc.id));
      return run;
    },
    [patch, pushLog],
  );

  const sweep = useCallback(() => Promise.all(SERVICES.map((s) => probe(s))), [probe]);

  const startRace = useCallback(async () => {
    const startedAt = Date.now();
    setNow(startedAt);
    setRace({ startedAt, doneAt: null, outcome: null });
    pushLog(null, "Semáforo encendido: vuelta de formación para los 3 servicios", "info");

    const results = await sweep();
    const ok = results.every(Boolean);
    setRace((r) =>
      r?.startedAt === startedAt ? { ...r, doneAt: Date.now(), outcome: ok ? "go" : "abort" } : r,
    );
    pushLog(
      null,
      ok ? "Lights out and away we go! Todo en pista" : "Salida abortada: hay servicios fuera de carrera",
      ok ? "ok" : "err",
    );
  }, [sweep, pushLog]);

  const pingOne = useCallback(
    (svc: Service) => {
      setNow(Date.now());
      void probe(svc);
    },
    [probe],
  );

  const changeMonitor = useCallback(
    (ms: number) => {
      const t = Date.now();
      setMonitorMs(ms);
      setNow(t);
      setNextPingAt(ms ? t + ms : null);
      if (ms) void sweep();
    },
    [sweep],
  );

  // Monitoreo automático: un ping a todos cada monitorMs.
  useEffect(() => {
    if (!monitorMs) return;
    const id = setInterval(() => {
      setNextPingAt(Date.now() + monitorMs);
      void sweep();
    }, monitorMs);
    return () => clearInterval(id);
  }, [monitorMs, sweep]);

  // Al salir de la página se cortan los pings en curso.
  useEffect(() => {
    const active = controllers.current;
    return () => active.forEach((c) => c.abort());
  }, []);

  // ---- Derivados ----
  const states = SERVICES.map((s) => services[s.id]);
  const anyInFlight = states.some((s) => s.phase === "checking" || s.phase === "waking");
  const upCount = states.filter((s) => s.phase === "up").length;
  const wakingCount = states.filter((s) => s.phase === "waking").length;
  const downCount = states.filter((s) => s.phase === "down").length;
  const overall = states.reduce((acc, s) => acc + progressOf(s, now), 0) / states.length;

  let lit = 0;
  let gantry: "grid" | "formation" | "armed" | "go" | "abort" = "grid";
  if (race) {
    const steps = Math.floor(Math.max(0, now - race.startedAt) / LIGHT_STEP_MS);
    if (race.outcome === null || race.doneAt === null) {
      gantry = "formation";
      lit = Math.min(4, steps, Math.floor(overall * 5));
    } else {
      const fullAt = Math.max(race.doneAt, race.startedAt + 5 * LIGHT_STEP_MS);
      if (now < fullAt + LIGHTS_HOLD_MS) {
        gantry = "armed";
        lit = Math.min(5, steps);
      } else {
        gantry = race.outcome;
      }
    }
  }

  const raceRunning = gantry === "formation" || gantry === "armed";
  const busy = anyInFlight || raceRunning;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), busy ? 100 : 1000);
    return () => clearInterval(id);
  }, [busy]);

  const headline = {
    grid: { text: "En grilla", sub: "Apretá el botón para despertar los servicios", color: undefined },
    formation: {
      text: "Vuelta de formación",
      sub: `${upCount} de ${SERVICES.length} en pista · ${fmtClock(now - (race?.startedAt ?? now))}`,
      color: undefined,
    },
    armed: { text: "Preparados…", sub: "Todos en posición", color: "#E10600" },
    go: { text: "Lights out and away we go!", sub: "Los 3 servicios están en pista", color: "#16A34A" },
    abort: {
      text: "Salida abortada",
      sub: `${downCount} servicio${downCount === 1 ? "" : "s"} sin respuesta · revisá el dashboard de Render`,
      color: "#D97706",
    },
  }[gantry];

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#0B0B10] pt-24 text-[#F3F1EA] selection:bg-[#E10600] selection:text-white">
      <style>{`
        @keyframes gp-rumble {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-0.6px, 0.5px); }
          50% { transform: translate(0.5px, -0.5px); }
          75% { transform: translate(-0.4px, -0.4px); }
        }
        @keyframes gp-exhaust {
          0% { opacity: .7; transform: translateX(0) scale(.5); }
          100% { opacity: 0; transform: translateX(-16px) scale(1.5); }
        }
        @keyframes gp-road {
          from { background-position: 0 0; }
          to { background-position: -24px 0; }
        }
        @keyframes gp-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: .15; }
        }
        @keyframes gp-pop {
          from { opacity: 0; transform: scale(.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gp-checker {
          from { background-position: 0 0; }
          to { background-position: 32px 0; }
        }
        .gp-rumble { animation: gp-rumble .12s linear infinite; }
        .gp-exhaust { animation: gp-exhaust .6s ease-out infinite; }
        .gp-road { animation: gp-road .35s linear infinite; }
        .gp-blink { animation: gp-blink .9s steps(1) infinite; }
        .gp-pop { animation: gp-pop .35s cubic-bezier(.2, .9, .3, 1.2) both; }
        .gp-checker { animation: gp-checker 1s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .gp-rumble, .gp-exhaust, .gp-road, .gp-blink, .gp-pop, .gp-checker { animation: none !important; }
        }
      `}</style>

      <div className="gpt-carbon pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-[#E10600]/5 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {/* Encabezado */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#E10600]">
            PARC FERMÉ · RENDER FREE TIER
          </span>
          <h1 className="font-display mt-4 text-4xl font-900 tracking-tight sm:text-5xl">
            Calentando motores
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#93949F] sm:text-base">
            Render duerme los servicios gratuitos después de 15 minutos sin tráfico y tardan
            cerca de un minuto en volver. Desde acá los despertás y seguís la telemetría de cada
            uno hasta que estén en pista.
          </p>
        </div>

        {/* Semáforo de largada */}
        <section className="gpt-hud-grid relative mt-12 overflow-hidden rounded-md border border-[#1C1D24] bg-[#131318]/80 p-5 sm:p-8">
          <StartLights lit={lit} mode={gantry} />

          <div aria-live="polite" className="mt-7 text-center">
            {headline.color ? (
              <p
                key={gantry}
                className="gp-pop font-display text-2xl font-900 uppercase tracking-tight sm:text-4xl"
                style={{ color: headline.color }}
              >
                {headline.text}
              </p>
            ) : (
              <p className="font-display text-2xl font-900 uppercase tracking-tight text-[#F3F1EA] sm:text-4xl">
                {headline.text}
              </p>
            )}
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#93949F]">
              {headline.sub}
            </p>
          </div>

          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={startRace}
              disabled={raceRunning}
              className={
                "gpt-checker-btn inline-flex items-center justify-center gap-2 rounded-sm px-7 py-3.5 font-display text-sm font-900 uppercase tracking-[0.15em] transition-transform " +
                (raceRunning
                  ? "cursor-not-allowed bg-[#33343D] text-[#93949F]"
                  : "cursor-pointer bg-[#E10600] text-white hover:-translate-y-0.5")
              }
            >
              <Power className="h-4 w-4" />
              {raceRunning ? "Calentando…" : race ? "Volver a largar" : "Arrancar motores"}
            </button>
          </div>

          {/* Resumen + monitoreo */}
          <div className="mt-8 grid gap-6 border-t border-[#1C1D24] pt-6 md:grid-cols-[auto_1fr] md:items-center">
            <dl className="grid grid-cols-3 gap-3 sm:gap-6">
              <Stat label="En pista" value={`${upCount}/${SERVICES.length}`} color="#16A34A" />
              <Stat label="Calentando" value={String(wakingCount)} color="#D97706" />
              <Stat label="Abandono" value={String(downCount)} color="#E10600" />
            </dl>

            <div className="md:justify-self-end">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#93949F]">
                <Gauge className="h-3.5 w-3.5" />
                Monitoreo automático
                {monitorMs > 0 && nextPingAt !== null && (
                  <span className="text-[#5C5D66]">
                    · próximo ping en {fmtCountdown(nextPingAt - now)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MONITOR_OPTIONS.map((opt) => {
                  const active = monitorMs === opt.ms;
                  return (
                    <button
                      key={opt.ms}
                      type="button"
                      aria-pressed={active}
                      onClick={() => changeMonitor(opt.ms)}
                      className={
                        "cursor-pointer rounded-sm border px-3 py-1.5 font-mono text-[11px] font-700 transition-colors " +
                        (active
                          ? "border-[#E10600] bg-[#E10600] text-white"
                          : "border-[#33343D] text-[#93949F] hover:bg-[#1C1D24]")
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 max-w-md text-[11px] leading-relaxed text-[#5C5D66]">
                Con un intervalo menor a 15 min y esta pestaña abierta, los servicios no se duermen.
                Ojo: Render free da 750 h de instancia por mes para todo el workspace.
              </p>
            </div>
          </div>

          {gantry === "go" && (
            <div
              aria-hidden
              className="gp-checker absolute inset-x-0 bottom-0 h-1.5"
              style={{
                backgroundImage: "repeating-conic-gradient(#F3F1EA 0 25%, #0B0B10 0 50%)",
                backgroundSize: "8px 8px",
              }}
            />
          )}
        </section>

        {/* Grilla de servicios */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {SERVICES.map((svc, i) => (
            <ServiceCard
              key={svc.id}
              svc={svc}
              position={i + 1}
              state={services[svc.id]}
              now={now}
              onPing={() => pingOne(svc)}
            />
          ))}
        </div>

        {/* Radio del equipo */}
        <section className="mt-8 rounded-md border border-[#1C1D24] bg-[#131318]/80">
          <header className="flex items-center justify-between border-b border-[#1C1D24] px-5 py-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#93949F]">
              <Radio className="h-3.5 w-3.5 text-[#E10600]" />
              Radio del equipo
            </div>
            {log.length > 0 && (
              <button
                type="button"
                onClick={() => setLog([])}
                className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-[#5C5D66] hover:text-[#F3F1EA]"
              >
                Limpiar
              </button>
            )}
          </header>
          {log.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[#5C5D66]">
              Sin mensajes. Arrancá los motores para escuchar la radio.
            </p>
          ) : (
            <ol className="custom-scrollbar max-h-72 divide-y divide-[#1C1D24] overflow-y-auto">
              {log.map((entry) => (
                <li key={entry.id} className="flex gap-3 px-5 py-2.5 text-sm">
                  <span className="shrink-0 font-mono text-[11px] tabular-nums leading-5 text-[#5C5D66]">
                    {fmtTime(entry.at)}
                  </span>
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: TONE_COLOR[entry.tone] }}
                  />
                  <span className="min-w-0 leading-5">
                    <span className="font-mono text-[11px] font-700 uppercase tracking-wider text-[#B9B8B0]">
                      {entry.source}
                    </span>
                    <span className="text-[#93949F]"> — {entry.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}

function StartLights({
  lit,
  mode,
}: {
  lit: number;
  mode: "grid" | "formation" | "armed" | "go" | "abort";
}) {
  const color = mode === "abort" ? "#F59E0B" : "#E10600";
  return (
    // El pórtico queda siempre oscuro, también en modo claro (por eso estilos inline).
    <div aria-hidden className="mx-auto w-fit">
      <div className="mx-6 h-2 rounded-t-sm" style={{ background: "#1C1D24" }} />
      <div className="flex gap-2 sm:gap-4">
        {Array.from({ length: 5 }, (_, i) => {
          const on = mode === "abort" || i < lit;
          return (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-md p-2 sm:p-3"
              style={{ background: "#08080C", boxShadow: "inset 0 0 0 1px #1C1D24" }}
            >
              {[0, 1].map((j) => (
                <span
                  key={j}
                  className={
                    "block h-7 w-7 rounded-full transition-[background,box-shadow] duration-150 sm:h-11 sm:w-11 " +
                    (mode === "abort" ? "gp-blink" : "")
                  }
                  style={
                    on
                      ? {
                          background: `radial-gradient(circle at 35% 30%, #ffffff66 0, ${color} 38%, ${color}cc 72%)`,
                          boxShadow: `0 0 18px ${color}, 0 0 4px ${color}`,
                        }
                      : { background: "#1A0707", boxShadow: "inset 0 2px 4px #000" }
                  }
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5C5D66]">{label}</dt>
      <dd className="font-display mt-1 text-2xl font-900 tabular-nums" style={{ color }}>
        {value}
      </dd>
    </div>
  );
}

function ServiceCard({
  svc,
  position,
  state,
  now,
  onPing,
}: {
  svc: Service;
  position: number;
  state: ServiceState;
  now: number;
  onPing: () => void;
}) {
  const ui = PHASE_UI[state.phase];
  const inFlight = state.phase === "checking" || state.phase === "waking";
  const progress = progressOf(state, now);
  const ledsOn = inFlight ? Math.max(1, Math.round(progress * 15)) : state.phase === "idle" ? 0 : 15;

  let clock = "--:--.-";
  if (inFlight && state.startedAt !== null) clock = fmtClock(now - state.startedAt);
  else if (state.lastMs !== null) clock = fmtClock(state.lastMs);

  const caption = {
    idle: "Sin telemetría todavía",
    checking: "Esperando respuesta…",
    waking: `Estaba dormido · arranque en frío (~${EXPECTED_COLD_MS / 1000} s)`,
    up: state.wasCold ? "Arrancó en frío" : "Ya estaba despierto",
    down: state.error ?? "Sin respuesta",
  }[state.phase];

  let codeLabel = "—";
  if (state.lastCode === "opaque") codeLabel = "Respuesta opaca (sin CORS)";
  else if (state.lastCode !== null) codeLabel = `HTTP ${state.lastCode}`;

  // La vuelta más rápida se elige entre las vueltas en caliente; un arranque en frío nunca es récord.
  const warmLaps = state.laps.filter((l) => l.ok && !l.cold);
  const bestMs = warmLaps.length ? Math.min(...warmLaps.map((l) => l.ms)) : null;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-md border border-[#1C1D24] bg-[#131318]/80 p-5">
      <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: svc.color }} />

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-700 tracking-wider text-white"
              style={{ background: svc.color }}
            >
              P{position}
            </span>
            <h2 className="font-display truncate text-lg font-700 tracking-tight">{svc.name}</h2>
          </div>
          <p className="mt-1 truncate font-mono text-[10px] text-[#5C5D66]">
            {svc.url.replace("https://", "")}
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-700 uppercase tracking-wider"
          style={{ color: ui.color, borderColor: `${ui.color}66`, background: `${ui.color}14` }}
        >
          <span className="relative flex h-1.5 w-1.5">
            {ui.pulse && (
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 motion-reduce:hidden"
                style={{ background: ui.color }}
              />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: ui.color }} />
          </span>
          {ui.label}
        </span>
      </header>

      <p className="mt-2 text-xs text-[#93949F]">{svc.role}</p>

      {/* Luces de cambio */}
      <div aria-hidden className="mt-5 flex gap-1">
        {SHIFT_LEDS.map((color, i) => {
          const on = i < ledsOn;
          const failed = state.phase === "down";
          return (
            <span
              key={i}
              className={
                "h-2 flex-1 rounded-full transition-colors duration-200 " +
                (on ? "" : "bg-[#1C1D24] ") +
                (failed && on ? "gp-blink" : "")
              }
              style={
                on
                  ? {
                      background: failed ? "#E10600" : color,
                      boxShadow: `0 0 6px ${failed ? "#E10600" : color}`,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>

      <Track svc={svc} phase={state.phase} progress={progress} />

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-3xl font-700 tabular-nums">
            <Timer className="h-5 w-5 shrink-0 text-[#5C5D66]" />
            {clock}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#93949F]">
            {caption}
          </p>
        </div>
        <div className="shrink-0 text-right font-mono text-[10px] leading-relaxed text-[#5C5D66]">
          <p>{codeLabel}</p>
          <p>{state.checkedAt !== null ? fmtAgo(now - state.checkedAt) : "Nunca chequeado"}</p>
        </div>
      </div>

      {/* Tiempos de vuelta */}
      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5C5D66]">Vueltas</p>
        {state.laps.length === 0 ? (
          <p className="mt-1.5 text-xs text-[#5C5D66]">Todavía no dio ninguna.</p>
        ) : (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {state.laps.map((lap) => {
              const color = !lap.ok
                ? "#E10600"
                : lap.cold
                  ? "#D97706"
                  : lap.ms === bestMs
                    ? "#7C4DFF"
                    : "#16A34A";
              return (
                <li
                  key={lap.id}
                  title={!lap.ok ? "Abandono" : lap.cold ? "Arranque en frío" : lap.ms === bestMs ? "Vuelta más rápida" : "En caliente"}
                  className="rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-700 tabular-nums"
                  style={{ color, borderColor: `${color}55`, background: `${color}12` }}
                >
                  {lap.ok ? fmtDuration(lap.ms) : "DNF"}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-auto flex gap-2 border-t border-[#1C1D24] pt-4">
        <button
          type="button"
          onClick={onPing}
          disabled={inFlight}
          className={
            "inline-flex flex-1 items-center justify-center gap-2 rounded-sm border px-3 py-2 font-mono text-[11px] font-700 uppercase tracking-wider transition-colors " +
            (inFlight
              ? "cursor-not-allowed border-[#1C1D24] text-[#5C5D66]"
              : "cursor-pointer border-[#33343D] text-[#F3F1EA] hover:bg-[#1C1D24]")
          }
        >
          <RefreshCw className={"h-3.5 w-3.5 " + (inFlight ? "animate-spin motion-reduce:animate-none" : "")} />
          {inFlight ? "Esperando…" : "Pegarle"}
        </button>
        <a
          href={svc.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir ${svc.name} en otra pestaña`}
          className="inline-flex items-center justify-center rounded-sm border border-[#33343D] px-3 text-[#93949F] transition-colors hover:bg-[#1C1D24] hover:text-[#F3F1EA]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

/** Carril con el auto: avanza con el progreso del arranque y llega a la bandera a cuadros. */
function Track({ svc, phase, progress }: { svc: Service; phase: Phase; progress: number }) {
  const moving = phase === "checking" || phase === "waking";
  const position = phase === "down" ? 0 : progress;
  return (
    <div
      aria-hidden
      className="relative mt-3 h-10 overflow-hidden rounded-sm border border-[#1C1D24] bg-[#0E0E13]"
    >
      {/* Línea central */}
      <div
        className={"absolute inset-x-0 top-1/2 h-px -translate-y-1/2 opacity-40 " + (moving ? "gp-road" : "")}
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #93949F 0 12px, transparent 12px 24px)",
        }}
      />
      {/* Línea de largada */}
      <div className="absolute inset-y-0 left-2 w-0.5" style={{ background: "#93949F55" }} />
      {/* Meta */}
      <div
        className="absolute inset-y-0 right-0 w-3"
        style={{
          backgroundImage: "repeating-conic-gradient(#F3F1EA 0 25%, #0B0B10 0 50%)",
          backgroundSize: "6px 6px",
        }}
      />

      <div
        className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-300 ease-linear"
        // 6px de margen en la largada; al 100% el auto frena justo antes de la meta.
        style={{ left: `calc(6px + (100% - 70px) * ${position})` }}
      >
        <div className="relative">
          {moving && (
            <>
              <span className="gp-exhaust absolute -left-1 top-1/2 -mt-1 h-2 w-2 rounded-full bg-[#93949F]/60" />
              <span
                className="gp-exhaust absolute -left-1 top-1/2 -mt-1 h-2 w-2 rounded-full bg-[#93949F]/60"
                style={{ animationDelay: ".3s" }}
              />
            </>
          )}
          <CarTopView
            color={svc.color}
            className={(moving ? "gp-rumble " : "") + (phase === "down" ? "opacity-40 grayscale" : "")}
          />
        </div>
      </div>

      {phase === "down" && (
        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-[10px] font-700 tracking-widest text-[#E10600]">
          DNF
        </span>
      )}
    </div>
  );
}

function CarTopView({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 20" className={"block h-5 w-12 " + className}>
      {/* Neumáticos (gris goma, para que se lean sobre el asfalto oscuro) */}
      <g fill="#3A3B45" stroke="#5C5D66" strokeWidth="0.6">
        <rect x="9" y="0.5" width="8" height="5" rx="1.5" />
        <rect x="9" y="14.5" width="8" height="5" rx="1.5" />
        <rect x="32" y="1.5" width="6" height="4" rx="1.5" />
        <rect x="32" y="14.5" width="6" height="4" rx="1.5" />
      </g>
      {/* Brazos de suspensión */}
      <path d="M13 5.5 V8 M13 12 V14.5 M35 5.5 V8.5 M35 11.5 V14.5" stroke="#5C5D66" strokeWidth="1" />
      {/* Alerón trasero y delantero */}
      <rect x="1" y="2.5" width="4" height="15" rx="1" fill={color} />
      <rect x="43" y="2.5" width="3.5" height="15" rx="1" fill={color} />
      {/* Chasis y pontones */}
      <path d="M4 8 L26 6.5 L44 9 L44 11 L26 13.5 L4 12 Z" fill={color} />
      <rect x="14" y="6" width="12" height="8" rx="2.5" fill={color} />
      {/* Casco */}
      <circle cx="23" cy="10" r="2.2" fill="#F3F1EA" />
      <circle cx="23" cy="10" r="1.1" fill="#0B0B10" />
    </svg>
  );
}
