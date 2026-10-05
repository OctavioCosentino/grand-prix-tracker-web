export const SYSTEM_PANELS = [
  {
    tag: "ETL · PIPELINE",
    title: "Microservicios de Extracción",
    status: "operativo",
    body: "Arquitectura de microservicios independientes que ejecutan procesos de Extracción, Transformación y Carga (ETL) desde proveedores. Normalizan estructuras JSON heterogéneas y las persisten en PostgreSQL para brindar tiempos de respuesta inmediatos.",
  },
  {
    tag: "ADAPTER · SOAP",
    title: "Integración de Ticketería",
    status: "operativo",
    body: "Un microservicio actúa como Adaptador para interactuar con el sistema heredado de ticketería de F1 (JAX-WS / XML). Aísla la lógica central traduciendo los contratos SOAP externos al modelo de dominio interno.",
  },
  {
    tag: "FACADE",
    title: "Orquestación Transaccional",
    status: "operativo",
    body: "El proceso de checkout está orquestado por una Fachada que coordina atómicamente reservas de hotel, vuelos y entradas. Previene bloqueos mutuos (deadlocks) y asegura un rollback completo ante fallas.",
  },
  {
    tag: "OBSERVER · PUB-SUB",
    title: "Arquitectura de Eventos",
    status: "operativo",
    body: "Empleamos un enfoque orientado a eventos. Notificaciones in-app y correos asíncronos se disparan únicamente tras el commit exitoso en base de datos (AFTER_COMMIT), desacoplando las ventas del servicio de mensajería.",
  },
  {
    tag: "HOOKS · REDUCER",
    title: "Modularidad en Frontend",
    status: "operativo",
    body: "Diseño modular basado en atomicidad. El flujo de compra se controla mediante máquinas de estado puras (useReducer), mientras que la interfaz aplica Optimistic UI para reflejar notificaciones sin demoras.",
  },
  {
    tag: "RESILIENCE · UPSERT",
    title: "Fallback y Disponibilidad",
    status: "operativo",
    body: "Garantizamos idempotencia mediante operaciones Upsert en las bases de datos. Ante caídas de APIs externas, el sistema aplica Degradación Elegante (Fallback) proveyendo datos representativos para asegurar continuidad.",
  },
];
