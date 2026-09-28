"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IconClose from "./icons/IconClose";
import IconMenu from "./icons/IconMenu";
import { NAV_LINKS } from "@/utils/NavLinks";
import Home from "./Home";
import ProfileCircle from "./ProfileCircle";

export interface NavbarProps {
    scrolled: boolean;
    menuOpen: boolean;
    setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

import { isLogged } from "@/utils/mockData/isLogged";
import { NotificationBell } from "./NotificationBell";

export default function Navbar({scrolled, menuOpen, setMenuOpen}: NavbarProps) {
    const router = useRouter();

    return (
        <header
            className={
            "fixed inset-x-0 top-0 z-50 transition-colors duration-300 " +
            (scrolled
                ? "bg-[#0B0B10]/90 backdrop-blur border-b border-[#1C1D24]"
                : "bg-transparent border-b border-transparent")
            }
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Home />

            <nav className="hidden items-center gap-8 md:flex">
                {NAV_LINKS.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    className="group relative text-sm text-[#D8D7CE] transition-colors hover:text-[#F3F1EA]"
                >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#E10600] transition-all duration-300 group-hover:w-full" />
                </a>
                ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
                {isLogged && <NotificationBell />}
                <ProfileCircle 
                    isLoggedIn={isLogged} 
                    name="Octavio Cosentino" 
                    onLoginClick={() => router.push("/login")}
                    onProfileClick={() => router.push("/profile")}
                />
            </div>

            <div className="flex items-center gap-3 md:hidden">
                {isLogged && <NotificationBell />}
                <button
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    onClick={() => setMenuOpen((v) => !v)}
                    className="text-[#F3F1EA]"
                >
                    {menuOpen ? (
                        <IconClose className="h-6 w-6" />
                        ) : (
                        <IconMenu className="h-6 w-6" />
                    )}
                </button>
            </div>
            </div>

            {/* Menu */}
            {menuOpen && (
                <div className="border-t border-[#1C1D24] bg-[#0B0B10] px-6 pb-6 md:hidden">
                <nav className="flex flex-col gap-4 pt-4">
                    {NAV_LINKS.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="text-sm text-[#D8D7CE] hover:text-[#F3F1EA]"
                    >
                        {link.label}
                    </a>
                    ))}
                    <ProfileCircle 
                        isLoggedIn={isLogged} 
                        name="Octavio Cosentino" 
                        onLoginClick={() => router.push("/login")}
                        onProfileClick={() => router.push("/profile")}
                    />
                </nav>
                </div>
            )}
        </header>
    );
}