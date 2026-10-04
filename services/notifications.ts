import { NotificationItem, NotificationType } from "@/app/types/notification";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface CreateNotificationDto {
  idUsuario?: string | null;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  urlDestino?: string | null;
  metadata?: string | null;
  localOnly?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

let lastSoundTime = 0;

export function playNotificationSound(): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  // Evitar sonido doble si dos eventos o componentes disparan en menos de 1 segundo
  if (now - lastSoundTime < 1000) return;
  lastSoundTime = now;

  try {
    const audio = new Audio("/f1-radio.mp3");
    audio.volume = 0.65;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        console.debug("Autoplay bloqueado hasta interacción:", err);
      });
    }
  } catch (error) {
    console.debug("Error al reproducir audio:", error);
  }
}

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    idNotificacion: "mock-2",
    titulo: "Oferta Flash de Temporada",
    mensaje: "20% OFF en traslados exclusivos para el GP de Interlagos.",
    tipo: "OFFER",
    leido: false,
    urlDestino: "/calendar",
    creadoEn: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export function isMockOrder(item: NotificationItem): boolean {
  if (item.tipo !== "ORDER_CONFIRMATION") return false;
  if (item.idNotificacion === "mock-1") return true;
  if (item.idNotificacion.startsWith("mock")) return true;
  if (item.titulo.includes("GP-8492")) return true;
  if (item.urlDestino === "#como-funciona" || item.urlDestino === "#servicios") return true;
  if (item.mensaje.includes("Paddock Pass") && item.mensaje.includes("Brasil")) return true;
  return false;
}

export function deduplicateNotifications(items: NotificationItem[]): NotificationItem[] {
  const seenIds = new Set<string>();
  const seenContent = new Set<string>();
  const result: NotificationItem[] = [];

  for (const item of items) {
    if (isMockOrder(item)) continue;
    if (seenIds.has(item.idNotificacion)) continue;

    // Si hay ofertas con título y mensaje idénticos, dejamos solo la más reciente
    const contentKey = `${item.tipo}_${item.titulo}_${item.mensaje}`;
    if (seenContent.has(contentKey)) continue;

    seenIds.add(item.idNotificacion);
    seenContent.add(contentKey);
    result.push(item);
  }

  return result;
}

export function getStorageKey(userId?: string): string {
  return userId ? `gpt_notifications_${userId}` : "gpt_notifications_guest";
}

export function purgeMockOrders(): void {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (
        key.startsWith("gpt_notifications") ||
        key.startsWith("gpt_user_notifications")
      ) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const cleaned = deduplicateNotifications(parsed);
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          } catch {}
        }
      }
    }
  } catch {}
}

export function getStoredNotifications(userId?: string): NotificationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const filtered = deduplicateNotifications(parsed);
    if (filtered.length !== parsed.length) {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveStoredNotifications(
  items: NotificationItem[],
  userId?: string
): void {
  if (typeof window === "undefined") return;
  try {
    const deduped = deduplicateNotifications(items);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(deduped));
    window.dispatchEvent(
      new CustomEvent("gpt_notifications_changed", { detail: deduped })
    );
  } catch {}
}

export async function addNotification(
  dto: CreateNotificationDto
): Promise<NotificationItem> {
  const localNotif: NotificationItem = {
    idNotificacion: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    titulo: dto.titulo,
    mensaje: dto.mensaje,
    tipo: dto.tipo,
    leido: false,
    urlDestino: dto.urlDestino || null,
    creadoEn: new Date().toISOString(),
  };

  const userId = dto.idUsuario ?? undefined;
  const current = getStoredNotifications(userId);
  const updated = [localNotif, ...current.filter((n) => n.idNotificacion !== localNotif.idNotificacion)];
  saveStoredNotifications(updated, userId);

  // Notificar evento específico de nueva notificación (para toast y sonido)
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("gpt_notification_added", { detail: localNotif })
    );
  }

  // Si es solo local (por ejemplo ofertas simuladas), no enviar al backend
  if (dto.localOnly) {
    return localNotif;
  }

  // Intentar crear en backend si no es localOnly
  try {
    const remote = await createNotification(dto);
    if (remote?.idNotificacion) {
      const synched = updated.map((n) =>
        n.idNotificacion === localNotif.idNotificacion
          ? { ...n, idNotificacion: remote.idNotificacion }
          : n
      );
      saveStoredNotifications(synched, userId);
      return remote;
    }
  } catch {
    // Si la API falla, mantenemos la copia local
  }

  return localNotif;
}

