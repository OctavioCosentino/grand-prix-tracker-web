export interface Race {
  id: string;
  name: string;
  circuit: string;
  img: string;
  badge: string;
  blurb: string;
  date: string;
  region: string;
  raced?: boolean;
  longitud_km?: number | string;
  curvas?: number | string;
  vueltas?: number | string;
  capacidad?: string;
  record?: string;
  velocidad_maxima?: string;
  maximo_ganador?: string;
}
