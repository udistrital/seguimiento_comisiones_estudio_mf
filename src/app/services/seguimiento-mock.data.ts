import { ComisionRow } from '../models/comision.model';

// ============================================================
// Datos mock para desarrollo local del módulo de seguimiento.
// Reemplazar por integración real cuando los endpoints
// del MID/CRUD estén disponibles.
// ============================================================

export const MOCK_COMISIONES: ComisionRow[] = [
  {
    id: 1,
    solicitudId: 101,
    docente: 'María García López',
    idDocente: '1032456789',
    programa: 'Doctorado en Ingeniería de Sistemas',
    fechaSolicitud: '2026-01-15',
    fechaInicio: '2026-03-01',
    fechaFin: '2026-09-01',
    estado: 'DES_ACAD',
    estadoProrroga: 'NO_APLICA',
  },
  {
    id: 2,
    solicitudId: 102,
    docente: 'Carlos Rodríguez Pérez',
    idDocente: '1098765432',
    programa: 'Maestría en Ciencias de la Computación',
    fechaSolicitud: '2025-11-20',
    fechaInicio: '2026-02-01',
    fechaFin: '2026-08-01',
    estado: 'INF_FIN',
    estadoProrroga: 'SOLICITADA',
  },
  {
    id: 3,
    solicitudId: 103,
    docente: 'Ana Martínez Suárez',
    idDocente: '1054321987',
    programa: 'Postdoctorado en Matemáticas Aplicadas',
    fechaSolicitud: '2025-09-10',
    fechaInicio: '2026-01-15',
    fechaFin: '2026-07-15',
    estado: 'PROR',
    estadoProrroga: 'APROBADA',
  },
  {
    id: 4,
    solicitudId: 104,
    docente: 'Jorge Hernández Castro',
    idDocente: '1076543210',
    programa: 'Doctorado en Física Teórica',
    fechaSolicitud: '2025-08-05',
    fechaInicio: '2025-12-01',
    fechaFin: '2026-06-01',
    estado: 'COM_FIN',
    estadoProrroga: 'NO_APLICA',
  },
  {
    id: 5,
    solicitudId: 105,
    docente: 'Laura Díaz Moreno',
    idDocente: '1023456780',
    programa: 'Maestría en Ingeniería Electrónica',
    fechaSolicitud: '2026-02-28',
    fechaInicio: '2026-04-15',
    fechaFin: '2026-10-15',
    estado: 'COM_INI',
    estadoProrroga: 'NO_APLICA',
  },
  {
    id: 6,
    solicitudId: 106,
    docente: 'Ricardo Torres Vega',
    idDocente: '1087654321',
    programa: 'Doctorado en Ciencias Ambientales',
    fechaSolicitud: '2025-07-12',
    fechaInicio: '2025-10-01',
    fechaFin: '2026-04-01',
    estado: 'COM_CANC',
    estadoProrroga: 'NO_APLICA',
  },
];

