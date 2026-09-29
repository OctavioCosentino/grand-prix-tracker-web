# Autenticación (Supabase Auth)

El frontend usa [Supabase Auth](https://supabase.com/docs/guides/auth) con email y contraseña. La sesión se guarda en cookies con [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side/creating-a-client), así la pueden leer tanto el navegador como el server de Next (proxy y layouts).

**Estado actual (fase 2):** el frontend autentica y protege las rutas privadas. El backend valida el JWT y toma el cliente del claim `sub`. Falta: notificaciones y Google. Ver [Pendiente](#pendiente).

---

## Cómo funciona

### Sesión y cookies

- Supabase devuelve un **access token** (JWT, dura 1 hora) y un **refresh token**.
- `@supabase/ssr` guarda los dos en cookies `sb-<project-ref>-auth-token` del dominio del frontend. Si el valor es grande, se parte en `.0`, `.1`, etc. **No son `httpOnly`**: el cliente del navegador las tiene que leer. Por eso no hay que guardar nada sensible aparte del token.
- El token se renueva solo:
  - en el navegador lo hace `supabase-js`;
  - en el server lo hace `proxy.ts` en cada request.
- **Las cookies no viajan al backend**, porque está en otro dominio (Render). Al backend se le manda el token explícitamente en `Authorization: Bearer <access_token>`.

### Rutas privadas

Todo lo que está dentro de `app/(private)` requiere sesión. Hoy son `/booking/[id]` y `/profile`. Hay dos barreras:

1. **`proxy.ts`** (en Next 16 reemplaza a `middleware.ts`). Corre en cada request:
   - refresca la sesión;
   - si no hay usuario y la ruta es privada, redirige a `/login?next=<ruta>`;
   - si hay usuario y la ruta es `/login` o `/register`, redirige a `/`.

   Como el route group `(private)` no aparece en la URL, **las rutas privadas están listadas a mano** en `PRIVATE_PREFIXES` de [`lib/supabase/proxy.ts`](../lib/supabase/proxy.ts).
2. **`app/(private)/layout.tsx`** valida el JWT con `supabase.auth.getClaims()` y redirige a `/login` si no hay sesión. Es el control definitivo: una página nueva dentro de `app/(private)` queda protegida aunque nadie actualice la lista del proxy. En ese caso, eso sí, se pierde el `?next=`.

Para agregar una ruta privada:

1. Crearla dentro de `app/(private)/`.
2. Agregar su prefijo a `PRIVATE_PREFIXES`.

### Sesión en Client Components

[`AuthProvider`](../components/providers/AuthProvider.tsx) está en el layout raíz y expone `useAuth()`:

```tsx
const { user, isLoading, signOut } = useAuth();
```

- `isLoading` es `true` hasta que Supabase informa la sesión inicial. Mientras tanto no conviene mostrar "Iniciar sesión", porque parpadea aunque el usuario esté logueado.
- Al cerrar sesión se borran del cache de React Query las reservas y las tarjetas del usuario.
- `useAuth()` sirve para la UI (mostrar el nombre, ocultar botones). **No sirve para proteger rutas**: eso lo hacen el proxy y el layout.

Para el nombre visible está `getDisplayName(user)` en [`utils/auth.ts`](../utils/auth.ts).

### Llamadas a la API

Los endpoints que dependen del cliente (`GET/POST /bookings`, `GET /bookings/{id}`, `GET /payment-methods`) se llaman con `authFetch` de [`services/http.ts`](../services/http.ts). Manda:

```
Authorization: Bearer <access_token>
```

El backend verifica el token (firma ES256 contra el JWKS del proyecto, emisor, audiencia `authenticated` y vencimiento) y toma el cliente del claim `sub`, que es igual a `clientes.id_cliente`. El header `X-Cliente-Id` ya no existe. Los endpoints públicos (`/events/**`, incluidos `/tickets`, `/hotels` y `/flights`) se siguen llamando con `apiFetch`, sin token.

**Qué pasa ante un 401.** El back responde con el envoltorio de siempre, con estos mensajes:
- sin token: `"Se requiere iniciar sesión para acceder a este recurso"`;
- token vencido o inválido: `"La sesión es inválida o expiró"`.

`authFetch` entonces:

1. Llama una vez a `supabase.auth.refreshSession()` y reintenta con el token nuevo. Reintentar un `POST /bookings` es seguro: el back rechaza el token antes de procesar la compra.
2. Si vuelve a dar 401, o no hay sesión, cierra la sesión local (`signOut({ scope: "local" })`) y hace una navegación completa a `/login?next=<URL actual>`. Si fallan varias queries a la vez, redirige una sola vez.
3. Igual lanza `ApiError(401)`, así la query o la mutación queda en error.

**React Query no reintenta los 401.** El default del `QueryClient` ([`QueryProvider`](../components/providers/QueryProvider.tsx)) y `retryUnlessClientError` de [`hooks/useBooking.ts`](../hooks/useBooking.ts) reintentan solo errores de red y 5xx, que son los del cold start de Render. Para chequear un 401 está `isUnauthorized(error)`.

**Las queries protegidas corren solo con sesión.** `useMyBookings` y `usePaymentMethods` se habilitan cuando el `AuthProvider` terminó de cargar y hay usuario. Si no, al cargar la página se dispararían sin token y darían 401.

### Checkout: el paquete no se pierde

Si la sesión vence en medio de una reserva, el usuario vuelve a loguearse y encuentra el paquete como lo dejó, incluido el paso en que estaba.

- [`BookingWizard`](../components/BookingWizard.tsx) espera a que cargue la sesión antes de montar el wizard.
- Mientras el usuario arma el paquete, el estado se guarda en `sessionStorage` ([`utils/bookingDraft.ts`](../utils/bookingDraft.ts)) junto con el id del usuario y del evento.
- Al montar, el wizard arranca desde ese borrador solo si coincide el usuario y el evento.
- El borrador se borra al confirmar la compra y al salir con "Sí, salir" desde `BookingNavbar`.
- `sessionStorage` vive mientras la pestaña esté abierta. De una tarjeta nueva solo se guardan los últimos 4 dígitos, el vencimiento y el token de la pasarela: nunca el número completo ni el CVC.

### Flujos

| Flujo | Dónde | Qué hace |
|---|---|---|
| Login | `app/(auth)/login` | `signInWithPassword`. Después vuelve a `?next=` (validado con `safeNextPath`) o a `/`. |
| Registro | `app/(auth)/register` | `signUp` con `nombre` y `apellido` en `user_metadata`. Si la confirmación de email está desactivada, entra directo. |
| Olvidé mi clave | `components/ForgotPasswordModal.tsx` | `resetPasswordForEmail`. El link del mail pasa por `/auth/callback?next=/forget-password`. |
| Nueva clave | `app/(auth)/forget-password` | `updateUser({ password })` con la sesión que abrió el callback. |
| Callback | `app/auth/callback/route.ts` | Cambia el `code` del link por una sesión (`exchangeCodeForSession`) y redirige a `next`. Si falla, va a `/login?error=link_invalido`. |
| Logout | `/profile` → Cerrar sesión | `signOut()` desde `useAuth()`. |

Los errores de Supabase se muestran en español con `authErrorMessage()` (`utils/auth.ts`).

---

## Archivos

| Archivo | Rol |
|---|---|
| `proxy.ts` | Entrada del proxy de Next. Solo llama a `updateSession`. |
| `lib/supabase/proxy.ts` | Refresco de sesión y redirects de rutas privadas y de invitados. |
| `lib/supabase/client.ts` | Cliente de Supabase para Client Components. |
| `lib/supabase/server.ts` | Cliente para Server Components y Route Handlers (lee `cookies()`). |
| `app/(private)/layout.tsx` | Control de sesión de todo `app/(private)`. |
| `app/(private)/booking/layout.tsx` | Layout del wizard de reserva (BookingNavbar). |
| `app/(private)/profile/layout.tsx` | Navbar y Footer, vía `components/SiteLayout.tsx`. |
| `app/auth/callback/route.ts` | Callback de los links de email (y de OAuth más adelante). |
| `components/providers/AuthProvider.tsx` | `AuthProvider` + `useAuth()`. |
| `utils/auth.ts` | `safeNextPath`, `authErrorMessage`, `getDisplayName`. |
| `services/http.ts` | `authFetch` (Bearer, refresh ante 401 y redirect al login) e `isUnauthorized`. |
| `utils/bookingDraft.ts` | Borrador del checkout en `sessionStorage`. |

---

## Configuración

### Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://zprznayvpeijjoiknird.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

La key es la **publishable** (Project Settings → API Keys). Es pública por diseño: va al navegador. **Nunca** usar acá la `secret` / `service_role`.

`NEXT_PUBLIC_CLIENTE_ID_DEV` ya no se usa.

### Datos de prueba

Con los clientes del seed (`99999999-...`) no se puede iniciar sesión, porque no existen en Supabase Auth. Para probar hay que registrar un usuario desde `/register`. El trigger le crea la fila en `clientes`. Un usuario nuevo no tiene tarjetas (`GET /payment-methods` devuelve `[]`), así que en el checkout hay que cargar una tarjeta nueva. Después de la compra queda guardada.

### Dashboard de Supabase (Authentication)

- **Sign In / Providers → Email:** habilitado, con **Confirm email desactivado**. Si se activa, el registro muestra "Te mandamos un correo" y el link del mail entra por `/auth/callback`.
- **URL Configuration:**
  - Site URL: `http://localhost:3000` (cambiar por el dominio de producción al desplegar).
  - Redirect URLs: `http://localhost:3000/**` más el dominio de producción con `/**`. Sin esto, el link de recuperar clave no vuelve a la app.
- **SMTP:** se usa el de Supabase, que manda pocos mails por hora. Alcanza para desarrollo; para producción conviene configurar uno propio.

### Base de datos: alta automática en `clientes`

Las reservas y los métodos de pago tienen FK a `clientes`. Por eso, cada usuario que se registra en Supabase Auth necesita su fila en `clientes` con el mismo id. Eso lo hace este trigger, **ya aplicado** en el proyecto:

```sql
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.clientes (id_cliente, nombre, apellido, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nombre', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'apellido', ''),
    new.email
  )
  on conflict (id_cliente) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
```

- `nombre` y `apellido` salen del `user_metadata` que manda el formulario de registro.
- Si ya existe un cliente con el mismo email (por ejemplo, del seed), el registro falla con un error de base. Es a propósito: así no queda un usuario de Auth sin cliente.

---

## Pendiente

- **Notificaciones:** siguen recibiendo `?userId=` sin verificar token, tanto en el back como en `NotificationBell`. Pasarlas al token cuando el back lo pida.
- **Google (OAuth):** los botones de login y registro siguen con `TODO`. Hace falta:
  - habilitar el proveedor en Supabase, con un OAuth client de Google Cloud;
  - llamar a `signInWithOAuth({ provider: "google", options: { redirectTo: <origin>/auth/callback?next=... } })`.

  El callback ya está listo. El trigger toma `nombre` del email si no viene en la metadata, así que conviene mapear también `full_name` de Google.
- **Datos del perfil** (`DatosView`): muestra nombre y email del usuario, pero "Actualizar Setup" todavía no guarda nada.
