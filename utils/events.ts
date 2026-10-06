import { Race } from "./races";
import {
  BackendEvent,
  EventCircuitCountry,
  EventCircuitCity,
  EventCircuit,
  ApiResponse,
  getEvents,
  getEventById,
} from "@/services/events";

export type {
  BackendEvent,
  EventCircuitCountry,
  EventCircuitCity,
  EventCircuit,
  ApiResponse,
};

const MONTH_NAMES_ES = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

const CONTINENT_MAP: Record<string, string> = {
  europe: "Europa",
  europa: "Europa",
  asia: "Asia",
  "north-america": "Norteamérica",
  norteamerica: "Norteamérica",
  "latin-america": "Latinoamérica",
  latinoamerica: "Latinoamérica",
  "south-america": "Latinoamérica",
  sudamerica: "Latinoamérica",
  "middle-east": "Medio Oriente",
  "medio-oriente": "Medio Oriente",
  oceania: "Oceanía",
  africa: "África",
};

interface CircuitMeta {
  name: string;
  img: string;
  blurb: string;
  regionFallback?: string;
}

const KNOWN_CIRCUITS_META: Record<string, CircuitMeta> = {
  madrid: {
    name: "Spanish GP",
    img: "/races/madrid.webp",
    blurb:
      "¡Nueva pista urbana e híbrida por las calles de la capital española!",
    regionFallback: "Europa",
  },
  baku: {
    name: "Azerbaijan GP",
    img: "/races/baku.webp",
    blurb: "Largas rectas y la estrechísima sección del castillo.",
    regionFallback: "Europa",
  },
  singapore: {
    name: "Singapore GP",
    img: "/races/signapur.webp",
    blurb: "Calor extremo y máxima exigencia física bajo las luces nocturnas.",
    regionFallback: "Asia",
  },
  singapur: {
    name: "Singapore GP",
    img: "/races/signapur.webp",
    blurb: "Calor extremo y máxima exigencia física bajo las luces nocturnas.",
    regionFallback: "Asia",
  },
  austin: {
    name: "United States GP",
    img: "/races/austin.webp",
    blurb: "Elevación extrema en la curva 1 y mucho espectáculo en Texas.",
    regionFallback: "Norteamérica",
  },
  cota: {
    name: "United States GP",
    img: "/races/austin.webp",
    blurb: "Elevación extrema en la curva 1 y mucho espectáculo en Texas.",
    regionFallback: "Norteamérica",
  },
  mexico: {
    name: "Mexico City GP",
    img: "/races/mejico.webp",
    blurb:
      "Alta altitud que exige a los motores y el increíble paso por el Foro Sol.",
    regionFallback: "Latinoamérica",
  },
  "hermanos rodríguez": {
    name: "Mexico City GP",
    img: "/races/mejico.webp",
    blurb:
      "Alta altitud que exige a los motores y el increíble paso por el Foro Sol.",
    regionFallback: "Latinoamérica",
  },
  interlagos: {
    name: "São Paulo GP",
    img: "/races/interlagos.webp",
    blurb: "Carreras impredecibles, clima cambiante y la 'S' de Senna.",
    regionFallback: "Latinoamérica",
  },
  "são paulo": {
    name: "São Paulo GP",
    img: "/races/interlagos.webp",
    blurb: "Carreras impredecibles, clima cambiante y la 'S' de Senna.",
    regionFallback: "Latinoamérica",
  },
  "las vegas": {
    name: "Las Vegas GP",
    img: "/races/las_vegas.webp",
    blurb: "Velocidad extrema directo por el Strip en la noche del sábado.",
    regionFallback: "Norteamérica",
  },
  lusail: {
    name: "Qatar GP",
    img: "/races/qtar.webp",
    blurb: "Un trazado rápido y fluido en medio del desierto nocturno.",
    regionFallback: "Medio Oriente",
  },
  qatar: {
    name: "Qatar GP",
    img: "/races/qtar.webp",
    blurb: "Un trazado rápido y fluido en medio del desierto nocturno.",
    regionFallback: "Medio Oriente",
  },
  "yas marina": {
    name: "Abu Dhabi GP",
    img: "/races/yas_marina.webp",
    blurb:
      "El gran cierre de temporada, empezando de día y terminando de noche.",
    regionFallback: "Medio Oriente",
  },
  "abu dabi": {
    name: "Abu Dhabi GP",
    img: "/races/yas_marina.webp",
    blurb:
      "El gran cierre de temporada, empezando de día y terminando de noche.",
    regionFallback: "Medio Oriente",
  },
  bahrain: {
    name: "Bahrain GP",
    img: "/races/bahrain.webp",
    blurb: "El inicio de temporada bajo las luces del desierto.",
    regionFallback: "Medio Oriente",
  },
  jeddah: {
    name: "Saudi Arabian GP",
    img: "/races/jedah.webp",
    blurb: "El circuito urbano más rápido del mundo, rozando los muros.",
    regionFallback: "Medio Oriente",
  },
  melbourne: {
    name: "Australian GP",
    img: "/races/albert-park.webp",
    blurb: "Clásico parque urbano en Melbourne con zonas de alta velocidad.",
    regionFallback: "Oceanía",
  },
  suzuka: {
    name: "Japanese GP",
    img: "/races/Japan.webp",
    blurb: "El icónico trazado en forma de 8, favorito de los pilotos.",
    regionFallback: "Asia",
  },
  shanghai: {
    name: "Chinese GP",
    img: "/races/china.webp",
    blurb: "Largas rectas y la infame y técnica primera curva del caracol.",
    regionFallback: "Asia",
  },
  miami: {
    name: "Miami GP",
    img: "/races/miami.webp",
    blurb: "Glamour, yates falsos y pura acción alrededor del estadio.",
    regionFallback: "Norteamérica",
  },
  imola: {
    name: "Emilia Romagna GP",
    img: "/races/imola.webp",
    blurb:
      "Historia pura y un trazado de la vieja escuela sin margen de error.",
    regionFallback: "Europa",
  },
  monaco: {
    name: "Monaco GP",
    img: "/races/monaco.webp",
    blurb: "La joya de la corona. Clasificar acá lo es todo.",
    regionFallback: "Europa",
  },
  montreal: {
    name: "Canadian GP",
    img: "/races/canada.webp",
    blurb: "Curvas rápidas, chicanas y el famoso Muro de los Campeones.",
    regionFallback: "Norteamérica",
  },
  spielberg: {
    name: "Austrian GP",
    img: "/races/austria.webp",
    blurb: "Pista corta en las montañas con tres zonas de DRS consecutivas.",
    regionFallback: "Europa",
  },
  silverstone: {
    name: "British GP",
    img: "/races/silverstone.webp",
    blurb:
      "La cuna de la F1. Maggots y Becketts ponen a prueba la aerodinámica.",
    regionFallback: "Europa",
  },
  spa: {
    name: "Belgian GP",
    img: "/races/spa.webp",
    blurb: "La pista más larga del año y el espectacular paso por Eau Rouge.",
    regionFallback: "Europa",
  },
  hungaroring: {
    name: "Hungarian GP",
    img: "/races/hungary.webp",
    blurb: "Apodado 'Mónaco sin muros', requiere máxima carga aerodinámica.",
    regionFallback: "Europa",
  },
  zandvoort: {
    name: "Dutch GP",
    img: "/races/dutch.webp",
    blurb: "Curvas peraltadas y un mar naranja en las dunas holandesas.",
    regionFallback: "Europa",
  },
  monza: {
    name: "Italian GP",
    img: "/races/monza.webp",
    blurb: "El Templo de la Velocidad. Acelerador a fondo frente a los Tifosi.",
    regionFallback: "Europa",
  },
  portugal: {
    name: "Portuguese GP",
    img: "/races/portugal.webp",
    blurb:
      "Una montaña rusa de asfalto con impresionantes cambios de elevación.",
    regionFallback: "Europa",
  },
  portimao: {
    name: "Portuguese GP",
    img: "/races/portugal.webp",
    blurb:
      "Una montaña rusa de asfalto con impresionantes cambios de elevación.",
    regionFallback: "Europa",
  },
};

