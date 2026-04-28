import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/request.manager';

/**
 * Servicio de seguimiento de comisiones.
 * Prepara los clients HTTP para los endpoints reales de la fase 2.
 * Actualmente los endpoints no existen — los métodos están listos
 * para conectarse cuando el MID/CRUD los implemente.
 */
@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private readonly apiMid: ReturnType<RequestManager['client']>;
  private readonly apiCrud: ReturnType<RequestManager['client']>;
  private readonly apiDocCrud: ReturnType<RequestManager['client']>;
  private readonly apiGestorDocMid: ReturnType<RequestManager['client']>;

  constructor(private readonly request: RequestManager) {
    this.apiMid = this.request.client('COMISIONES_MID_SERVICE');
    this.apiCrud = this.request.client('COMISIONES_CRUD_SERVICE');
    this.apiDocCrud = this.request.client('DOCUMENTO_CRUD_SERVICE');
    this.apiGestorDocMid = this.request.client('GESTOR_DOCUMENTAL_MID_SERVICE');
  }

  // ========== Bandeja por rol ==========

  listarComisionesDocente(cedula: string) {
    return this.apiMid.get<any>(`v1/seguimiento/comisiones_docente/${cedula}`);
  }

  listarComisionesDecano(cedula: string) {
    return this.apiMid.get<any>(`v1/seguimiento/comisiones_decano/${cedula}`);
  }

  listarComisionesSecretariaGeneral() {
    return this.apiMid.get<any>('v1/seguimiento/comisiones_secretaria_general');
  }

  // ========== Detalle ==========

  obtenerDetalleComision(id: number) {
    return this.apiMid.get<any>(`v1/seguimiento/detalle_comision/${id}`);
  }

  // ========== Documentos ==========

  listarDocumentosComision(comisionId: number) {
    return this.apiCrud.get<any>(`v1/documento_comision?query=ComisionId:${comisionId},Activo:true&limit=-1`);
  }

  // ========== Pagos ==========

  listarPagosComision(comisionId: number) {
    return this.apiCrud.get<any>(`v1/pago_comision?query=ComisionId:${comisionId},Activo:true&limit=-1`);
  }

  // ========== Cumplimiento ==========

  listarCumplimientoComision(comisionId: number) {
    return this.apiCrud.get<any>(`v1/cumplimiento_comision?query=ComisionId:${comisionId},Activo:true&limit=-1`);
  }

  // ========== Observaciones ==========

  listarObservaciones(comisionId: number) {
    return this.apiCrud.get<any>(`v1/observacion_comision?query=ComisionId:${comisionId},Activo:true&limit=-1&sortby=FechaCreacion&order=desc`);
  }

  crearObservacion(payload: any) {
    return this.apiCrud.post<any>('v1/observacion_comision', payload);
  }

  // ========== Prórroga ==========

  solicitarProrroga(payload: any) {
    return this.apiMid.post<any>('v1/seguimiento/solicitar_prorroga', payload);
  }

  aprobarProrroga(comisionId: number, payload: any) {
    return this.apiMid.put<any>(`v1/seguimiento/aprobar_prorroga/${comisionId}`, payload);
  }

  // ========== Cierre ==========

  solicitarCierre(comisionId: number, payload: any) {
    return this.apiMid.post<any>(`v1/seguimiento/solicitar_cierre/${comisionId}`, payload);
  }

  // ========== Gestor documental ==========

  obtenerDocumentoPorEnlace(enlace: string) {
    return this.apiGestorDocMid.get<any>(`v1/document/${encodeURIComponent(enlace)}`);
  }

  obtenerTipoDocumentoPorCodigo(codigoAbreviacion: string) {
    return this.apiDocCrud.get<any>(
      `v2/tipo_documento?query=CodigoAbreviacion%3A${codigoAbreviacion}`
    );
  }
}
