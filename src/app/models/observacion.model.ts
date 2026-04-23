/** Observación registrada en el seguimiento de una comisión */
export interface Observacion {
  id: number;
  comisionId: number;
  autor: string;
  rolAutor: string;
  fecha: string;
  texto: string;
  modulo: string;
}
