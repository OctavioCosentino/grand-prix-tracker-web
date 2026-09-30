export const LOGOS_DICT: Record<string, any> = {
  mastercard: require("../public/banks/mastercard.png"),
  visa: require("../public/banks/visa.png"),
  icbc: require("../public/banks/icbc.png"),
  naranja: require("../public/banks/naranja.png"),
  bna: require("../public/banks/banco_nacion.png"),
  "banco nacion": require("../public/banks/banco_nacion.png"),
  santander: require("../public/banks/santander.png"),
  "mercado pago": require("../public/banks/mercado_pago.png"),
  brubank: require("../public/banks/brubank.png"),
  uala: require("../public/banks/uala.png"),
  amex: require("../public/banks/amex.png"),
  ammex: require("../public/banks/amex.png"),
  "american express": require("../public/banks/amex.png"),
  argencard: require("../public/banks/argenCard.png"),
  cabal: require("../public/banks/cabal.png"),
};

const LAST4_TO_BRAND: Record<string, string> = {
  "4242": "visa",
  "8812": "mastercard",
  "1234": "amex",
  "5678": "santander",
  "4321": "mercado pago",
  "1111": "brubank",
  "9999": "icbc",
};

export function getBrandFromLast4(last4: string): string {
  if (LAST4_TO_BRAND[last4]) {
    return LAST4_TO_BRAND[last4];
  }

  // Si no está, elige al azar entre las claves disponibles
  const brands = Object.keys(LOGOS_DICT);
  // Usamos el número en sí para seedear un pseudo-random y que sea estable para esa tarjeta
  const num = parseInt(last4) || 0;
  const randomIndex = (num * 17) % brands.length;

  return brands[randomIndex];
}
