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
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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

  // Fallback o cuando no hay userId: marcar individualmente
  await Promise.allSettled(
    unreadItems.map((item) =>
      fetch(`${API_BASE_URL}/notifications/${item.idNotificacion}/read`, {
        method: "PATCH",
      })
    )
  );
}
