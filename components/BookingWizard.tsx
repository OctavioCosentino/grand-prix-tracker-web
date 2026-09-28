"use client";

import React, { useReducer, useState } from "react";
import { notFound } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEvent } from "@/hooks/useEvents";
import {
  bookingQueryKeys,
  useCreateBooking,
  useEventFlights,
  useEventHotels,
  useEventTickets,
  usePaymentMethods,
} from "@/hooks/useBooking";
import { ApiError, hasClientIdentity } from "@/services/http";
import { Reserva } from "@/services/bookings";
import {
  BOOKING_STEPS,
  BookingCatalog,
  BookingStep,
  bookingReducer,
  buildCheckoutRequest,
  buildSummaryLines,
  findStockConflict,
  formatDateES,
  getHotelStay,
  hasAnyItem,
  hasEventEnded,
  initialBookingState,
  todayUtcISO,
  validateBooking,
} from "@/utils/booking";
import Eyebrow from "./EyeBrow";
import ButtonChecker from "./ButtonChecker";
import ButtonOutline from "./ButtonOutline";
import BookingStepper from "./BookingStepper";
import BookingSummary from "./BookingSummary";
import BookingNotice from "./BookingNotice";
import BookingHotelStep from "./BookingHotelStep";
import BookingTicketsStep from "./BookingTicketsStep";
import BookingFlightsStep from "./BookingFlightsStep";
import BookingPaymentStep from "./BookingPaymentStep";
import BookingReviewStep from "./BookingReviewStep";
import BookingConfirmation from "./BookingConfirmation";

const STEP_INTRO: Record<BookingStep, string> = {
  hotel: "Elegí dónde vas a dormir durante el fin de semana de carrera.",
  entradas: "Elegí tu tribuna y cuántas entradas necesitás.",
  vuelos: "Elegí tus vuelos de ida y de vuelta desde Buenos Aires.",
  pago: "Elegí una tarjeta guardada o cargá una nueva.",
  resumen: "Revisá tu paquete antes de confirmar la compra.",
};

/** Mensaje para el usuario a partir de un error del POST /bookings. */
function getSubmitErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isValidationError) {
      // Mensaje técnico del back: solo para debug
      console.error("Checkout rechazado por validación:", error.message);
      return "No pudimos procesar la reserva con los datos ingresados. Revisá el paquete e intentá de nuevo.";
    }
    if (error.status >= 500) {
      return "Hubo un problema en el servidor. Intentá de nuevo en unos minutos.";
    }
    if (error.status === 404) {
      // El message del 404 es genérico del back (en inglés y con el id)
      console.error("Checkout con recurso inexistente:", error.message);
      return "Alguno de los productos o el medio de pago ya no está disponible. Revisá tu paquete e intentá de nuevo.";
    }
    // Reglas de negocio (400/409): el message está en español y es apto para mostrar
    return error.message;
  }
  console.error("Error de red al confirmar la reserva:", error);
  return "No pudimos conectar con el servidor. Antes de reintentar, revisá en tu perfil que la reserva no se haya creado.";
}

