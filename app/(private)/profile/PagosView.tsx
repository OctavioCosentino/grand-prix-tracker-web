"use client";

import React, { useState } from "react";
import PaymentCard from "@/components/PaymentCard";
import AddPaymentModal from "@/components/AddPaymentModal";
import { CARD_DATA } from "@/utils/mockData/cardDetails";

export default function PagosView() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="font-display mb-6 text-2xl font-900 tracking-tight">
        Caja de Herramientas
      </h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_DATA.map((card, index) => (
          <PaymentCard 
            key={index}
            brand={card.brand}
            last4={card.last4}
            holderName={card.holderName}
            glowColor={card.glowColor}
          />
        ))}

        {/* Agregar nueva */}
        <button 
          onClick={() => setIsModalOpen(true)}
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
      />
    </div>
  );
}