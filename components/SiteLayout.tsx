"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useScrolled from "@/hooks/useScrolled";

/** Navbar + contenido + Footer. Lo usan las rutas públicas y el perfil. */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-grow">
        {children}
      </div>

      <Footer />
    </div>
  );
}