export default function BookingWizard({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const clientReady = hasClientIdentity();

  const { event, race, isPending: isEventPending } = useEvent(eventId);
  const hotelsQuery = useEventHotels(eventId);
  const ticketsQuery = useEventTickets(eventId);
  const flightsQuery = useEventFlights(eventId);
  const paymentQuery = usePaymentMethods(clientReady);
  const createBooking = useCreateBooking();

  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);

  if (isEventPending) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-[#F3F1EA]">
        <span className="h-8 w-8 rounded-full border-2 border-[#E10600] border-t-transparent animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#93949F]">
          Preparando tu paquete...
        </p>
      </div>
    );
  }

  if (!event || !race) {
    notFound();
  }

  if (reserva) {
    return <BookingConfirmation reserva={reserva} eventName={race.name} />;
  }

  const stay = getHotelStay(event);
  const today = todayUtcISO();

  if (hasEventEnded(event.fechaFin, today)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <BookingNotice severity="warning" title="Reservas cerradas">
          El {race.name} terminó el {formatDateES(event.fechaFin)}. No es posible reservar
          paquetes para eventos pasados.
        </BookingNotice>
        <div className="mt-6">
          <ButtonChecker href="/calendar" className="px-6 py-3 text-xs" showArrow>
            Ver próximas carreras
          </ButtonChecker>
        </div>
      </div>
    );
  }

  const catalog: BookingCatalog = {
    hotels: hotelsQuery.data ?? [],
    tickets: ticketsQuery.data ?? [],
    flights: flightsQuery.data ?? [],
  };
  const lines = buildSummaryLines(state, catalog, stay.nights);
  const issues = validateBooking(state, catalog, paymentQuery.data ?? []);
  const itemsChosen = hasAnyItem(state);

  const isStepEnabled = (step: BookingStep) => {
    if (step === "pago") return itemsChosen;
    if (step === "resumen") return itemsChosen && state.pago !== null;
    return true;
  };

  const goTo = (step: BookingStep) => {
    setSubmitError(null);
    dispatch({ type: "goTo", step });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepIndex = BOOKING_STEPS.findIndex((s) => s.id === state.step);
  const prevStep = BOOKING_STEPS[stepIndex - 1]?.id;
  const nextStep = BOOKING_STEPS[stepIndex + 1]?.id;

  const stepHasSelection: Record<BookingStep, boolean> = {
    hotel: Object.keys(state.habitaciones).length > 0,
    entradas: Object.keys(state.entradas).length > 0,
    vuelos: state.vueloIda !== null || state.vueloVuelta !== null,
    pago: state.pago !== null,
    resumen: true,
  };

  const handleConfirm = async () => {
    setSubmitError(null);
    dispatch({ type: "clearConflict" });
    if (issues.length) return;

    try {
      const result = await createBooking.mutateAsync(
        buildCheckoutRequest(event.idEvento, state, stay),
      );
      setReserva(result);
      // La compra descontó stock y puede haber guardado una tarjeta nueva
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.hotels(eventId) });
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.tickets(eventId) });
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.flights(eventId) });
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.paymentMethods });
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.bookings });
      window.scrollTo({ top: 0 });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Alguien compró antes: se refresca el stock para ubicar el ítem agotado
        setIsResolvingConflict(true);
        const [hotels, tickets, flights] = await Promise.all([
          hotelsQuery.refetch(),
          ticketsQuery.refetch(),
          flightsQuery.refetch(),
        ]);
        setIsResolvingConflict(false);

        const conflict = findStockConflict(state, {
          hotels: hotels.data ?? [],
          tickets: tickets.data ?? [],
          flights: flights.data ?? [],
        });
        if (conflict) {
          dispatch({
            type: "stockConflict",
            conflict: { ...conflict, message: error.message },
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
      setSubmitError(getSubmitErrorMessage(error));
    }
  };

  const conflictOnThisStep = state.conflict && state.conflict.step === state.step;
  const city = event.circuito.ciudad.nombre;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="border-b border-[#1C1D24] pb-6">
        <Eyebrow>Reserva de Paquete</Eyebrow>
        <h1 className="font-display mt-2 text-4xl font-900 tracking-tight sm:text-5xl">
          {race.name}
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#93949F]">
          {event.circuito.nombre} · {city} · {formatDateES(event.fechaInicio)} –{" "}
          {formatDateES(event.fechaFin)}
        </p>
        <p className="mt-4 max-w-2xl text-[#93949F]">
          Paso {stepIndex + 1}: {STEP_INTRO[state.step]}
        </p>
        <BookingStepper current={state.step} isStepEnabled={isStepEnabled} onStepClick={goTo} />
      </div>

      {!clientReady && (
        <div className="mt-6">
          <BookingNotice severity="danger" title="Compra deshabilitada">
            No hay un usuario identificado, así que podés armar el paquete pero no confirmarlo.
          </BookingNotice>
        </div>
      )}

      {conflictOnThisStep && (
        <div className="mt-6">
          <BookingNotice severity="warning" title="Bandera amarilla">
            {state.conflict!.message}. Ajustá los ítems marcados en rojo; el resto de tu
            paquete sigue igual.
          </BookingNotice>
        </div>
      )}

      {state.step === "resumen" ? (
        <div className="mt-10">
          <BookingReviewStep
            lines={lines}
            stay={stay}
            pago={state.pago}
            paymentMethods={paymentQuery.data ?? []}
            issues={issues}
            submitError={submitError}
            isSubmitting={createBooking.isPending || isResolvingConflict}
            onEdit={goTo}
            onConfirm={handleConfirm}
          />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            {state.step === "hotel" && (
              <BookingHotelStep
                hotelsQuery={hotelsQuery}
                state={state}
                dispatch={dispatch}
                stay={stay}
                checkInPassed={stay.checkIn < today}
              />
            )}
            {state.step === "entradas" && (
              <BookingTicketsStep ticketsQuery={ticketsQuery} state={state} dispatch={dispatch} />
            )}
            {state.step === "vuelos" && (
              <BookingFlightsStep flightsQuery={flightsQuery} state={state} dispatch={dispatch} />
            )}
            {state.step === "pago" && (
              <BookingPaymentStep
                paymentQuery={paymentQuery}
                state={state}
                dispatch={dispatch}
                clientReady={clientReady}
              />
            )}
          </div>

          <BookingSummary lines={lines} stay={stay}>
            <div className="flex flex-col gap-3">
              {nextStep && (
                <ButtonChecker
                  className="w-full py-3.5 font-mono text-[11px] uppercase tracking-widest"
                  showArrow
                  disabled={!isStepEnabled(nextStep)}
                  onClick={() => goTo(nextStep)}
                >
                  {stepHasSelection[state.step] || state.step === "pago"
                    ? "Continuar"
                    : "Saltear paso"}
                </ButtonChecker>
              )}
              {prevStep && (
                <ButtonOutline
                  className="w-full font-mono text-[11px] uppercase tracking-widest"
                  onClick={() => goTo(prevStep)}
                >
                  Atrás
                </ButtonOutline>
              )}
              {nextStep && !isStepEnabled(nextStep) && (
                <p className="text-center font-mono text-[10px] text-[#5C5D66]">
                  {itemsChosen
                    ? "Elegí un medio de pago para continuar."
                    : "Elegí al menos un producto para continuar al pago."}
                </p>
              )}
            </div>
          </BookingSummary>
        </div>
      )}
    </div>
  );
}
