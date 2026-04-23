import { EstadoDocumento } from './estados.model';

/** Documento soporte asociado a una comisión */
export interface DocumentoSoporte {
  id: number;
  nombre: string;
  tipo: 'SOLICITUD' | 'DESARROLLO';
  estado: EstadoDocumento;
  autorSoporte: string;
  fechaCarga: string;
  nuxeoId?: string;
  contentUrl?: string;
  fileName?: string;
  mimeType?: string;
}

/** Tipo de documento requerido */
export interface TipoDocumentoSeguimiento {
  id: number;
  nombre: string;
  codigoAbreviacion: string;
  descripcion: string;
  activo: boolean;
}
