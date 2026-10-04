let lastPaymentSoundTime = 0;

/**
 * Reproduce el efecto de sonido de compra exitosa (/efecto_pago.mp3).
 * Incluye protección contra llamadas consecutivas para sonar exactamente una vez.
 */
export function playPaymentSuccessSound(): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastPaymentSoundTime < 3000) return;
  lastPaymentSoundTime = now;

  try {
    const audio = new Audio("/efecto_pago.mp3");
    audio.volume = 0.75;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        console.debug("Autoplay bloqueado hasta interacción:", err);
      });
    }
  } catch (error) {
    console.debug("Error al reproducir audio de pago:", error);
  }
}
