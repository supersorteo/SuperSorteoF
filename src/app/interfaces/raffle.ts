import { CodigoVip } from "./codigo-vip";
import { Producto } from "./producto";
import { User } from "./user";

export interface Raffle {
  id?: number;
  nombre: string;
  cantidadParticipantes: any;
  fechaSorteo: any;  // 🔥 Enviar fecha en `YYYY-MM-DD`
  usuario: { id: number; esVip: boolean; codigoVip?: string };
  producto: Producto;
  active: boolean;
  executed: boolean;
  code: string;
  precio: number;
  winningNumber?: number;
}

