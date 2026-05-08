import { EstadoDocumento } from './estados.model';

/** Documento soporte asociado a una comisión */
export interface DocumentoSoporte {
  id: number;
  nombre: string;
  tipo: 'SOLICITUD' | 'DESARROLLO';
  estado: EstadoDocumento;
  autorSoporte: string;
  fechaCarga: string;
  enlace?: string;
  base64?: string;
  mimeType?: string;
  cargandoArchivo?: boolean;
  isFR010?: boolean;
  formData?: any;
}

/** Tipo de documento requerido */
export interface TipoDocumentoSeguimiento {
  id: number;
  nombre: string;
  codigoAbreviacion: string;
  descripcion: string;
  activo: boolean;
}
