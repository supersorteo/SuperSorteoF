import { CodigoVip } from "./codigo-vip";

export interface User {
  id?: number; // Identificador único (opcional, ya que no se envía al registrar)
  name: string; // Nombre del usuario (obligatorio)
  email: string; // Correo electrónico (obligatorio)
  password: string; // Contraseña (obligatorio)
  confirmarPassword: string; // Confirmación de contraseña (obligatorio)
  codigoRecuperacion?: string; // Código de recuperación (opcional)
  esVip?: boolean; // Indica si el usuario es VIP (opcional)
  //codigoVip?: string;
  codigoVip?: CodigoVip // Código VIP del usuario (opcional)
  fechaRegistro?: Date; // Fecha de registro (opcional)
  telefono?: string;
}
