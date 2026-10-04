"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PaymentCard from "@/components/PaymentCard";
import AddPaymentModal from "@/components/AddPaymentModal";
import { getPaymentMethods, addPaymentMethod, updatePaymentMethod, MetodoPago } from "@/services/paymentMethods";
import getRandomCompound, { tireColors } from "@/utils/tireColors";
import { getBrandFromLast4 } from "@/utils/banksImages";
import { useAuth } from "@/components/providers/AuthProvider";
import { getDisplayName } from "@/utils/auth";

export default function PagosView() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCard, setSelectedCard] = useState<MetodoPago | null>(null);

  const { user } = useAuth();
  const defaultName = user ? getDisplayName(user) : "Piloto";

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
  });

  const addMutation = useMutation({
    mutationFn: addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });

  const editMutation = useMutation({
    mutationFn: (params: { id: string; data: any }) => updatePaymentMethod(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
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
            <span className="font-mono text-[10px] tracking-widest text-[#E10600]">
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
        onConfirm={async (cardData) => {
          try {
            if (modalMode === "add") {
              await addMutation.mutateAsync({
                tipo: cardData.tipo,
                ultimos4Digitos: cardData.ultimos4Digitos,
                fechaExpiracion: cardData.fechaExpiracion,
                proveedorToken: cardData.proveedorToken,
                nombre_titular: cardData.nombre_titular,
              });
            } else if (modalMode === "edit" && selectedCard) {
              await editMutation.mutateAsync({
                id: selectedCard.idMetodoPago,
                data: {
                  tipo: cardData.tipo,
                  ultimos4Digitos: cardData.ultimos4Digitos,
                  fechaExpiracion: cardData.fechaExpiracion,
                  proveedorToken: cardData.proveedorToken,
                  nombre_titular: cardData.nombre_titular,
                },
              });
            }
            setIsModalOpen(false);
          } catch (error) {
            console.error("Error guardando el metodo de pago", error);
            // Si el backend tira error, lo vas a ver acá y el modal no se cierra
            throw error; 
          }
        }}
      />
    </div>
  );
}
