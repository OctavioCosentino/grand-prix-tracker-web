"use client";

import React, { useSyncExternalStore } from "react";
import Image from "next/image";
import { tireColors } from "@/utils/tireColors";
import getRandomCompound from "@/utils/tireColors";

interface AuthButtonProps {
  isLoggedIn: boolean;
  name?: string;
  profilePicUrl?: string;
  onLoginClick?: () => void;
  onProfileClick?: () => void;
  compound?: "soft" | "medium" | "hard" | "inter" | "full_wet";
  disableSpin?: boolean;
}

const emptySubscribe = () => () => {};

let cachedRandomCompound: NonNullable<AuthButtonProps["compound"]> | null =
  null;

function getClientSnapshot(): NonNullable<AuthButtonProps["compound"]> {
  if (!cachedRandomCompound) {
    cachedRandomCompound = getRandomCompound() as NonNullable<
      AuthButtonProps["compound"]
    >;
  }
  return cachedRandomCompound;
}

function getServerSnapshot(): NonNullable<AuthButtonProps["compound"]> {
  return "soft";
}

export default function AuthButton({
  isLoggedIn,
  name = "Octavio",
  profilePicUrl,
  onLoginClick,
  onProfileClick,
  compound,
disableSpin = false,
}: AuthButtonProps) {
  const randomCompound = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const activeCompound = compound ?? randomCompound;
  const stripeColor = tireColors[activeCompound];

  if (!isLoggedIn) {
    return (
      <button
        onClick={onLoginClick}
        className="inline-flex items-center justify-center rounded-sm border border-[#33343D] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#F3F1EA] transition-colors hover:border-[#E10600] hover:text-white cursor-pointer"
      >
        Iniciar sesión / Registrate
      </button>
    );
  }

  const initial = name.charAt(0).toUpperCase();

  return (
    <button
      onClick={onProfileClick}
      className="group relative h-14 w-14 flex-shrink-0 focus:outline-none cursor-pointer"
      title={name}
    >
      <div className={`absolute inset-0 rounded-full bg-[#1C1D24] shadow-[inset_0_4px_6px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4)] transition-transform duration-700 ease-out ${!disableSpin ? "group-hover:rotate-180" : ""}`}>
        <div
          className="absolute inset-[3px] rounded-full border-[3px] border-dashed opacity-70"
          style={{ borderColor: stripeColor }}
        />
        <div
          className="absolute inset-[5px] rounded-full border-[1.5px]"
          style={{ borderColor: stripeColor }}
        />

        <div className="absolute inset-[8px] rounded-full border border-[#33343D] bg-[#0B0B10]" />
        <div className="absolute top-[9px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#93949F] shadow-sm" />
      </div>

      <div className="absolute inset-[11px] z-10 flex items-center justify-center overflow-hidden rounded-full bg-[#131318] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
        {profilePicUrl ? (
          <Image
            src={profilePicUrl}
            alt={`Perfil de ${name}`}
            fill
            className="object-cover"
          />
        ) : (
          <span className="font-display text-lg font-900 text-[#F3F1EA]">
            {initial}
          </span>
        )}
      </div>
    </button>
  );
}
