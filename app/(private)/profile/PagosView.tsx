"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PaymentCard from "@/components/PaymentCard";
import AddPaymentModal from "@/components/AddPaymentModal";
import { getPaymentMethods } from "@/services/paymentMethods";
import getRandomCompound, { tireColors } from "@/utils/tireColors";
import { getBrandFromLast4 } from "@/utils/banksImages";
import { useAuth } from "@/components/providers/AuthProvider";
import { getDisplayName } from "@/utils/auth";
import { MetodoPago } from "@/services/paymentMethods";

export default function PagosView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCard, setSelectedCard] = useState<MetodoPago | null>(null);

  const { user } = useAuth();
  const defaultName = user ? getDisplayName(user) : "Piloto";

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
  });

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedCard(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (card: MetodoPago) => {
    setModalMode("edit");
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="font-display mb-6 text-2xl font-900 tracking-tight">
        Caja de Herramientas
      </h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-md border border-[#1C1D24] bg-[#0E0E13] shadow-lg animate-pulse">
            <span className="font-mono text-[10px] tracking-widest text-[#5C5D66]">
              CARGANDO BILLETERA...
            </span>
          </div>
        ) : (
          cards.map((card) => {
            const fullName = card.nombre_titular || defaultName;

            return (
              <PaymentCard
                key={card.idMetodoPago}
                brand={card.marca || getBrandFromLast4(card.ultimos4Digitos)}
                last4={card.ultimos4Digitos}
                holderName={fullName}
                tipo={card.tipo}
                glowColor={
                  tireColors[getRandomCompound() as keyof typeof tireColors]
                }
                onClick={() => handleOpenEdit(card)}
              />
            );
          })
        )}

        {/* Agregar nueva */}
        <button
          onClick={handleOpenAdd}
          className="flex h-40 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[#33343D] bg-transparent transition-colors hover:border-[#E10600] hover:bg-[#131318] cursor-pointer"
        >
          <span className="text-2xl text-[#5C5D66]">+</span>
          <span className="font-mono text-[10px] tracking-widest text-[#93949F]">
            NUEVO MÉTODO
          </span>
        </button>
      </div>

      {/* Modal */}
      <AddPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedCard}
      />
    </div>
  );
}
