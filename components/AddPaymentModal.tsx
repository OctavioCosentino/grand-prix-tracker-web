import React, { useState, useEffect } from "react";
import ButtonChecker from "@/components/ButtonChecker";
import { MetodoPago } from "@/services/paymentMethods";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  initialData?: MetodoPago | null;
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  mode = "add",
  initialData,
}: AddPaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [tipo, setTipo] = useState<"Credito" | "Debito">("Credito");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setCardNumber(`**** **** **** ${initialData.ultimos4Digitos}`);
        setCardName(initialData.nombre_titular || "");
        setExpiry(initialData.fechaExpiracion || "");
        setCvc("***");
        setTipo(initialData.tipo || "Credito");
      } else {
        setCardNumber("");
        setCardName("");
        setExpiry("");
        setCvc("");
        setTipo("Credito");
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(mode === "add" ? "Guardando tarjeta:" : "Editando tarjeta:", {
      cardNumber,
      cardName,
      expiry,
      cvc,
      tipo,
    });
    onClose();
  };

  const isEdit = mode === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0B10]/80 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-md border border-[#1C1D24] bg-[#0E0E13] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#5C5D66] transition-colors hover:text-[#F3F1EA] focus:outline-none cursor-pointer"
        >
          ✕
        </button>

        <div className="mb-6 text-center">
          <span
            className={`font-mono text-[10px] tracking-[0.2em] ${isEdit ? "text-[#E10600]" : "text-[#34D399]"}`}
          >
            {isEdit ? "EDITAR COMPUESTO" : "NUEVO COMPUESTO"}
          </span>
          <h2 className="font-display mt-2 text-2xl font-900 tracking-tight text-[#F3F1EA]">
            {isEdit ? "Editar método de pago" : "Agregar método de pago"}
          </h2>
          <p className="mt-2 text-sm text-[#93949F]">
            {isEdit
              ? "Actualizá los datos de tu tarjeta."
              : "Ingresá los datos de tu tarjeta para habilitar compras rápidas."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
              Número de Tarjeta
            </label>
            <input
              type="text"
              required
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
              Nombre en la Tarjeta
            </label>
            <input
              type="text"
              required
              placeholder="Ayrton Senna"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
                Vencimiento
              </label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="MM/AA"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
                CVC
              </label>
              <input
                type="text"
                required
                maxLength={4}
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
              Tipo de Tarjeta
            </label>
            <div
              className={`w-full rounded-sm border flex justify-between items-center bg-[#131318] px-4 py-3 text-sm text-[#F3F1EA] outline-none transition-colors cursor-pointer ${isDropdownOpen ? "border-[#E10600]" : "border-[#33343D]"}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{tipo === "Credito" ? "Crédito" : "Débito"}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-[#E10600]" : "text-[#5C5D66]"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-[68px] left-0 w-full rounded-sm border border-[#33343D] bg-[#131318] shadow-2xl z-20 overflow-hidden">
                  <div
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-[#1C1D24] hover:text-[#E10600] ${tipo === "Credito" ? "text-[#F3F1EA] bg-[#1C1D24]" : "text-[#93949F]"}`}
                    onClick={() => {
                      setTipo("Credito");
                      setIsDropdownOpen(false);
                    }}
                  >
                    Crédito
                  </div>
                  <div
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-[#1C1D24] hover:text-[#E10600] ${tipo === "Debito" ? "text-[#F3F1EA] bg-[#1C1D24]" : "text-[#93949F]"}`}
                    onClick={() => {
                      setTipo("Debito");
                      setIsDropdownOpen(false);
                    }}
                  >
                    Débito
                  </div>
                </div>
              </>
            )}
          </div>

          <ButtonChecker
            type="submit"
            className="mt-4 w-full py-3.5"
            showArrow={true}
          >
            {isEdit ? "Actualizar Tarjeta" : "Guardar en Billetera"}
          </ButtonChecker>
        </form>
      </div>
    </div>
  );
}
