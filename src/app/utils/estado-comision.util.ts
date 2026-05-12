import { EstadoComision, EstadoDocumento, EstadoPago, EstadoProrroga } from '../models/estados.model';

/**
 * Mapea un estado de comisión a su clase CSS para chips.
 */
export function estadoComisionClass(estado: EstadoComision): string {
  switch (estado) {
    case 'COM_INI':      return 'st-pendiente';
    case 'DES_ACAD':     return 'st-ejecucion';
    case 'PROR':         return 'st-prorroga';
    case 'TIT':          return 'st-ejecucion';
    case 'INF_FIN':      return 'st-revision';
    case 'TRAM_PAZ_SAL': return 'st-revision';
    case 'COM_FIN':      return 'st-finalizada';
    case 'COM_CANC':     return 'st-cancelada';
    default:             return 'st-pendiente';
  }
}

/**
 * Mapea un estado de documento a su clase CSS para chips.
 */
export function estadoDocumentoClass(estado: EstadoDocumento): string {
  switch (estado) {
    case 'PENDIENTE':     return 'doc-chip--pendiente';
    case 'CARGADO':       return 'doc-chip--carg';
    case 'APROBADO':      return 'doc-chip--aprob';
    case 'POR_CORREGIR':  return 'doc-chip--corr';
    case 'RECHAZADO':     return 'doc-chip--no-aprob';
    default:              return '';
  }
}

/**
 * Mapea un estado de pago a su clase CSS para chips.
 */
export function estadoPagoClass(estado: EstadoPago): string {
  switch (estado) {
    case 'PENDIENTE':   return 'st-pendiente';
    case 'EN_TRAMITE':  return 'st-revision';
    case 'PAGADO':      return 'st-finalizada';
    case 'RECHAZADO':   return 'st-cancelada';
    default:            return 'st-pendiente';
  }
}

/**
 * Mapea un estado de prórroga a su clase CSS para chips.
 */
export function estadoProrrogaClass(estado: EstadoProrroga): string {
  switch (estado) {
    case 'NO_APLICA':   return 'st-pendiente';
    case 'SOLICITADA':  return 'st-prorroga';
    case 'EN_REVISION': return 'st-revision';
    case 'APROBADA':    return 'st-finalizada';
    case 'RECHAZADA':   return 'st-cancelada';
    default:            return 'st-pendiente';
  }
}
