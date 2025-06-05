import { Raffle } from "./raffle";

export interface RifaGanadorDTO {
  rifa: Raffle;
  ganador: {
    id: number;
    name: string;
    lastName: string;
    phone: string;
    dni: string | null;
    code: string;
    reservedNumber: number;
    raffleId: number;
  } | null;
  participantes: {
    id: number;
    name: string;
    lastName: string;
    phone: string;
    reservedNumber: number | null;
  }[];
}
