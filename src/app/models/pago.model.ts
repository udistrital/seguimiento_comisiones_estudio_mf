import { EstadoPago } from './estados.model';

/** Registro de pago asociado a una comisión */
export interface PagoComision {
  id: number;
  comisionId: number;
  concepto: string;
  monto: number;
  moneda: string;
  fechaProgramada: string;
  fechaPago: string | null;
  estado: EstadoPago;
  observacion: string;
}
