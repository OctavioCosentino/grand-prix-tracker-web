import React, { useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { MetodoPago } from "@/services/paymentMethods";
import { BookingAction, BookingState } from "@/utils/booking";
import { QueryStatus } from "./BookingNotice";
import PaymentCard from "./PaymentCard";
import AddPaymentModal from "./AddPaymentModal";
import { getBrandFromLast4 } from "@/utils/banksImages";
import { useAuth } from "@/components/providers/AuthProvider";
import { getDisplayName } from "@/utils/auth";

interface BookingPaymentStepProps {
  paymentQuery: UseQueryResult<MetodoPago[], Error>;
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
}

export function describeCardType(tipo: MetodoPago["tipo"]): string {
  return tipo === "Credito" ? "Crédito" : "Débito";
}

export default function BookingPaymentStep({
  paymentQuery,
  state,
  dispatch,
}: BookingPaymentStepProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const pago = state.pago;
  const [tempNewCard, setTempNewCard] = useState<any>(
    pago?.kind === "nueva" ? pago.tarjeta : null
  );
  
  const { user } = useAuth();
  const defaultName = user ? getDisplayName(user) : "Piloto";

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C4DFF]">
          Tarjetas guardadas
        </h2>

        {paymentQuery.isPending || paymentQuery.isError ? (
          <QueryStatus
            isPending={paymentQuery.isPending}
            error={paymentQuery.error}
            onRetry={() => paymentQuery.refetch()}
            loadingText="Cargando tus tarjetas..."
          />
        ) : paymentQuery.data.length === 0 && !tempNewCard ? (
          <p className="text-sm text-[#93949F]">No tenés tarjetas guardadas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {paymentQuery.data.map((card) => {
              const selected =
                pago?.kind === "guardada" && pago.idMetodoPago === card.idMetodoPago;
              
              return (
                <div key={card.idMetodoPago} className={card.vencida ? "opacity-40 cursor-not-allowed" : ""}>
                  <PaymentCard
                    brand={card.marca || getBrandFromLast4(card.ultimos4Digitos)}
                    last4={card.ultimos4Digitos}
                    holderName={card.nombre_titular || defaultName}
                    tipo={card.tipo}
                    selected={selected}
                    editable={false}
                    onClick={() => {
                      if (!card.vencida) {
                        dispatch({
                          type: "setPayment",
                          pago: selected ? null : { kind: "guardada", idMetodoPago: card.idMetodoPago },
                        });
                      }
                    }}
                  />
                  {card.vencida && <p className="mt-1 text-xs text-[#E10600]">Tarjeta vencida</p>}
                </div>
              );
            })}

            {/* MOCK DE TARJETA NUEVA DENTRO DE GUARDADAS */}
            {tempNewCard && (
              <div>
                <PaymentCard
                  brand={getBrandFromLast4(tempNewCard.ultimos4Digitos)}
                  last4={tempNewCard.ultimos4Digitos}
                  holderName={tempNewCard.nombre_titular || defaultName}
                  tipo={tempNewCard.tipo}
                  selected={pago?.kind === "nueva"}
                  editable={false}
                  onClick={() => {
                    if (pago?.kind === "nueva") {
                      dispatch({ type: "setPayment", pago: null });
                    } else {
                      dispatch({ type: "setPayment", pago: { kind: "nueva", tarjeta: tempNewCard } });
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C4DFF]">
          Tarjeta nueva
        </h2>
        
        <button
          onClick={() => {
            setModalMode("add");
            setModalInitialData(null);
            setShowAddModal(true);
          }}
          className="flex h-40 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[#33343D] bg-transparent transition-colors hover:border-[#E10600] hover:bg-[#131318] cursor-pointer sm:w-1/2"
        >
          <span className="text-2xl text-[#5C5D66]">+</span>
          <span className="font-mono text-[10px] tracking-widest text-[#93949F]">
            USAR TARJETA NUEVA
          </span>
        </button>
      </section>

      <AddPaymentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        mode={modalMode}
        initialData={modalInitialData}
        onConfirm={async (cardData) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setTempNewCard(cardData);
          dispatch({ 
            type: "setPayment", 
            pago: { kind: "nueva", tarjeta: cardData } 
          });
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