function findCircuitMeta(
  circuitName: string,
  cityName: string,
  countryName: string,
): CircuitMeta | null {
  const normalized = `${circuitName} ${cityName} ${countryName}`.toLowerCase();
  for (const [key, meta] of Object.entries(KNOWN_CIRCUITS_META)) {
    if (normalized.includes(key)) {
      return meta;
    }
  }
  return null;
}

function formatBadgeDate(dateString: string): string {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length >= 3) {
    const day = parts[2].padStart(2, "0");
    const monthIndex = parseInt(parts[1], 10) - 1;
    const month = MONTH_NAMES_ES[monthIndex] || "";
    return `${day} ${month}`;
  }
  const d = new Date(dateString);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = MONTH_NAMES_ES[d.getMonth()] || "";
    return `${day} ${month}`;
  }
  return dateString;
}

/** Nombre del Gran Premio para mostrar, igual en el calendario y en las reservas. */
export function getRaceName(
  circuitName: string,
  cityName: string,
  countryName: string,
): string {
  const meta = findCircuitMeta(circuitName, cityName, countryName);
  return (
    meta?.name ||
    (countryName
      ? `${countryName} GP`
      : cityName
        ? `${cityName} GP`
        : circuitName)
  );
}

export function mapBackendEventToRace(event: BackendEvent): Race {
  const circuit = event.circuito;
  const city = circuit?.ciudad;
  const country = city?.pais;

  const circuitName = circuit?.nombre || "Circuito Desconocido";
  const cityName = city?.nombre || "";
  const countryName = country?.nombre || "";

  const meta = findCircuitMeta(circuitName, cityName, countryName);

  // Fecha y Badge
  // Usamos fechaFin para el día principal de carrera (domingo)
  const targetDateStr = event.fechaFin || event.fechaInicio || "2026-01-01";
  const badge = formatBadgeDate(targetDateStr);
  const isoDate = targetDateStr.includes("T")
    ? targetDateStr
    : `${targetDateStr}T14:00:00`;

  // Región
  const rawContinent = (country?.continente || "").toLowerCase().trim();
  const region =
    CONTINENT_MAP[rawContinent] ||
    meta?.regionFallback ||
    country?.continente ||
    "Internacional";

  // Nombre de la carrera
  const name = getRaceName(circuitName, cityName, countryName);

  // Imagen
  const img = meta?.img || "/races/madrid.webp";

  // Blurb
  const blurb =
    meta?.blurb ||
    `Gran Premio en ${circuitName}, ${cityName}, ${countryName}. ${circuit?.vueltas || 50} vueltas en un trazado de ${circuit?.longitudKm || 5.0} km con ${circuit?.curvas || 15} curvas.`;

  // Estado
  const isFinished =
    event.estado?.toLowerCase() === "finalizado" ||
    new Date(isoDate) < new Date();

  return {
    id: event.idEvento,
    name,
    circuit: circuitName,
    img,
    badge,
    blurb,
    date: isoDate,
    region,
    raced: isFinished,
    longitud_km: circuit?.longitud_km ?? circuit?.longitudKm ?? (event as any).longitud_km ?? "-",
    curvas: circuit?.curvas ?? (event as any).curvas ?? "-",
    vueltas: circuit?.vueltas ?? (event as any).vueltas ?? "-",
    capacidad: circuit?.capacidad ?? (event as any).capacidad ?? "-",
    record: circuit?.record ?? (event as any).record ?? "-",
    velocidad_maxima: circuit?.velocidad_maxima ?? (event as any).velocidad_maxima ?? "-",
    maximo_ganador: circuit?.maximo_ganador ?? (event as any).maximo_ganador ?? "-",
    circuit_svg_url: (() => {
      let rawUrl = circuit?.circuit_svg_url ?? (event as any).circuit_svg_url ?? circuit?.mapaSvgUrl ?? "";
      if (rawUrl) {
        rawUrl = rawUrl.replace(/\\/g, "/");
        if (rawUrl.toLowerCase().startsWith("public/")) {
          rawUrl = rawUrl.substring(6);
        }
        if (!rawUrl.startsWith("/")) {
          rawUrl = "/" + rawUrl;
        }
      }
      return rawUrl;
    })(),
  };
}

/**
 * Consulta directa a la API de Render (sin API routes de Next.js) y mapea a Race[]
 */
export async function fetchEventsFromBackend(): Promise<Race[]> {
  const data = await getEvents();
  return data.map(mapBackendEventToRace);
}

/**
 * Consulta directa a la API de Render para un único evento (sin API routes de Next.js)
 */
export async function fetchEventByIdFromBackend(
  id: string,
): Promise<Race | null> {
  const event = await getEventById(id);
  if (!event) return null;
  return mapBackendEventToRace(event);
}
