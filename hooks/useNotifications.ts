"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationItem } from "@/app/types/notification";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  getStoredNotifications,
  getStorageKey,
  deduplicateNotifications,
} from "@/services/notifications";

export const notificationQueryKeys = {
  all: (userId?: string) => ["notifications", userId ?? "guest"] as const,
};

/**
 * Hook de TanStack Query para gestionar notificaciones de manera reactiva,
 * sincronizando cache local y sondeo en segundo plano sin llamadas duplicadas.
 */
export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();

  // Escuchar adición inmediata de notificaciones para actualizar la caché en el mismo frame
  useEffect(() => {
    const onAdded = (e: Event) => {
      const item = (e as CustomEvent<NotificationItem>).detail;
      if (!item) return;
      queryClient.setQueryData<NotificationItem[]>(
        notificationQueryKeys.all(userId),
        (old = []) => deduplicateNotifications([item, ...old])
      );
    };

    window.addEventListener("gpt_notification_added", onAdded);
    return () => window.removeEventListener("gpt_notification_added", onAdded);
  }, [queryClient, userId]);

  const query = useQuery<NotificationItem[], Error>({
    queryKey: notificationQueryKeys.all(userId),
    queryFn: async () => {
      const local = getStoredNotifications(userId);
      try {
        const remote = await fetchNotifications(userId);
        // Priorizar las locales para conservar estado leído y nuevas ofertas/compras inmediatas
        const merged = deduplicateNotifications([...local, ...remote]);
        if (typeof window !== "undefined") {
          localStorage.setItem(getStorageKey(userId), JSON.stringify(merged));
        }
        return merged;
      } catch {
        return local;
      }
    },
    initialData: () => getStoredNotifications(userId),
    enabled: Boolean(userId),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return markAsRead(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all(userId) });
      const current =
        queryClient.getQueryData<NotificationItem[]>(
          notificationQueryKeys.all(userId)
        ) ?? getStoredNotifications(userId);

      const updated = current.map((n) =>
        n.idNotificacion === id ? { ...n, leido: true } : n
      );
      queryClient.setQueryData(notificationQueryKeys.all(userId), updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
      }
      return { previous: current };
    },
    onSettled: () => {
      // Mantener estado confirmado sin revertir
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async (unreadItems: NotificationItem[]) => {
      return markAllAsRead(unreadItems, userId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all(userId) });
      const current =
        queryClient.getQueryData<NotificationItem[]>(
          notificationQueryKeys.all(userId)
        ) ?? getStoredNotifications(userId);

      const updated = current.map((n) => ({ ...n, leido: true }));
      queryClient.setQueryData(notificationQueryKeys.all(userId), updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
      }
      return { previous: current };
    },
    onSettled: () => {
      // Mantener estado confirmado sin revertir
    },
  });

  return {
    ...query,
    notifications: query.data ?? [],
    unreadCount: (query.data ?? []).filter((n) => !n.leido).length,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
  };
}
