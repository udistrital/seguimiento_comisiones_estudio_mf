import { ComisionRow, ComisionDetalle } from '../models/comision.model';
import { DocumentoSoporte } from '../models/documento.model';
import { Observacion } from '../models/observacion.model';
import { PagoComision } from '../models/pago.model';
import { CumplimientoItem } from '../models/cumplimiento.model';

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
    estado: 'EN_EJECUCION',
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
    estado: 'EN_REVISION',
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
    estado: 'PRORROGA_APROBADA',
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
    estado: 'FINALIZADA',
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
    estado: 'PENDIENTE',
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
    estado: 'CANCELADA',
    estadoProrroga: 'NO_APLICA',
  },
];

export const MOCK_DETALLE: ComisionDetalle = {
  id: 1,
  solicitudId: 101,
  docente: 'María García López',
  idDocente: '1032456789',
  correoDocente: 'mgarcia@udistrital.edu.co',
  programa: 'Doctorado en Ingeniería de Sistemas',
  facultad: 'Facultad de Ingeniería',
  tipoEstudio: 'Doctorado',
  universidadDestino: 'Universidad Politécnica de Madrid',
  paisDestino: 'España',
  ciudadDestino: 'Madrid',
  fechaSolicitud: '2026-01-15',
  fechaInicio: '2026-03-01',
  fechaFin: '2026-09-01',
  duracionMeses: 6,
  estado: 'EN_EJECUCION',
  estadoProrroga: 'NO_APLICA',
  decanoNombre: 'Pedro Ramírez Ortiz',
  decanoId: '1012345678',
  radicado: 'RAD-2026-0101',
};

export const MOCK_DOCUMENTOS_SOLICITUD: DocumentoSoporte[] = [
  {
    id: 1,
    nombre: 'Formulario FR-010',
    tipo: 'SOLICITUD',
    estado: 'APROBADO',
    autorSoporte: 'María García López',
    fechaCarga: '2026-01-15',
  },
  {
    id: 2,
    nombre: 'Carta de aceptación universidad destino',
    tipo: 'SOLICITUD',
    estado: 'APROBADO',
    autorSoporte: 'María García López',
    fechaCarga: '2026-01-16',
  },
  {
    id: 3,
    nombre: 'Resolución de descarga académica',
    tipo: 'SOLICITUD',
    estado: 'APROBADO',
    autorSoporte: 'Secretaría Académica',
    fechaCarga: '2026-02-10',
  },
];

export const MOCK_DOCUMENTOS_DESARROLLO: DocumentoSoporte[] = [
  {
    id: 4,
    nombre: 'Informe de avance semestre 1',
    tipo: 'DESARROLLO',
    estado: 'CARGADO',
    autorSoporte: 'María García López',
    fechaCarga: '2026-06-15',
  },
  {
    id: 5,
    nombre: 'Certificado de asistencia',
    tipo: 'DESARROLLO',
    estado: 'PENDIENTE',
    autorSoporte: '',
    fechaCarga: '',
  },
  {
    id: 6,
    nombre: 'Informe del decano',
    tipo: 'DESARROLLO',
    estado: 'PENDIENTE',
    autorSoporte: '',
    fechaCarga: '',
  },
];

export const MOCK_PAGOS: PagoComision[] = [
  {
    id: 1,
    comisionId: 1,
    concepto: 'Matrícula semestre 1',
    monto: 15000000,
    moneda: 'COP',
    fechaProgramada: '2026-03-01',
    fechaPago: '2026-03-05',
    estado: 'PAGADO',
    observacion: 'Pago realizado por transferencia bancaria',
  },
  {
    id: 2,
    comisionId: 1,
    concepto: 'Tiquetes aéreos',
    monto: 4500000,
    moneda: 'COP',
    fechaProgramada: '2026-02-20',
    fechaPago: '2026-02-22',
    estado: 'PAGADO',
    observacion: '',
  },
  {
    id: 3,
    comisionId: 1,
    concepto: 'Seguro médico internacional',
    monto: 2800000,
    moneda: 'COP',
    fechaProgramada: '2026-03-01',
    fechaPago: null,
    estado: 'EN_TRAMITE',
    observacion: 'En proceso de aprobación',
  },
  {
    id: 4,
    comisionId: 1,
    concepto: 'Matrícula semestre 2',
    monto: 15000000,
    moneda: 'COP',
    fechaProgramada: '2026-07-01',
    fechaPago: null,
    estado: 'PENDIENTE',
    observacion: '',
  },
];

export const MOCK_CUMPLIMIENTO: CumplimientoItem[] = [
  {
    id: 1,
    comisionId: 1,
    descripcion: 'Inscripción en programa de doctorado',
    fechaLimite: '2026-03-15',
    fechaCumplimiento: '2026-03-10',
    cumplido: true,
    evidenciaDocId: null,
    observacion: 'Constancia de matrícula entregada',
  },
  {
    id: 2,
    comisionId: 1,
    descripcion: 'Informe de avance primer trimestre',
    fechaLimite: '2026-06-01',
    fechaCumplimiento: null,
    cumplido: false,
    evidenciaDocId: null,
    observacion: 'Pendiente entrega',
  },
  {
    id: 3,
    comisionId: 1,
    descripcion: 'Certificación de asistencia semestral',
    fechaLimite: '2026-09-01',
    fechaCumplimiento: null,
    cumplido: false,
    evidenciaDocId: null,
    observacion: '',
  },
];

export const MOCK_OBSERVACIONES: Observacion[] = [
  {
    id: 1,
    comisionId: 1,
    autor: 'Pedro Ramírez Ortiz',
    rolAutor: 'DECANO',
    fecha: '2026-04-15',
    texto: 'El docente presenta avance satisfactorio en el programa de doctorado. Se recomienda continuar con el seguimiento trimestral.',
    modulo: 'cumplimiento',
  },
  {
    id: 2,
    comisionId: 1,
    autor: 'María García López',
    rolAutor: 'DOCENTE',
    fecha: '2026-04-10',
    texto: 'Se ha completado exitosamente el primer módulo del programa. Se adjuntará constancia en la próxima entrega.',
    modulo: 'cumplimiento',
  },
  {
    id: 3,
    comisionId: 1,
    autor: 'Secretaría General',
    rolAutor: 'SECRETARIA_GENERAL',
    fecha: '2026-03-20',
    texto: 'Documentación de inicio verificada y completa. Se autoriza el inicio formal de la comisión.',
    modulo: 'documentos',
  },
];
