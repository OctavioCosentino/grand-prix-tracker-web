"use client";

import React from "react";
import ButtonChecker from "@/components/ButtonChecker";
import { useAuth } from "@/components/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { getDisplayName } from "@/utils/auth";
import { COUNTRY_DIAL_CODES } from "@/utils/dialCodes";
import { UserProfile, UpdateProfilePayload } from "@/services/users";
import TireShelfPicker from "@/components/TireShelfPicker";
import type { User } from "@supabase/supabase-js";
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

interface DatosFormProps {
  user: User | null;
  profile: UserProfile | null | undefined;
  isPending: boolean;
  setPreviewColor: (color: string | null) => void;
  updateProfile: (
    payload: UpdateProfilePayload,
    options?: {
      onSuccess?: () => void;
      onError?: (err: unknown) => void;
    }
  ) => void;
  isUpdating: boolean;
}

function DatosForm({
  user,
  profile,
  isPending,
  setPreviewColor,
  updateProfile,
  isUpdating,
}: DatosFormProps) {
  const initialPhone = React.useMemo(() => {
    const rawTel =
      profile?.telefono || user?.user_metadata?.telefono || user?.phone || "";
    let matchedCode = "+54";
    let remainingDigits = "";

    if (rawTel.includes("+")) {
      const plusIdx = rawTel.indexOf("+");
      const twoDigitsCode = rawTel.slice(plusIdx, plusIdx + 3);
      const match =
        COUNTRY_DIAL_CODES.find((c) => c.dialCode === twoDigitsCode) ||
        COUNTRY_DIAL_CODES.find((c) => rawTel.startsWith(c.dialCode));

      if (match) {
        matchedCode = match.dialCode;
        remainingDigits = rawTel.replace(match.dialCode, "");
      } else {
        remainingDigits = rawTel.replace("+", "");
      }
    } else {
      remainingDigits = rawTel;
    }

    const digits = remainingDigits.replace(/\D/g, "").slice(0, 10);
    return {
      countryCode: matchedCode,
      phoneNumber: formatPhone(digits),
    };
  }, [profile?.telefono, user?.user_metadata?.telefono, user?.phone]);

  const initialDni = React.useMemo(() => {
    const rawDni =
      profile?.dni ||
      user?.user_metadata?.dni ||
      user?.user_metadata?.documento ||
      "";
    return rawDni ? formatDni(rawDni) : "";
  }, [profile?.dni, user?.user_metadata?.dni, user?.user_metadata?.documento]);

  const initialNombreCompleto = React.useMemo(() => {
    const profileFullName = [profile?.nombre, profile?.apellido]
      .filter(Boolean)
      .join(" ");
    if (profileFullName) return profileFullName;
    if (user) return getDisplayName(user);
    return "";
  }, [profile?.nombre, profile?.apellido, user]);

  const [countryCode, setCountryCode] = React.useState(initialPhone.countryCode);
  const [phoneNumber, setPhoneNumber] = React.useState(initialPhone.phoneNumber);
  const [dni, setDni] = React.useState(initialDni);
  const [nombreCompleto, setNombreCompleto] = React.useState(initialNombreCompleto);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(
    profile?.color ?? null
  );

  const [isCountryOpen, setIsCountryOpen] = React.useState(false);
  const [phoneError, setPhoneError] = React.useState("");
  const countryRef = React.useRef<HTMLDivElement>(null);

  // Referencia para saber si se guardó antes de salir y revertir si no
  const isSavedRef = React.useRef(false);
  const initialColorRef = React.useRef<string | null>(profile?.color ?? null);

  React.useEffect(() => {
    const originalColor = initialColorRef.current;
    return () => {
      // Si el usuario seleccionó un color temporal pero no guardó ("Actualizar Setup"), se revierte la vista previa al salir
      if (!isSavedRef.current) {
        setPreviewColor(originalColor);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    setDni(formatDni(digits));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(formatPhone(digits));
    if (phoneError) setPhoneError("");
  };

  const handleSelectColor = (colorHex: string | null) => {
    setSelectedColor(colorHex);
    // Cambia inmediatamente la rueda en el Navbar y la del costado de Piloto Activo (en vivo)
    setPreviewColor(colorHex);
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
      finalTelefono = `${countryCode} ${formatPhone(digitsPhone)}`;
    }

    const parts = nombreCompleto.trim().split(" ");
    const nombre = parts[0] || "";
    const apellido = parts.slice(1).join(" ") || "";
    const rawDniDigits = dni.replace(/\D/g, "");

    updateProfile(
      {
        nombre,
        apellido,
        telefono: finalTelefono,
        dni: rawDniDigits ? Number(rawDniDigits) : null,
        color: selectedColor,
      },
      {
        onSuccess: () => {
          isSavedRef.current = true;
          initialColorRef.current = selectedColor;
          toast.success("Perfil actualizado correctamente");
        },
        onError: (error) => {
          console.error("Error saving profile:", error);
          toast.error("Error al actualizar el perfil", { icon: "⚠️" });
        },
      }
    );
  };

  const selectedCountry = COUNTRY_DIAL_CODES.find(
    (c) => c.dialCode === countryCode
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#7E808F]">
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
        <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#7E808F]">
          Correo Electrónico
        </label>
        <input
          type="email"
          defaultValue={user?.email ?? ""}
          disabled
          placeholder={isPending ? "Cargando..." : "Ingresar correo electrónico"}
          className="w-full rounded-sm border border-[#1C1D24] bg-[#0B0B10] px-4 py-3.5 text-sm text-[#5C5D66] outline-none opacity-70 cursor-not-allowed"
        />
      </div>
      <div className="flex flex-col gap-2 md:col-span-1">
        <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#7E808F]">
          Teléfono
        </label>
        <div className="flex gap-2 w-full">
          <div ref={countryRef} className="relative w-28 shrink-0">
            <button
              type="button"
              onClick={() => !isPending && setIsCountryOpen((prev) => !prev)}
              disabled={isPending}
              className={`w-full flex items-center justify-between gap-1.5 rounded-sm border ${
                phoneError && !countryCode
                  ? "border-[#E10600]"
                  : "border-[#33343D]"
              } bg-[#131318] px-3 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50 cursor-pointer`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {selectedCountry ? (
                  <>
                    <span
                      className={`${selectedCountry.flag} shrink-0 rounded-[2px]`}
                    />
                    <span className="font-mono text-sm text-[#F3F1EA]">
                      {selectedCountry.dialCode}
                    </span>
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
              <div className="absolute top-full left-0 mt-1 z-30 w-full max-h-56 overflow-y-auto rounded-sm border border-[#33343D] bg-[#131318] py-1 shadow-2xl [scrollbar-width:thin] [scrollbar-color:#33343D_#131318] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#131318] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#33343D] hover:[&::-webkit-scrollbar-thumb]:bg-[#5C5D66]">
                {COUNTRY_DIAL_CODES.map((item) => (
                  <button
                    key={item.dialCode}
                    type="button"
                    onClick={() => {
                      setCountryCode(item.dialCode);
                      setIsCountryOpen(false);
                      if (phoneError) setPhoneError("");
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer ${
                      countryCode === item.dialCode
                        ? "bg-[#1C1D24] text-[#E10600] font-bold"
                        : "text-[#F3F1EA] hover:bg-[#1C1D24]"
                    }`}
                  >
                    <span className={`${item.flag} shrink-0 rounded-[2px]`} />
                    <span className="font-mono text-sm">{item.dialCode}</span>
                  </button>
                ))}
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
        <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#7E808F]">
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

      {/* Primer Divisor pegado a los inputs superiores */}
      <div className="md:col-span-2 mt-1 pt-4 border-t border-[#1C1D24] flex flex-col gap-4">
        {/* Título de sección de compuestos */}
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] text-[#93949F]">
            Elegí el compuesto para la carrera
          </label>
          {selectedColor && (
            <span className="font-mono text-[10px] tracking-wider text-[#34D399] uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
              Compuesto seleccionado
            </span>
          )}
        </div>

        {/* Estantería de 2 niveles con 3 ruedas arriba y 2 abajo */}
        <div className="rounded-md border border-[#1C1D24] bg-[#0B0B10]/80 p-4 sm:p-6 shadow-inner">
          <TireShelfPicker
            selectedColor={selectedColor}
            onSelectColor={handleSelectColor}
          />
        </div>
      </div>

      {/* Segundo Divisor debajo de la estantería */}
      <div className="md:col-span-2 mt-1 pt-6 border-t border-[#1C1D24] flex items-center gap-4">
        <ButtonChecker
          type="submit"
          showArrow={true}
          disabled={isUpdating || isPending}
          className="px-8 py-3"
        >
          {isUpdating ? "Actualizando..." : "Actualizar Setup"}
        </ButtonChecker>
      </div>
    </form>
  );
}

export default function DatosView() {
  const { user } = useAuth();
  const { profile, isPending, setPreviewColor, updateProfile, isUpdating } =
    useProfile();

  if (isPending && !profile) {
    return (
      <div className="animate-in fade-in duration-300">
        <h3 className="font-display mb-6 text-2xl font-900 tracking-tight">
          Telemetría del Piloto
        </h3>
        <div className="py-16 text-center font-mono text-xs text-[#93949F]">
          Cargando telemetría del piloto...
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="font-display mb-6 text-2xl font-900 tracking-tight">
        Telemetría del Piloto
      </h3>
      <DatosForm
        key={user?.id ?? "user"}
        user={user}
        profile={profile}
        isPending={isPending}
        setPreviewColor={setPreviewColor}
        updateProfile={updateProfile}
        isUpdating={isUpdating}
      />
    </div>
  );
}
