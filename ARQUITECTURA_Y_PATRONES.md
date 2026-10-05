# Arquitectura, Patrones de Diseño y Sistema de Notificaciones
**Grand Prix Tracker Web**

Este documento detalla los patrones de diseño de software implementados en el proyecto, la estrategia y principios de desarrollo basado en componentes, y la arquitectura integral del sistema de notificaciones en tiempo real.

---

## 1. Patrones de Diseño de Software

A lo largo del código de la aplicación se emplean diversos patrones de diseño reconocidos en la industria, orientados a maximizar la mantenibilidad, escalabilidad y separación de responsabilidades:

| Patrón | Archivos / Módulos de Aplicación | Explicación y Funcionamiento en el Código |
| :--- | :--- | :--- |
| **Observer / Pub-Sub (Publicador-Suscriptor)** | • `hooks/useNotifications.ts`<br>• `components/NotificationBell.tsx`<br>• `components/providers/AuthProvider.tsx` | Permite el desacoplamiento total entre emisores y receptores de eventos. Cuando ocurre un hecho relevante (por ejemplo, una compra completada en el checkout o una oferta simulada), se despacha un evento desacoplado (`gpt_notification_added`). Los componentes suscritos (la campanita, los avisos toast y el módulo de audio) reaccionan de inmediato sin mantener referencias rígidas entre sí. Asimismo, la sesión de Supabase se escucha reactivamente mediante el observador `onAuthStateChange`. |
| **Facade (Fachada)** | • `hooks/useNotifications.ts`<br>• `hooks/useBooking.ts`<br>• `hooks/useEvents.ts` | Los Custom Hooks encapsulan y simplifican sistemas complejos tras una interfaz limpia y declarativa. Ocultan al componente de UI los detalles de persistencia en `localStorage`, llamadas HTTP asíncronas con `fetch`, gestión de errores y políticas de reintento/invalidación de caché de TanStack Query. |
| **State Machine / Reducer** | • `components/BookingWizard.tsx`<br>• `utils/booking.ts` | El flujo de compra multietapa (hotel, entradas, vuelos, pago y confirmación) está modelado con `useReducer` y funciones puras (`bookingReducer`). Cada acción de usuario (`setHotel`, `setTickets`, `setFlights`, etc.) produce un nuevo estado inmutable y predecible, impidiendo inconsistencias o transiciones no autorizadas. |
| **Provider (Inyección de Dependencias / Context)** | • `components/providers/AuthProvider.tsx`<br>• `app/providers.tsx` (`QueryClientProvider`) | Distribuye servicios y estados transversales (la sesión autenticada del usuario y la instancia de caché de consultas) a través de la jerarquía de React sin incurrir en *prop drilling* (pasaje manual de propiedades de componente a componente). |
| **Optimistic UI (Actualización Optimista)** | • `hooks/useNotifications.ts` | Ante una interacción (como marcar una notificación como leída o simular una oferta), la interfaz y los contadores de la campanita se recalculan y actualizan en 0 ms tanto en memoria como en almacenamiento local, antes y con independencia de la respuesta del servidor remoto, ofreciendo una experiencia sin demoras perceptibles. |
| **Adapter / DTO Mapper** | • `utils/booking.ts`<br>• `services/bookings.ts` | Las funciones `buildCheckoutRequest` y `buildSummaryLines` transforman y adaptan las estructuras de datos complejas del estado de la vista al contrato estricto (Data Transfer Object) exigido por el endpoint REST del backend (`POST /bookings`). |

---

## 2. Desarrollo Basado en Componentes

La arquitectura de interfaz adopta principios de diseño modular para garantizar alta cohesión y bajo acoplamiento:

### Niveles de Componentización

1. **Componentes Atómicos / Primitivas de UI:**
   - Elementos visuales reutilizables, aislados y con responsabilidad estilística y de interacción básica:
     - `components/ButtonChecker.tsx` y `components/ButtonOutline.tsx`: Botones con la identidad visual F1 (banderas a cuadros, variantes de color y hover).
     - `components/QuantityStepper.tsx`: Control numérico con validación de límites para selección de entradas y habitaciones.
     - `components/GoogleAuthButton.tsx`: Botón de autenticación federada con tooltip flotante de estado (*"En desarrollo"*).
     - `components/PasswordStrengthMeter.tsx`: Indicador visual de seguridad de contraseña.