const SIMULATED_OFFERS = [
  {
    titulo: "Oferta Relámpago",
    mensaje: "¡15% OFF en entradas VIP para el GP de Las Vegas por tiempo limitado!",
    urlDestino: "/calendar",
  },
  {
    titulo: "Promo Exclusiva: Paddock Club",
    mensaje: "2x1 en pases de hospitality para el GP de Silverstone reservando hoy.",
    urlDestino: "/calendar",
  },
  {
    titulo: "Tarifa Especial en Hoteles",
    mensaje: "Hasta 25% de descuento en hoteles seleccionados cercanos al circuito de Monza.",
    urlDestino: "/calendar",
  },
  {
    titulo: "Vuelos a San Pablo con Descuento",
    mensaje: "Tarifa preferencial para viajar al Gran Premio de Interlagos.",
    urlDestino: "/calendar",
  },
  {
    titulo: "Acceso VIP a Boxes",
    mensaje: "Pase libre a boxes antes de la clasificación en Spa con tu reserva.",
    urlDestino: "/calendar",
  },
];

let simulatedOfferCursor = 0;

export async function simulateOfferNotification(
  userId?: string
): Promise<NotificationItem> {
  const offer = SIMULATED_OFFERS[simulatedOfferCursor % SIMULATED_OFFERS.length];
  simulatedOfferCursor++;

  return addNotification({
    idUsuario: userId,
    titulo: offer.titulo,
    mensaje: offer.mensaje,
    tipo: "OFFER",
    urlDestino: offer.urlDestino,
    localOnly: true,
  });
}

export async function fetchNotifications(
  userId?: string,
  unreadOnly: boolean = false
): Promise<NotificationItem[]> {
  const params = new URLSearchParams();
  if (userId) params.append("userId", userId);
  if (unreadOnly) params.append("unreadOnly", "true");

  const url = `${API_BASE_URL}/notifications${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status}: No se pudieron obtener las notificaciones`);
  }
  const json: ApiResponse<NotificationItem[]> = await res.json();
  return json.data || [];
}

export async function fetchUnreadCount(userId?: string): Promise<number> {
  const url = userId
    ? `${API_BASE_URL}/notifications/unread-count?userId=${encodeURIComponent(userId)}`
    : `${API_BASE_URL}/notifications/unread-count`;

  const res = await fetch(url);
  if (!res.ok) return 0;
  const json: ApiResponse<{ unreadCount: number }> = await res.json();
  return json.data?.unreadCount ?? 0;
}

export async function createNotification(
  dto: CreateNotificationDto
): Promise<NotificationItem> {
  const res = await fetch(`${API_BASE_URL}/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: No se pudo crear la notificación`);
  }

  const json: ApiResponse<NotificationItem> = await res.json();
  return json.data;
}

export async function markAsRead(id: string): Promise<NotificationItem> {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}: No se pudo marcar como leída`);
  }
  const json: ApiResponse<NotificationItem> = await res.json();
  return json.data;
}

export async function markAllAsRead(
  unreadItems: NotificationItem[],
  userId?: string
): Promise<void> {
  if (userId) {
    const res = await fetch(
      `${API_BASE_URL}/notifications/read-all?userId=${encodeURIComponent(userId)}`,
      { method: "PATCH" }
    );
    if (res.ok) return;
  }

  await Promise.allSettled(
    unreadItems.map((item) =>
      fetch(`${API_BASE_URL}/notifications/${item.idNotificacion}/read`, {
        method: "PATCH",
      })
    )
  );
}
