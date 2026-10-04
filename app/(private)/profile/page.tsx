"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/dist/client/components/navigation";
import WarningModal from "@/components/WarningModal";
import DatosView from "./DatosView";
import ReservasView from "./ReservasView";
import PagosView from "./PagosView";
import ProfileCircle from "@/components/ProfileCircle";
import TabButton from "@/components/TabButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { getDisplayName } from "@/utils/auth";

type TabType = "datos" | "reservas" | "pagos";

const TABS: TabType[] = ["datos", "reservas", "pagos"];

export default function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Permite abrir una pestaña desde un link, ej. /profile?tab=reservas después de comprar
  const { tab } = use(searchParams);
  const initialTab = TABS.find((t) => t === tab) ?? "datos";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const displayName = user ? getDisplayName(user) : "";

  return (
    <div className="relative min-h-screen bg-[#0B0B10] pt-24 text-[#F3F1EA] selection:bg-[#E10600] selection:text-white">
      <div className="gpt-carbon pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[600px] rounded-full bg-[#E10600]/5 blur-[150px]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-24 md:flex-row">
        <aside className="flex w-full flex-col gap-2 md:w-72 md:flex-shrink-0">
          <div className="relative mb-6 overflow-hidden rounded-md border border-[#1C1D24] bg-[#0E0E13] p-6 shadow-xl">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 grayscale"
              style={{ backgroundImage: "url('/franco.png')" }}
            />
            <div className="relative z-10 mb-4 flex items-center gap-4">
              <ProfileCircle isLoggedIn={true} name={displayName || "Piloto"} disableSpin={true} />
              <div>
                <h2 className="font-display text-lg font-900 tracking-tight">{displayName}</h2>
                <span className="font-mono text-[10px] tracking-[0.15em] text-[#34D399]">
                  PILOTO ACTIVO
                </span>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <TabButton 
              active={activeTab === "datos"} 
              onClick={() => setActiveTab("datos")}
              label="Telemetría"
              sublabel="Tus datos personales"
            />
            <TabButton 
              active={activeTab === "reservas"} 
              onClick={() => setActiveTab("reservas")}
              label="Historial de Pista"
              sublabel="Paquetes y reservas"
            />
            <TabButton 
              active={activeTab === "pagos"} 
              onClick={() => setActiveTab("pagos")}
              label="Billetera"
              sublabel="Métodos de pago"
            />
          </nav>

          <button
            onClick={() => setIsWarningOpen(true)}
            className="mt-auto flex w-full items-center justify-between rounded-sm border border-[#1C1D24] bg-transparent p-4 text-left transition-colors hover:border-[#E10600] hover:bg-[#E10600]/10 md:mt-8 cursor-pointer"
          >
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#93949F] transition-colors hover:text-[#F3F1EA]">
              Cerrar sesión
            </span>
            <span className="text-[#E10600]">→</span>
          </button>
        </aside>

        <main className="flex-grow rounded-md border border-[#1C1D24] bg-[#0E0E13] p-8 shadow-2xl flex flex-col">
          {activeTab === "datos" && <DatosView />}
          {activeTab === "reservas" && <ReservasView />}
          {activeTab === "pagos" && <PagosView />}
        </main>

      </div>

      {/* MODALS */}
      <WarningModal
        isOpen={isWarningOpen}
        severity="danger"
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        onConfirm={async () => {
          await signOut();
          setIsWarningOpen(false);
          router.replace("/");
          router.refresh();
        }}
        onCancel={() => setIsWarningOpen(false)}
      />
    </div>
  );
};