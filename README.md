# Grand Prix Tracker — Frontend Web

Plataforma web integral para la orquestación, personalización y reserva de experiencias de fin de semana de Gran Premio de Fórmula 1 (vuelos, traslados, hotelería y entradas oficiales). 

Este documento consolida la guía de puesta en marcha, la arquitectura del sistema, el marco teórico de ingeniería de software y los patrones de diseño aplicados en la construcción del frontend.

---

## Tabla de Contenidos

1. [Puesta en Marcha (Getting Started)](#1-puesta-en-marcha-getting-started)
2. [Estructura del Proyecto y Organización](#2-estructura-del-proyecto-y-organización)
3. [Marco Teórico y Paradigma Arquitectónico](#3-marco-teórico-y-paradigma-arquitectónico)
4. [Patrones de Diseño de Software Implementados](#4-patrones-de-diseño-de-software-implementados)
5. [Estrategia de Estado y Ciclo de Vida de Datos](#5-estrategia-de-estado-y-ciclo-de-vida-de-datos)
6. [Arquitectura del Sistema de Notificaciones](#6-arquitectura-del-sistema-de-notificaciones)
7. [Seguridad y Flujo de Autenticación](#7-seguridad-y-flujo-de-autenticación)
8. [Sistema de Diseño e Identidad Visual F1](#8-sistema-de-diseño-e-identidad-visual-f1)

---

## 1. Puesta en Marcha (Getting Started)

### Requisitos Previos

- **Node.js**: versión 20.x o superior (LTS recomendada).
- **Gestor de Paquetes**: `pnpm` (versión estandarizada `11.15.1`).
  > **Nota:** El proyecto estandariza el uso exclusivo de `pnpm` para garantizar la resolución determinística de dependencias mediante enlaces simbólicos y aislamiento de `node_modules`.

### Instalación

Clonar el repositorio e instalar las dependencias:

```bash
git clone <url-del-repositorio>
cd grand-prix-tracker-web
pnpm install
```

### Variables de Entorno

Crear el archivo `.env.local` en la raíz del proyecto basándose en las variables requeridas:

```env
# API REST Backend (FastAPI / Render)
NEXT_PUBLIC_API_URL=https://grand-prix-tracker-api.onrender.com

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### Scripts de Desarrollo y Calidad

| Comando | Acción |
| :--- | :--- |
| `pnpm dev` | Inicia el servidor de desarrollo con Next.js Turbopack en `http://localhost:3000`. |
| `pnpm build` | Compila y optimiza la aplicación para producción (Server-Side Rendering y Static Generation). |
| `pnpm start` | Inicia el servidor en modo producción una vez generado el build. |
| `pnpm lint` | Ejecuta ESLint 9 para análisis estático y adherencia a guías de estilo. |
| `pnpm tsc --noEmit` | Valida el tipado estricto de TypeScript en todo el proyecto. |

---

## 2. Estructura del Proyecto y Organización

El proyecto adopta las convenciones del **App Router de Next.js 16** con separación por grupos de rutas (*Route Groups*):

```
grand-prix-tracker-web/
├── app/
│   ├── (auth)/             # Rutas públicas de autenticación (login, register, forget-password)
│   ├── (private)/          # Rutas protegidas (booking/[id], profile)
│   ├── (public)/           # Rutas abiertas (landing page, calendar, races/[id], about-us)
│   ├── auth/callback/      # Endpoint OAuth / confirmación de Supabase
│   ├── layout.tsx          # Root Layout (Fuentes Geist, QueryClientProvider, AuthProvider)
│   └── globals.css         # Tailwind CSS v4, animaciones y tokens F1
├── components/             # Catálogo de componentes modulares (Atomic Design)
│   ├── providers/          # Context Providers (AuthProvider, QueryProvider)
│   └── ...                 # Átomos, Moléculas y Organismos de UI
├── hooks/                  # Custom Hooks (Fachadas para lógica de negocio y consultas)
├── lib/
│   └── supabase/           # Clientes Supabase para Browser, Server y Proxy
├── services/               # Clientes de acceso a datos (HTTP fetch tipados)
├── utils/                  # Funciones puras, DTO Mappers, constantes y tipos
└── public/                 # Assets estáticos (imágenes de circuitos, audio, logo)
```

---

## 3. Marco Teórico y Paradigma Arquitectónico

La arquitectura del frontend responde a principios fundamentales de la ingeniería de software moderna:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN (UI)                         │
│   Next.js 16 App Router · React 19 (Server/Client Components) · Tailwind│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Invocación declarativa
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA DE ESTADO Y CONSULTAS (HOOKS)                   │
│         TanStack Query v5 · React Context · Máquinas de Estado         │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
      Mapeo DTO     ▼                                ▼ Persistencia Local
┌───────────────────────────────┐        ┌───────────────────────────────┐
│   CAPA DE SERVICIOS (HTTP)    │        │      STORAGE & EVENT BUS      │
│  `apiFetch` / `authFetch`     │        │  LocalStorage · Custom Events │
└───────────────┬───────────────┘        └───────────────────────────────┘
                │ Authorization: Bearer <JWT>
                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND EXTERNO & SUPABASE AUTH                      │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Separación de Responsabilidades en Capas (Layered Architecture)

1. **Capa de Presentación (UI Layer):** Compuesta por componentes React encargados exclusivamente de representar el estado en pantalla y capturar eventos de usuario. No ejecutan transformaciones complejas de datos ni llamadas HTTP directas.
2. **Capa de Estado y Abstracción (State & Query Layer):** Gestionada a través de *Custom Hooks* que orquestan el ciclo de vida de los datos, la caché en memoria y la revalidación reactiva.
3. **Capa de Servicios y Acceso a Datos (Data Access Layer):** Módulos tipados en `services/` que encapsulan los contratos REST (`GET`, `POST`, `PATCH`, `DELETE`), el manejo de errores HTTP y la inyección transparente de credenciales.
4. **Capa de Dominio y Utilidades (Domain & Utilities Layer):** Funciones puras en `utils/` para normalización, mapeo DTO, ordenamiento y transformaciones matemáticas/temporales.

### 3.2. Desarrollo Basado en Componentes (Component-Driven Development & Atomic Design)

La interfaz se estructura jerárquicamente siguiendo los principios de alta cohesión y bajo acoplamiento:

- **Átomos (Primitivas de UI):** Elementos visuales reutilizables e indivisibles con responsabilidad estilística estricta.
  - `components/ButtonChecker.tsx` y `ButtonOutline.tsx`: Botones interactivos con patrón checkered-flag y estados hover.
  - `components/QuantityStepper.tsx`: Control numérico con validación de umbrales máximos/mínimos.
  - `components/TireWheel.tsx`: Representación vectorial de un neumático de competición con llanta y color de compuesto dinámico.
  - `components/PasswordStrengthMeter.tsx`: Medidor visual de entropía de contraseña en tiempo real.
- **Moléculas (Componentes Especializados):** Agrupaciones funcionales con estado local acotado.
  - `components/NotificationBell.tsx`: Campanita con contador de insignias (*badge*), menú desplegable, filtros y lectura.
  - `components/TireShelfPicker.tsx`: Estantería interactiva de compuestos para selección de color de perfil con efecto de elevación.
  - `components/LoadingBox.tsx`: Esqueletos de carga adaptativos para mitigar cambios acumulativos de diseño (*CLS*).
- **Organismos (Asistentes y Secciones Complejas):** Estructuras modulares que coordinan flujos de negocio completos.
  - `components/BookingWizard.tsx`: Asistente de reserva multietapa que delega cada fase a subcomponentes dedicados (`BookingHotelStep`, `BookingTicketsStep`, `BookingFlightsStep`, `BookingPaymentStep`, `BookingReviewStep`, `BookingConfirmation`).
  - `components/FeedbackSection.tsx`: Canal de retroalimentación asíncrono con validación en línea.

---

## 4. Patrones de Diseño de Software Implementados

| Patrón | Módulos / Archivos | Fundamento Teórico e Implementación en el Código |
| :--- | :--- | :--- |
| **Observer / Pub-Sub (Publicador-Suscriptor)** | • `hooks/useNotifications.ts`<br>• `components/NotificationBell.tsx`<br>• `components/providers/AuthProvider.tsx` | Desacopla la producción del consumo de eventos. Al confirmarse un checkout o simularse una oferta, se despacha el evento desacoplado `gpt_notification_added`. Los componentes suscritos (campana, toast y audio) reaccionan de inmediato sin acoplamiento directo. A nivel autenticación, Supabase emite cambios de sesión mediante el observador reactivo `onAuthStateChange`. |
| **Facade (Fachada)** | • `hooks/useNotifications.ts`<br>• `hooks/useBooking.ts`<br>• `hooks/useEvents.ts`<br>• `hooks/useProfile.ts` | Oculta la complejidad de múltiples subsistemas (llamadas `fetch`, caché `TanStack Query`, persistencia en `localStorage`, control de reintentos) tras una interfaz declarativa y limpia accesible por la UI mediante una única llamada de hook. |
| **State Machine / Reducer** | • `components/BookingWizard.tsx`<br>• `utils/booking.ts` | El flujo de compra multietapa está modelado como una máquina de estados determinística mediante `useReducer` y funciones de transición puras (`bookingReducer`). Impide transiciones ilegales entre pasos y garantiza la inmutabilidad del estado de reserva. |
| **Provider (Inyección de Dependencias / Context)** | • `components/providers/AuthProvider.tsx`<br>• `app/layout.tsx` (`QueryProvider`) | Distribuye servicios transversales (sesión de usuario y cliente de caché `QueryClient`) a través del árbol de componentes de React, eliminando el antipatrón de *prop drilling*. |
| **Optimistic UI (Actualización Optimista)** | • `hooks/useNotifications.ts`<br>• `hooks/useProfile.ts` | Mejora la latencia percibida actualizando de inmediato el estado local y los contadores en memoria en 0 ms antes de aguardar la respuesta del servidor remoto, revirtiendo el estado solo en caso de falla. |
| **Adapter / DTO Mapper** | • `utils/booking.ts`<br>• `services/bookings.ts` | Funciones especializadas (`buildCheckoutRequest`, `buildSummaryLines`) transforman las estructuras internas del estado de la vista al contrato estricto de transferencia de datos (*Data Transfer Object*) exigido por el backend REST (`POST /bookings`). |
| **Proxy / Interceptor** | • `lib/supabase/proxy.ts`<br>• `services/http.ts` | Intercepta todas las peticiones entrantes para refrescar sesiones y redirigir según permisos; del mismo modo, `authFetch` intercepta peticiones salientes para inyectar el encabezado `Authorization: Bearer <token>`. |

---

## 5. Estrategia de Estado y Ciclo de Vida de Datos

El frontend clasifica el estado en tres categorías formales:

1. **Client State (Estado Efímero de Interfaz):**
   - Controlado mediante `useState` y `useReducer` para elementos locales como pestañas activas, apertura de modales, pasos de un formulario o selecciones temporales.
2. **Server State (Estado Asíncrono de Servidor):**
   - Administrado por **TanStack Query (React Query v5)**.
   - Aplica el paradigma *Stale-While-Revalidate*: devuelve datos instantáneos de la memoria caché mientras refresca en segundo plano.
   - Implementa deduplicación de consultas idénticas, reintentos exponenciales y mutaciones con invalidación dirigida (`queryClient.invalidateQueries`).
3. **Persistent State (Estado Persistente de Sesión y Almacenamiento):**
   - Tokens de autenticación persistidos en cookies leídas por SSR y cliente mediante `@supabase/ssr`.
   - Preferencias y notificaciones persistidas en `localStorage` sincronizadas con caché en memoria.

---

## 6. Arquitectura del Sistema de Notificaciones

El subsistema de notificaciones combina un bus de eventos en tiempo real, almacenamiento local sincronizado y retroalimentación auditiva y visual:

```
                  ┌──────────────────────────────────────────────┐
                  │             EVENTO DISPARADOR                │
                  │  • Compra confirmada (BookingWizard)         │
                  │  • Oferta simulada / Novedad de carrera      │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │           services/notifications.ts          │
                  │  • Asigna ID único (UUID) y timestamp ISO    │
                  │  • Persiste de inmediato en localStorage     │
                  │  • Emite evento 'gpt_notification_added'     │
                  └──────┬───────────────────────────────┬───────┘
                         │                               │
                         ▼                               ▼
       ┌───────────────────────────────────┐   ┌───────────────────────────────────┐
       │     hooks/useNotifications.ts     │   │    components/NotificationBell    │
       │  • Escucha en tiempo real         │   │  • Reproduce audio f1-radio.mp3   │
       │  • Actualiza caché TanStack Query │   │  • Despliega Toast emergente      │
       │  • Recalcula badge en 0 ms        │   │  • Incrementa badge numérico      │
       └───────────────────────────────────┘   └───────────────────────────────────┘
```

### Ciclo de Vida del Evento

1. **Disparo:** Una acción del usuario (finalización de reserva) o un evento de sistema invoca `addNotification`.
2. **Persistencia y Despacho:** Se serializa en `localStorage` bajo la clave del usuario autenticado y se propaga mediante un `CustomEvent`.
3. **Actualización Reactiva:** `useNotifications` intercepta el evento e inyecta la nueva notificación directamente en la caché activa de TanStack Query (`queryClient.setQueryData`).
4. **Feedback Multisensorial:**
   - **Sonoro:** Se ejecuta el efecto de radio F1 (`/f1-radio.mp3`) con limitación de frecuencia (*throttling*) para evitar saturación de audio.
   - **Visual (Toast):** Aparece un aviso flotante con estética de telemetría en el margen inferior de la pantalla.
   - **Indicador (Badge):** La campanita de navegación actualiza en el mismo instante el contador numérico de no leídas.
5. **Navegación e Interacción:** El usuario puede marcar como leída individualmente o navegar a la ruta asociada mediante transiciones fluidas de SPA (`router.push`).

---

## 7. Seguridad y Flujo de Autenticación

El sistema implementa una arquitectura de seguridad por capas basada en tokens JWT:

```
Petición entrante del Navegador
  │
  ▼
[ Next.js Proxy (lib/supabase/proxy.ts) ]
  ├── 1. Refresca sesión y renueva cookies si expiraron
  ├── 2. ¿Ruta privada en PRIVATE_PREFIXES sin sesión? ──► Redirige a /login?next=<ruta>
  └── 3. ¿Usuario autenticado accediendo a /login? ─────► Redirige a /
  │
  ▼
[ Server Layout (app/(private)/layout.tsx) ]
  └── 4. Verificación criptográfica con supabase.auth.getClaims()
  │
  ▼
[ Renderizado de Página Privada ]
```

### Puntos Clave de la Arquitectura de Seguridad

- **Cookies no HttpOnly para SSR:** `@supabase/ssr` gestiona cookies de sesión legibles tanto por el servidor Next.js como por el navegador para permitir el renderizado condicional.
- **Aislamiento de Dominio:** Dado que la API backend corre en un dominio independiente (Render), las cookies del frontend no viajan al backend.
- **Autorización por Bearer Token:** Todas las consultas a recursos privados (`GET/POST /bookings`, `GET/PATCH /users/profile`, `GET /payment-methods`) utilizan `authFetch`, que extrae el `access_token` vigente y lo adjunta en el encabezado `Authorization: Bearer <token>`.
- **Identidad Verificada por Claim `sub`:** El backend valida la firma criptográfica (ES256) contra el JWKS de Supabase y obtiene el ID del usuario del claim `sub`, garantizando que ningún cliente pueda suplantar la identidad de otro.

---

## 8. Sistema de Diseño e Identidad Visual F1

La experiencia visual está construida sobre una paleta cromática inspirada en la telemetría, el asfalto y la estética técnica del motorsport de alta competición:

```
┌──────────────────┬───────────┬──────────────────────────────────────────┐
│ Token de Diseño  │ Hex Code  │ Rol Semántico en la Aplicación           │
├──────────────────┼───────────┼──────────────────────────────────────────┤
│ Carbon           │ #0B0B10   │ Fondo base principal                     │
│ Carbon 2         │ #131318   │ Superficies de paneles y cards           │
│ Asphalt          │ #1C1D24   │ Bordes estructurales y separadores       │
│ Graphite         │ #33343D   │ Divisores secundarios y bordes sutiles   │
│ Off-White        │ #F3F1EA   │ Tipografía principal de alto contraste   │
│ Fog              │ #93949F   │ Tipografía secundaria y metadata         │
│ Race Red         │ #E10600   │ Acento primario, llamadas a la acción    │
│ Sector Purple    │ #7C4DFF   │ Acento secundario (datos técnicos / HUD) │
│ Flag Gold        │ #E7B33C   │ Indicadores de alerta o badges premium   │
└──────────────────┴───────────┴──────────────────────────────────────────┘
```

### Microinteracciones y Rendimiento de Animación

- **Aceleración por GPU:** Las animaciones visuales (como las líneas de velocidad `gpt-streak`, las marquesinas `gpt-marquee` y los halos de los neumáticos) operan sobre propiedades de transformación y opacidad (`transform`, `opacity`), evitando recalcular el diseño (*reflow*) y garantizando una tasa de refresco constante de 60/120 FPS.
- **Tipografías Optimizadas:** Integración de fuentes Google Fonts mediante `next/font` con estrategia `display: swap` y variables CSS (`--font-display`, `--font-body`, `--font-mono`), eliminando el parpadeo de texto sin estilo (*FOUT*).
