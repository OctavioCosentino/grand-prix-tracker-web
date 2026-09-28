import BookingWizard from "@/components/BookingWizard";

/**
 * Wizard de compra de un paquete. Todos los pasos viven en esta página y las
 * elecciones se guardan en memoria del cliente hasta confirmar con POST /bookings.
 */
export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingWizard key={id} eventId={id} />;
}
