import { ColumnDef, TableAction } from '../../../shared/dynamic-table/dynamic-table.types';
import { ComisionRow } from '../../../models/comision.model';
import { estadoComisionClass, estadoProrrogaClass } from '../../../utils/estado-comision.util';
import { Role } from '../../../models/roles.model';

// ============================================================
// Columnas por rol
// ============================================================

const COL_ID: ColumnDef<ComisionRow> = {
  key: 'id',
  header: 'TABLE.ID_COMISION',
  cell: (r) => String(r.id),
};

const COL_FECHA_SOLICITUD: ColumnDef<ComisionRow> = {
  key: 'fechaSolicitud',
  header: 'TABLE.FECHA_SOLICITUD',
  cell: (r) => r.fechaSolicitud,
};

const COL_FECHA_INICIO: ColumnDef<ComisionRow> = {
  key: 'fechaInicio',
  header: 'TABLE.FECHA_INICIO',
  cell: (r) => r.fechaInicio,
};

const COL_FECHA_FIN: ColumnDef<ComisionRow> = {
  key: 'fechaFin',
  header: 'TABLE.FECHA_FIN',
  cell: (r) => r.fechaFin,
};

const COL_ESTADO: ColumnDef<ComisionRow> = {
  key: 'estado',
  header: 'TABLE.ESTADO',
  cell: (r) => 'ESTADOS.' + r.estado,
  renderAs: 'chip',
  chipClass: (r) => estadoComisionClass(r.estado),
};

const COL_DOCENTE: ColumnDef<ComisionRow> = {
  key: 'docente',
  header: 'TABLE.DOCENTE',
  cell: (r) => r.docente,
};

const COL_ID_DOCENTE: ColumnDef<ComisionRow> = {
  key: 'idDocente',
  header: 'TABLE.ID_DOCENTE',
  cell: (r) => r.idDocente,
};

const COL_ESTADO_PRORROGA: ColumnDef<ComisionRow> = {
  key: 'estadoProrrogaCierre',
  header: 'TABLE.ESTADO_PRORROGA_CIERRE',
  cell: (r) => 'ESTADOS_PRORROGA.' + r.estadoProrroga,
  renderAs: 'chip',
  chipClass: (r) => estadoProrrogaClass(r.estadoProrroga),
};

// --- Conjuntos de columnas ---

const COLUMNS_DOCENTE: ColumnDef<ComisionRow>[] = [
  COL_ID, COL_FECHA_SOLICITUD, COL_FECHA_INICIO, COL_FECHA_FIN, COL_ESTADO,
];

const COLUMNS_DECANO: ColumnDef<ComisionRow>[] = [
  COL_ID, COL_FECHA_SOLICITUD, COL_ESTADO, COL_DOCENTE, COL_ID_DOCENTE,
];

const COLUMNS_SECRETARIA: ColumnDef<ComisionRow>[] = [
  COL_ID, COL_FECHA_SOLICITUD, COL_DOCENTE, COL_ID_DOCENTE, COL_ESTADO, COL_ESTADO_PRORROGA,
];

export function getColumnsByRole(role: Role): ColumnDef<ComisionRow>[] {
  switch (role) {
    case 'DOCENTE':              return COLUMNS_DOCENTE;
    case 'DECANO':               return COLUMNS_DECANO;
    case 'SECRETARIA_GENERAL':
    case 'SECRETARIA_ACADEMICA': return COLUMNS_SECRETARIA;
    default:                     return COLUMNS_DOCENTE;
  }
}

// ============================================================
// Acciones por rol
// ============================================================

export type BandejaActionKey = 'VER' | 'GESTIONAR';

const ACTION_VER: TableAction<ComisionRow> = {
  key: 'VER',
  label: 'ACTIONS.VER',
  icon: 'visibility',
  tooltip: 'TOOLTIPS.VER_DETALLE',
  color: 'primary',
};

const ACTION_GESTIONAR: TableAction<ComisionRow> = {
  key: 'GESTIONAR',
  label: 'ACTIONS.GESTIONAR',
  icon: 'settings',
  tooltip: 'TOOLTIPS.GESTIONAR',
  color: 'primary',
  visible: (r) => r.estado !== 'FINALIZADA' && r.estado !== 'CANCELADA',
};

export function getActionsByRole(role: Role): TableAction<ComisionRow>[] {
  switch (role) {
    case 'DOCENTE':
      return [
        { ...ACTION_GESTIONAR, visible: (r) => r.estado === 'EN_EJECUCION' || r.estado === 'PENDIENTE' || r.estado === 'PRORROGA_APROBADA' },
        { ...ACTION_VER, visible: (r) => r.estado === 'FINALIZADA' || r.estado === 'CANCELADA' || r.estado === 'EN_REVISION' },
      ];
    case 'DECANO':
      return [ACTION_GESTIONAR, ACTION_VER];
    case 'SECRETARIA_GENERAL':
    case 'SECRETARIA_ACADEMICA':
      return [ACTION_VER, ACTION_GESTIONAR];
    default:
      return [ACTION_VER];
  }
}