2. **Componentes Moleculares / Especializados:**
   - Módulos con lógica acotada a una función específica:
     - `components/NotificationBell.tsx`: Botón con badge de contador reactivo, popover de gestión, filtros y lista interactiva.
     - `components/LoadingBox.tsx`: Esqueleto y animaciones de carga unificadas.

3. **Componentes de Sección y Asistentes (Organismos):**
   - El asistente de reservas (`BookingWizard.tsx`) delega cada fase en subcomponentes especializados:
     - `components/BookingHotelStep.tsx`
     - `components/BookingTicketsStep.tsx`
     - `components/BookingFlightsStep.tsx`
     - `components/BookingPaymentStep.tsx`
     - `components/BookingReviewStep.tsx`
     - `components/BookingConfirmation.tsx`

### Beneficios Técnicos Obtenidos

- **Mantenibilidad:** Modificar el estilo o validación de un elemento no impacta al resto de la aplicación.
- **Principio DRY (Don't Repeat Yourself):** Eliminación de código HTML/Tailwind duplicado.
- **Rendimiento de Renderizado:** React aísla el ciclo de render únicamente a los subcomponentes cuyo estado ha cambiado.

---

## 3. Arquitectura del Sistema de Notificaciones

El ciclo de vida de una notificación integra persistencia local, caché reactiva en memoria, notificaciones visuales emergentes y retroalimentación sonora:

```
                  ┌──────────────────────────────────────────────┐
                  │             EVENTO DISPARADOR                │
                  │  • Compra confirmada (BookingWizard)         │
                  │  • Oferta simulada (simulateOfferNotification)│
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │           services/notifications.ts          │
                  │  • Asigna ID y fecha ISO                     │
                  │  • Persiste en localStorage                  │
                  │  • Emite evento 'gpt_notification_added'     │
                  └──────┬───────────────────────────────┬───────┘
                         │                               │
                         ▼                               ▼
       ┌───────────────────────────────────┐   ┌───────────────────────────────────┐
       │     hooks/useNotifications.ts     │   │    components/NotificationBell    │
       │  • Escucha en tiempo real         │   │  • Reproduce audio f1-radio.mp3   │
       │  • Actualiza caché TanStack Query │   │  • Despliega Toast emergente      │
       │  • Incrementa badge al instante   │   │  • Incrementa badge visual        │
       └───────────────────────────────────┘   └───────────────────────────────────┘
```

### Fases del Flujo

1. **Generación del Evento:**
   - **Compra:** Al completarse exitosamente una reserva en `BookingWizard.tsx`, se invoca `addNotification` con tipo `ORDER_CONFIRMATION` y el código de compra (ej. *¡Compra #GP-1234 Confirmada!*).
   - **Oferta:** Al presionar `+ Simular Oferta`, se genera un elemento tipo `OFFER` con destino directo al calendario.

2. **Almacenamiento y Sincronización:**
   - Se guarda de inmediato en el `localStorage` del navegador bajo la clave de sesión del usuario.
   - TanStack Query actualiza la lista local en 0 milisegundos mediante actualización de caché directa (`queryClient.setQueryData`).
   - Si la notificación tiene identificador remoto, se sincroniza en segundo plano con la API sin bloquear la navegación ni la UI.

3. **Notificación Visual y Auditiva:**
   - **Sonido:** Se reproduce el efecto de sonido `public/f1-radio.mp3` con un mecanismo de limitación de frecuencia (*throttling*) para evitar reproducciones solapadas.
   - **Toast:** Aparece un toast en la esquina inferior derecha con temática F1 (fondo grafito oscuro y borde rojo de telemetría), descartable manualmente o por temporizador.
   - **Badge:** La campanita de navegación actualiza en el mismo instante el contador numérico de pendientes.

4. **Gestión de Lectura y Navegación:**
   - El usuario puede filtrar entre *"Todas"* y *"No leídas"*.
   - Al hacer clic sobre cualquier notificación o en el botón *"Marcar leída"*, se actualiza su estado de lectura permanentemente sin regresiones a no leída.
   - Si la notificación contiene una URL de destino (`urlDestino`), el menú se cierra y se realiza una navegación fluida tipo SPA con `router.push()` de Next.js sin recargar la página.
