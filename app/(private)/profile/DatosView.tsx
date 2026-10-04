"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ButtonChecker from "@/components/ButtonChecker";
import { useAuth } from "@/components/providers/AuthProvider";
import { getDisplayName } from "@/utils/auth";
import { createClient } from "@/lib/supabase/client";
import { updateUserProfile } from "@/services/users";
import toast from "react-hot-toast";

function formatDni(value: string | number): string {
  const digits = String(value).replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}`;
}

export default function DatosView() {
  const { user } = useAuth();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [countryCode, setCountryCode] = React.useState("+54");
  const [isCountryOpen, setIsCountryOpen] = React.useState(false);
  const countryRef = React.useRef<HTMLDivElement>(null);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [phoneError, setPhoneError] = React.useState("");
  const [dni, setDni] = React.useState("");
  const [nombreCompleto, setNombreCompleto] = React.useState("");

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryRef.current &&
        !countryRef.current.contains(event.target as Node)
      ) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: cliente, isPending } = useQuery({
    queryKey: ["cliente", user?.id],
    queryFn: async () => {
      if (!user) return null;
      await supabase.auth.refreshSession();
      const { data, error } = await supabase
        .from("clientes")
        .select("telefono, dni")
        .eq("id_cliente", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching cliente:", error);
      }
      return data;
    },
    enabled: !!user,
  });

  React.useEffect(() => {
    const rawTel =
      cliente?.telefono || user?.user_metadata?.telefono || user?.phone || "";
    if (rawTel) {
      if (rawTel.includes("+54")) {
        setCountryCode("+54");
        const digits = rawTel.replace("+54", "").replace(/\D/g, "").slice(0, 10);
        setPhoneNumber(formatPhone(digits));
      } else {
        setCountryCode("+54");
        const digits = rawTel.replace(/\D/g, "").slice(0, 10);
        setPhoneNumber(formatPhone(digits));
      }
    } else {
      setCountryCode("+54");
      setPhoneNumber("");
    }

    const rawDni =
      cliente?.dni ||
      user?.user_metadata?.dni ||
      user?.user_metadata?.documento ||
      "";
    if (rawDni) {
      setDni(formatDni(rawDni));
    } else {
      setDni("");
    }

    if (user) {
      setNombreCompleto(getDisplayName(user));
    }
  }, [cliente, user]);

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cliente", user?.id] });
      toast.success("Perfil actualizado correctamente");
    },
    onError: (error) => {
      console.error("Error saving profile:", error);
      toast.error("Error al actualizar el perfil", { icon: "⚠️" });
    },
  });

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    setDni(formatDni(digits));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(formatPhone(digits));
    if (phoneError) setPhoneError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let finalTelefono: string | null = null;
    const digitsPhone = phoneNumber.replace(/\D/g, "");

    if (digitsPhone || countryCode) {
      if (!countryCode || digitsPhone.length < 10) {
        setPhoneError("Por favor complete el teléfono");
        return;
      }
      finalTelefono = `${countryCode} ${phoneNumber}`;
    }

    // Separar nombre y apellido
    const parts = nombreCompleto.trim().split(" ");
    const nombre = parts[0] || "";
    const apellido = parts.slice(1).join(" ") || "";

    const rawDniDigits = dni.replace(/\D/g, "");

    updateMutation.mutate({
      nombre,
      apellido,
      telefono: finalTelefono,
      dni: rawDniDigits ? Number(rawDniDigits) : null,
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="font-display mb-6 text-2xl font-900 tracking-tight">
        Telemetría del Piloto
      </h3>
      <form
        onSubmit={handleSubmit}
        key={user?.id}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
            Nombre Completo
          </label>
          <input
            type="text"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            disabled={isPending}
            placeholder={isPending ? "Cargando..." : "Ingresar nombre completo"}
            className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
            Correo Electrónico
          </label>
          <input
            type="email"
            defaultValue={user?.email ?? ""}
            disabled
            placeholder={
              isPending ? "Cargando..." : "Ingresar correo electrónico"
            }
            className="w-full rounded-sm border border-[#1C1D24] bg-[#0B0B10] px-4 py-3.5 text-sm text-[#5C5D66] outline-none opacity-70 cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
            Teléfono
          </label>
          <div className="flex gap-2 w-full">
            <div ref={countryRef} className="relative w-28 shrink-0">
              <button
                type="button"
                onClick={() => !isPending && setIsCountryOpen((prev) => !prev)}
                disabled={isPending}
                className={`w-full flex items-center justify-between gap-1.5 rounded-sm border ${
                  phoneError && !countryCode ? "border-[#E10600]" : "border-[#33343D]"
                } bg-[#131318] px-3 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50 cursor-pointer`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {countryCode === "+54" ? (
                    <>
                      <span className="fi fi-ar shrink-0 rounded-[2px]" />
                      <span className="font-mono text-sm text-[#F3F1EA]">+54</span>
                    </>
                  ) : (
                    <span className="text-[#5C5D66] text-sm">--</span>
                  )}
                </div>
                <svg
                  className={`h-4 w-4 text-[#5C5D66] transition-transform duration-200 ${
                    isCountryOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </button>

              {isCountryOpen && (
                <div className="absolute top-full left-0 mt-1 z-30 w-full rounded-sm border border-[#33343D] bg-[#131318] py-1 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCountryCode("");
                      setIsCountryOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-xs text-[#93949F] hover:bg-[#1C1D24] transition-colors cursor-pointer"
                  >
                    --
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCountryCode("+54");
                      setIsCountryOpen(false);
                      if (phoneError) setPhoneError("");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F3F1EA] hover:bg-[#1C1D24] transition-colors cursor-pointer"
                  >
                    <span className="fi fi-ar shrink-0 rounded-[2px]" />
                    <span className="font-mono text-sm">+54</span>
                  </button>
                </div>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={phoneNumber}
              onChange={handlePhoneChange}
              disabled={isPending}
              placeholder={isPending ? "Cargando..." : "11 1234-5678"}
              className={`w-full flex-1 rounded-sm border ${
                phoneError ? "border-[#E10600]" : "border-[#33343D]"
              } bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none focus:border-[#E10600] disabled:opacity-50`}
            />
          </div>
          {phoneError && (
            <span className="font-mono text-[10px] text-[#E10600]">
              {phoneError}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 md:col-span-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
            Pasaporte / ID (Para Vuelos y Hotel)
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={dni}
            onChange={handleDniChange}
            disabled={isPending}
            placeholder={isPending ? "Cargando..." : "12.345.678"}
            className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none focus:border-[#E10600] disabled:opacity-50"
          />
        </div>

        <div className="md:col-span-2 mt-4 flex items-center gap-4 border-t border-[#1C1D24] pt-6">
          <ButtonChecker
            type="submit"
            showArrow={true}
            disabled={updateMutation.isPending || isPending}
            className="px-8 py-3"
          >
            {updateMutation.isPending ? "Actualizando..." : "Actualizar Setup"}
          </ButtonChecker>
        </div>
      </form>
    </div>
  );
}
