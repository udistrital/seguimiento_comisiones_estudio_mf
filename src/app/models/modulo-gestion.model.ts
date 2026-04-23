/** Definición de un módulo de gestión en la vista de detalle */
export interface ModuloGestion {
  key: string;
  icon: string;
  titleKey: string;
  descriptionKey?: string;
  badge?: number;
  badgeClass?: string;
  route?: string;
}
