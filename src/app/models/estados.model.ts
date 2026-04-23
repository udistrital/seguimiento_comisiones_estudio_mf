// ============================================================
// Estados de comision en seguimiento — fase 2
// ============================================================
export type EstadoComision =
  | 'PENDIENTE'          // Pendiente de inicio
  | 'EN_EJECUCION'       // En ejecución
  | 'EN_REVISION'        // En revisión por supervisor
  | 'PRORROGA_SOLICITADA' // Prórroga solicitada
  | 'PRORROGA_APROBADA'  // Prórroga aprobada
  | 'FINALIZADA'         // Comisión finalizada
  | 'CANCELADA'          // Comisión cancelada
  | 'INCUMPLIDA';        // Incumplimiento

// ============================================================
// Estados de documento soporte
// ============================================================
export type EstadoDocumento =
  | 'PENDIENTE'
  | 'CARGADO'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'POR_CORREGIR';

// ============================================================
// Estados de pago
// ============================================================
export type EstadoPago =
  | 'PENDIENTE'
  | 'EN_TRAMITE'
  | 'PAGADO'
  | 'RECHAZADO';

// ============================================================
// Estados de prórroga
// ============================================================
export type EstadoProrroga =
  | 'NO_APLICA'
  | 'SOLICITADA'
  | 'EN_REVISION'
  | 'APROBADA'
  | 'RECHAZADA';
