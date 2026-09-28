export type NotificationType = 'ORDER_CONFIRMATION' | 'OFFER' | 'SYSTEM' | 'REMINDER';

export interface NotificationItem {
  idNotificacion: string;
  idUsuario?: string | null;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  leido: boolean;
  urlDestino?: string | null;
  metadata?: string | null;
  creadoEn: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
