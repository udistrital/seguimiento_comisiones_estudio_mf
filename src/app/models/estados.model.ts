// ============================================================
// Estados de comision en seguimiento — fase 2
// Códigos reales de la tabla comision.estado_comision en BD
// ============================================================
export type EstadoComision =
  | 'COM_INI'       // Comisión iniciada
  | 'DES_ACAD'      // En desarrollo académico
  | 'PROR'          // En prórroga
  | 'TIT'           // En titulación
  | 'INF_FIN'       // En informe final
  | 'TRAM_PAZ_SAL'  // En trámite de paz y salvo
  | 'COM_FIN'       // Comisión finalizada
  | 'COM_CANC';     // Comisión cancelada

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
