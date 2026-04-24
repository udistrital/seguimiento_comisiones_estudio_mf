import { EstadoComision, EstadoProrroga } from './estados.model';

/** Fila de la bandeja principal de seguimiento */
export interface ComisionRow {
  id: number;
  solicitudId: number;
  docente: string;
  idDocente: string;
  programa: string;
  fechaSolicitud: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoComision;
  estadoProrroga: EstadoProrroga;
}

/** Detalle completo de una comisión en seguimiento */
export interface ComisionDetalle {
  id: number;
  solicitudId: number;
  docente: string;
  idDocente: string;
  correoDocente: string;
  programa: string;
  facultad: string;
  tipoEstudio: string;
  universidadDestino: string;
  paisDestino: string;
  ciudadDestino: string;
  fechaSolicitud: string;
  fechaInicio: string;
  fechaFin: string;
  duracionMeses: number;
  estado: EstadoComision;
  estadoProrroga: EstadoProrroga;
  decanoNombre: string;
  decanoId: string;
  radicado: string;
}
