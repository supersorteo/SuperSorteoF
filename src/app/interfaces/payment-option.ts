export interface PaymentOption {
  id?: number; // Opcional, para compatibilidad con el backend
  bankCode: string; // Código del banco seleccionado
  alias: string;    // Campo del formulario
  cbu?: string;
  usuarioId?: number;
}
