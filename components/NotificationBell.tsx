"use client";

import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { NotificationItem, NotificationType } from "../app/types/notification";
import { useAuth } from "./providers/AuthProvider";
import {
  API_BASE_URL,
  DEFAULT_NOTIFICATIONS,
  getStoredNotifications,
  saveStoredNotifications,
  addNotification,
  simulateOfferNotification,
  deduplicateNotifications,
  isMockOrder,
  purgeMockOrders,
  playNotificationSound,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
} from "@/services/notifications";

let lastToastTime = 0;

export function NotificationBell() {
  const { user } = useAuth();
  const userId = user?.id;
  const isLoggedIn = Boolean(user);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    purgeMockOrders();
  }, []);

  const fetchNotifications = async () => {
    // 1. Cargar almacenamiento local persistente primero
    const local = getStoredNotifications(userId);
    setNotifications(local);
    setUnreadCount(local.filter((n) => !n.leido).length);

    try {
      const res = await fetch(
        `${API_BASE_URL}/notifications?userId=${encodeURIComponent(userId ?? "")}`,
      );
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Filtrar cualquier pedido mock que haya quedado en la API
          const cleanRemoteData: NotificationItem[] = json.data.filter(
            (item: NotificationItem) => !isMockOrder(item)
          );

          // Si no es la primera carga y detectamos una nueva que no teníamos antes:
          if (!isFirstLoad.current) {
            const newest = cleanRemoteData.find(
              (item) =>
                !item.leido &&
                !local.some(
                  (l) =>
                    l.idNotificacion === item.idNotificacion ||
                    (l.titulo === item.titulo && l.mensaje === item.mensaje)
                )
            );
            if (newest) {
              playNotificationSound();
              showToast(newest.titulo, newest.mensaje, newest.tipo);
            }
          }
          isFirstLoad.current = false;

          // Combinar remoto y local evitando duplicados tanto por ID como por contenido
          const merged: NotificationItem[] = [...cleanRemoteData];
          for (const item of local) {
            const existsInRemote = cleanRemoteData.some(
              (r) =>
                r.idNotificacion === item.idNotificacion ||
                (r.titulo === item.titulo && r.mensaje === item.mensaje)
            );
            if (!existsInRemote) {
              merged.push(item);
            }
          }

          const deduped = deduplicateNotifications(merged);
          saveStoredNotifications(deduped, userId);
          setNotifications(deduped);
          setUnreadCount(deduped.filter((n) => !n.leido).length);
          return;
        }
      }
      throw new Error("No se pudo obtener notificaciones del servidor");
    } catch {
      isFirstLoad.current = false;
      // Fallback si no había nada local tampoco
      if (local.length === 0) {
        saveStoredNotifications(DEFAULT_NOTIFICATIONS, userId);
        setNotifications(DEFAULT_NOTIFICATIONS);
        setUnreadCount(DEFAULT_NOTIFICATIONS.filter((n) => !n.leido).length);
      }
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    const handleAdded = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationItem>;
      if (customEvent.detail) {
        const notif = customEvent.detail;
        showToast(notif.titulo, notif.mensaje, notif.tipo);
        if (notif.tipo !== "ORDER_CONFIRMATION") {
          playNotificationSound();
        }
      }
      const local = getStoredNotifications(userId);
      setNotifications(local);
      setUnreadCount(local.filter((n) => !n.leido).length);
    };

    const handleChanged = () => {
      const local = getStoredNotifications(userId);
      setNotifications(local);
      setUnreadCount(local.filter((n) => !n.leido).length);
    };

    window.addEventListener("gpt_notification_added", handleAdded);
    window.addEventListener("gpt_notifications_changed", handleChanged);

    const interval = setInterval(fetchNotifications, 15000);
    return () => {
      window.removeEventListener("gpt_notification_added", handleAdded);
      window.removeEventListener("gpt_notifications_changed", handleChanged);
      clearInterval(interval);
    };
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (
    title: string,
    message: string,
    type: NotificationType,
  ) => {
    const now = Date.now();
    // Evitar toasts duplicados si dos componentes escuchan el mismo evento
    if (now - lastToastTime < 800) return;
    lastToastTime = now;

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          } pointer-events-auto flex max-w-sm w-full items-start gap-3 rounded-md border border-[#E10600]/50 bg-[#131318]/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-200`}
        >
          <div className="flex-1 min-w-0">
            <h5 className="text-[13px] font-bold text-[#F3F1EA]">
              {title}
            </h5>
            <p className="mt-0.5 text-xs text-[#93949F] leading-snug break-words">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="text-[#93949F] hover:text-[#F3F1EA] text-xs font-mono cursor-pointer transition-colors p-0.5"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ),
      {
        id: `notif-${title}`,
        duration: 5000,
        position: "bottom-right",
      }
    );
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const current = getStoredNotifications(userId);
    const updated = current.map((n) =>
      n.idNotificacion === id ? { ...n, leido: true } : n
    );
    saveStoredNotifications(updated, userId);
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.leido).length);

    try {
      await apiMarkAsRead(id);
    } catch {
      // Offline fallback
    }
  };

  const handleMarkAllAsRead = async () => {
    const current = getStoredNotifications(userId);
    const unreadList = current.filter((n) => !n.leido);
    const updated = current.map((n) => ({ ...n, leido: true }));
    saveStoredNotifications(updated, userId);
    setNotifications(updated);
    setUnreadCount(0);

    try {
      await apiMarkAllAsRead(unreadList, userId);
    } catch {
      // Offline fallback
    }
  };

  const handleSimulate = async () => {
    await simulateOfferNotification(userId);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.leido;
    return true;
  });

  const getBadgeStyle = (type: NotificationType) => {
    switch (type) {
      case "ORDER_CONFIRMATION":
        return "bg-[#E7B33C]/20 text-[#E7B33C] border-[#E7B33C]/40";
      case "OFFER":
        return "bg-[#E10600]/20 text-[#FF4D4D] border-[#E10600]/40";
      case "SYSTEM":
        return "bg-[#7C4DFF]/20 text-[#A382FF] border-[#7C4DFF]/40";
      default:
        return "bg-[#93949F]/20 text-[#D8D7CE] border-[#93949F]/40";
    }
  };

  const getBadgeLabel = (type: NotificationType) => {
    switch (type) {
      case "ORDER_CONFIRMATION":
        return "COMPRA";
      case "OFFER":
        return "OFERTA";
      case "SYSTEM":
        return "SISTEMA";
      default:
        return "AVISO";
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return "hace un momento";
      if (diffSecs < 3600) return `hace ${Math.floor(diffSecs / 60)} min`;
      if (diffSecs < 86400) return `hace ${Math.floor(diffSecs / 3600)} h`;
      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notificaciones"
        className="relative flex h-10 w-10 items-center justify-center rounded-sm border border-[#1C1D24] bg-[#131318] text-[#D8D7CE] transition-colors hover:border-[#33343D] hover:text-[#F3F1EA] cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E10600] px-1 font-mono text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-md border border-[#1C1D24] bg-[#131318] shadow-2xl z-50 overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[#1C1D24] px-4 py-3 bg-[#0B0B10]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#F3F1EA]">
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#E10600]/20 px-2 py-0.5 font-mono text-[10px] text-[#FF4D4D] border border-[#E10600]/30">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-[#93949F] hover:text-[#F3F1EA] transition-colors cursor-pointer"
              >
                Marcar todas
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex border-b border-[#1C1D24] bg-[#0B0B10]/50 px-4 py-2 gap-4">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`text-xs font-medium transition-colors ${
                filter === "all"
                  ? "text-[#E10600] border-b-2 border-[#E10600] pb-1"
                  : "text-[#93949F] hover:text-[#F3F1EA]"
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`text-xs font-medium transition-colors ${
                filter === "unread"
                  ? "text-[#E10600] border-b-2 border-[#E10600] pb-1"
                  : "text-[#93949F] hover:text-[#F3F1EA]"
              }`}
            >
              No leídas ({unreadCount})
            </button>
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#1C1D24]/60 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#131318] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#33343D] hover:[&::-webkit-scrollbar-thumb]:bg-[#5C5D66]">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#93949F]">
                No tenés notificaciones {filter === "unread" ? "no leídas" : ""}
                .
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.idNotificacion}
                  onClick={() => {
                    if (!notif.leido) handleMarkAsRead(notif.idNotificacion);
                    if (notif.urlDestino)
                      window.location.href = notif.urlDestino;
                  }}
                  className={`p-3.5 transition-colors cursor-pointer hover:bg-[#1C1D24]/50 ${
                    !notif.leido ? "bg-[#0B0B10]/60" : "opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-mono font-bold border ${getBadgeStyle(
                        notif.tipo,
                      )}`}
                    >
                      {getBadgeLabel(notif.tipo)}
                    </span>
                    <span className="font-mono text-[10px] text-[#93949F]">
                      {formatTime(notif.creadoEn)}
                    </span>
                  </div>
                  <h4 className="mt-1 text-[13px] font-bold text-[#F3F1EA]">
                    {notif.titulo}
                  </h4>
                  <p className="mt-0.5 text-xs text-[#93949F] line-clamp-2 leading-relaxed">
                    {notif.mensaje}
                  </p>
                  {!notif.leido && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E10600]"></span>
                      <button
                        type="button"
                        onClick={(e) =>
                          handleMarkAsRead(notif.idNotificacion, e)
                        }
                        className="text-[10px] text-[#93949F] hover:text-[#F3F1EA] cursor-pointer"
                      >
                        Marcar leída
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Botón de simulación para pruebas en vivo */}
          <div className="border-t border-[#1C1D24] bg-[#0B0B10] p-2.5">
            <button
              type="button"
              onClick={handleSimulate}
              className="w-full rounded-sm border border-[#E10600]/40 bg-[#E10600]/10 py-1.5 text-[10px] font-semibold text-[#FF4D4D] hover:bg-[#E10600]/20 transition-colors cursor-pointer"
            >
              + Simular Oferta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
