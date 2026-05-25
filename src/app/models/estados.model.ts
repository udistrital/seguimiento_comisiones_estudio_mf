// ============================================================
// Estados de comision en seguimiento — fase 2
// Códigos reales de la tabla comision.estado_comision en BD
// ============================================================
export type EstadoComision =
  | 'COM_INI'        // Comisión iniciada
  | 'CUMP_PARCIAL'   // Cumplimiento parcial
  | 'PROR'           // En prórroga
  | 'INCUMP_PARCIAL' // Incumplimiento parcial
  | 'CUMP_TOTAL'     // Cumplimiento total
  | 'INCUMP_CIERRE'  // Incumplimiento de cierre de comisión
  | 'COM_FIN'        // Comisión finalizada
  | 'COM_CANC';      // Comisión cancelada

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
