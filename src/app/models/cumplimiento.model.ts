/** Registro de cumplimiento de una comisión */
export interface CumplimientoItem {
  id: number;
  comisionId: number;
  descripcion: string;
  fechaLimite: string;
  fechaCumplimiento: string | null;
  cumplido: boolean;
  evidenciaDocId: number | null;
  observacion: string;
}
