import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { Role, resolverRolEfectivo } from '../../../models/roles.model';
import { estadoDocumentoClass } from '../../../utils/estado-comision.util';
import { ComisionDetalle } from '../../../models/comision.model';
import { DocumentoSoporte } from '../../../models/documento.model';
import { EstadoDocumento } from '../../../models/estados.model';
import { Observacion } from '../../../models/observacion.model';
import { CumplimientoItem } from '../../../models/cumplimiento.model';
import { ModuloGestion } from '../../../models/modulo-gestion.model';
import { getRolesUsuario, getDocumento, getNombreUsuario } from '../../../utils/auth.util';
import { PopUpManager } from '../../../managers/popup.manager';
import { SeguimientoService } from '../../../services/seguimiento.service';
import { ComisionesCrudService } from '../../../services/comisiones-crud.service';
import { GestorDocumentalService } from '../../../services/gestor-documental.service';
import { DocumentoCrudService } from '../../../services/documento-crud.service';
import { VisorDocumentosComponent } from '../../../shared/visor-documentos/visor-documentos.component';

@Component({
    selector: 'app-detalle-comision',
    templateUrl: './detalle-comision.component.html',
    styleUrls: ['./detalle-comision.component.scss'],
    standalone: false
})
export class DetalleComisionComponent implements OnInit {
  comisionId!: number;
  rolActual: Role | null = null;
  mode: 'VER' | 'GESTIONAR' = 'VER';

  cargando = true;
  comision!: ComisionDetalle;
  documentosSolicitud: DocumentoSoporte[] = [];
  documentosDesarrollo: DocumentoSoporte[] = [];
  cumplimiento: CumplimientoItem[] = [];
  observacionesSolicitud: Observacion[] = [];
  observacionesPorPanel: Record<string, Observacion[]> = {};
  cargandoComentarios: Record<string, boolean> = {};

  gruposDocumentos: any[] = [];
  cargandoDocDesarrollo = false;
  private idTipoDocumentoDesarrollo: number | null = null;
  colsDocDesarrollo = ['nombre', 'estado', 'gestion'];
  itemSubiendoDocumento: any = null;

  moduloActivo: string | null = null;

  private readonly PANEL_A_TIPO: Record<string, string> = {
    'docs-desarrollo': 'COM_DESARROLLO',
    'pagos':           'COM_PAGOS',
    'cumplimiento':    'COM_CUMPLIMIENTO',
  };

  modulos: ModuloGestion[] = [
    { key: 'docs-solicitud',  icon: 'folder_open',  titleKey: 'MODULOS.DOCS_SOLICITUD' },
    { key: 'docs-desarrollo', icon: 'description',  titleKey: 'MODULOS.DOCS_DESARROLLO' },
    { key: 'pagos',           icon: 'payments',     titleKey: 'MODULOS.GESTION_PAGOS' },
    { key: 'cumplimiento',    icon: 'task_alt',     titleKey: 'MODULOS.CUMPLIMIENTO' },
    { key: 'prorroga-cierre', icon: 'event_repeat', titleKey: 'MODULOS.PRORROGA_CIERRE' },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly translate: TranslateService,
    private readonly popup: PopUpManager,
    private readonly seguimientoService: SeguimientoService,
    private readonly comisionesCrud: ComisionesCrudService,
    private readonly gestorDocumental: GestorDocumentalService,
    private readonly documentoCrud: DocumentoCrudService,
  ) {}

  ngOnInit(): void {
    const rolesUsuario = getRolesUsuario();
    this.rolActual = resolverRolEfectivo(rolesUsuario) || 'DOCENTE';

    const paramMode = this.route.snapshot.queryParamMap.get('mode');
    if (paramMode === 'GESTIONAR' || paramMode === 'VER') {
      this.mode = paramMode;
    }

    this.comisionId = Number(this.route.snapshot.paramMap.get('id'));

    this.resolverIdTipoDocumento();
    this.cargarDetalle();
  }

  private resolverIdTipoDocumento(): void {
    this.documentoCrud.get('tipo_documento?query=CodigoAbreviacion:DE_COM').subscribe({
      next: (resp: any) => {
        const lista = Array.isArray(resp) ? resp : resp?.Data;
        this.idTipoDocumentoDesarrollo = lista?.[0]?.Id ?? null;
      },
      error: () => { this.idTipoDocumentoDesarrollo = null; },
    });
  }

  get isReadOnly(): boolean { return this.mode === 'VER'; }
  get isDocente(): boolean { return this.rolActual === 'DOCENTE'; }
  get isDecano(): boolean { return this.rolActual === 'DECANO'; }
  get isSecretariaGeneral(): boolean { return this.rolActual === 'SECRETARIA_GENERAL'; }
  get canUploadDocs(): boolean { return !this.isReadOnly && this.isDocente; }

  private cargarDetalle(): void {
    this.cargando = true;

    this.seguimientoService.get(`seguimiento/detalle_comision/${this.comisionId}`).subscribe({
      next: (resp: any) => {
        const data = resp?.Data;
        if (!data) {
          this.cargando = false;
          return;
        }
        this.comision = {
          id: this.comisionId,
          solicitudId: data.solicitud_id ?? 0,
          radicado: `COM-${this.comisionId}`,
          docente: data.docente ?? '',
          idDocente: data.id_docente ?? '',
          correoDocente: data.correo_docente ?? '',
          programa: data.programa ?? '',
          facultad: data.facultad ?? '',
          tipoEstudio: data.tipo_estudio ?? '',
          universidadDestino: data.universidad_destino ?? '',
          paisDestino: data.pais_destino ?? '',
          ciudadDestino: data.ciudad_destino ?? '',
          fechaSolicitud: data.fecha_solicitud ?? '',
          fechaInicio: this.formatearFecha(data.fecha_inicio),
          fechaFin: this.formatearFecha(data.fecha_fin),
          duracionMeses: parseInt(data.duracion ?? '0', 10) || 0,
          estado: this.mapEstadoComision(data.estado_comision),
          estadoProrroga: 'NO_APLICA',
          decanoNombre: '',
          decanoId: '',
        };
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.popup.error(this.translate.instant('POPUPS.ERROR_CARGA'));
      },
    });

    this.cargarDocumentosSolicitud();
  }

  private formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    const dateStr = fecha.substring(0, 10);
    const parts = dateStr.split('-');
    if (parts.length !== 3) return fecha;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  private mapEstadoComision(codigo: string | undefined): import('../../../models/estados.model').EstadoComision {
    const validos = ['COM_INI','DES_ACAD','PROR','TIT','INF_FIN','TRAM_PAZ_SAL','COM_FIN','COM_CANC'] as const;
    const c = (codigo ?? '').toUpperCase();
    return (validos as readonly string[]).includes(c)
      ? c as import('../../../models/estados.model').EstadoComision
      : 'COM_INI';
  }

  private cargarDocumentosSolicitud(): void {
    this.comisionesCrud.get(`solicitud?query=ComisionId.Id:${this.comisionId},Activo:true&limit=1`).subscribe({
      next: (resp: any) => {
        const items: any[] = Array.isArray(resp?.Data) ? resp.Data : [];
        if (!items.length) return;

        const solicitudId = items[0]?.Id;
        if (!solicitudId) return;

        this.seguimientoService.get(`solicitud/detalles_solicitud/${solicitudId}`).subscribe({
          next: (detResp: any) => {
            const docs: any[] = Array.isArray(detResp?.Data?.Documentos) ? detResp.Data.Documentos : [];
            const docsMapeados = docs.map((doc: any, i: number) => ({
              id: doc.Id ?? i,
              nombre: doc.Tipo?.Nombre || doc.Nombre || 'Documento',
              tipo: 'SOLICITUD' as const,
              estado: this.mapEstadoDocumento(doc.Estado?.CodigoAbreviacion),
              autorSoporte: this.formatRol(doc.Rol),
              fechaCarga: '',
              enlace: doc.Enlace || undefined,
              cargandoArchivo: false,
            }));

            const formularioRaw = detResp?.Data?.Formulario;
            if (formularioRaw) {
              try {
                const formData = typeof formularioRaw === 'string'
                  ? JSON.parse(formularioRaw)
                  : formularioRaw;
                const fr010Entry: any = {
                  id: -1,
                  nombre: 'FR-010 Formulario de solicitud inicial',
                  tipo: 'SOLICITUD' as const,
                  estado: 'CARGADO' as const,
                  autorSoporte: 'Docente',
                  fechaCarga: '',
                  isFR010: true,
                  formData,
                  cargandoArchivo: false,
                };
                this.documentosSolicitud = [fr010Entry, ...docsMapeados];
              } catch {
                this.documentosSolicitud = docsMapeados;
              }
            } else {
              this.documentosSolicitud = docsMapeados;
            }

            const obsRaw: any[] = Array.isArray(detResp?.Data?.Observaciones) ? detResp.Data.Observaciones : [];
            this.observacionesSolicitud = obsRaw
              .filter((obs: any) => !!String(obs?.Descripcion || '').trim())
              .map((obs: any, i: number) => ({
                id: obs.Id ?? i,
                comisionId: this.comisionId,
                autor: this.formatRol(obs.Rol),
                rolAutor: (obs.Rol || 'DOCENTE') as any,
                fecha: '',
                texto: String(obs.Descripcion || '').trim(),
                modulo: 'solicitud',
              }));
          },
          error: () => {},
        });
      },
      error: () => {},
    });
  }

  private mapEstadoDocumento(codigo: string | undefined): EstadoDocumento {
    switch ((codigo ?? '').toUpperCase()) {
      case 'CARG':           return 'CARGADO';
      case 'APROB':
      case 'APROB_JEFE':
      case 'APROB_DEC':
      case 'APROB_SEC_GRAL': return 'APROBADO';
      case 'REC':
      case 'REC_JEFE':
      case 'REC_DEC':
      case 'REC_SEC_GRAL':   return 'RECHAZADO';
      case 'POR_COR':        return 'POR_CORREGIR';
      default:               return 'PENDIENTE';
    }
  }

  onModuloClick(key: string): void {
    const anterior = this.moduloActivo;
    this.moduloActivo = this.moduloActivo === key ? null : key;
    if (this.moduloActivo && this.moduloActivo !== anterior) {
      if (this.PANEL_A_TIPO[this.moduloActivo]) {
        this.cargarComentariosPanel(this.moduloActivo);
      }
      if (this.moduloActivo === 'docs-desarrollo') {
        this.cargarDocumentosDesarrollo();
      }
    }
  }

  private cargarComentariosPanel(key: string): void {
    const codigo = this.PANEL_A_TIPO[key];
    if (!codigo) return;

    this.cargandoComentarios = { ...this.cargandoComentarios, [key]: true };

    this.seguimientoService.get(`seguimiento/comentarios/${this.comisionId}/${codigo}`).subscribe({
      next: (resp: any) => {
        const items: any[] = Array.isArray(resp?.Data) ? resp.Data : [];
        this.observacionesPorPanel = {
          ...this.observacionesPorPanel,
          [key]: items.map((item: any) => ({
            id: item.id,
            comisionId: this.comisionId,
            autor: this.formatRol(item.rol),
            rolAutor: item.rol || 'DOCENTE',
            fecha: this.formatFechaHora(item.fecha_creacion),
            texto: item.texto,
            modulo: key,
          })),
        };
        this.cargandoComentarios = { ...this.cargandoComentarios, [key]: false };
      },
      error: () => {
        this.cargandoComentarios = { ...this.cargandoComentarios, [key]: false };
      },
    });
  }

  private formatFechaHora(iso: string): string {
    if (!iso) return '';
    try {
      // El MID retorna el formato Go: "2026-05-15 12:45:46.202365 +0000 +0000"
      // El valor de hora es Colombia (wall clock), sin conversión de zona.
      // Normalizamos a "YYYY-MM-DDTHH:mm:ss" sin TZ para que new Date()
      // lo trate como hora local y getHours() devuelva exactamente ese valor.
      const clean = iso.trim()
        .replace(' ', 'T')       // primer espacio → T
        .replace(/\.\d+.*$/, '') // quitar microsegundos y todo lo que sigue (+0000 +0000)
        .replace(/Z$/, '')       // quitar Z si viniera en otro formato
        .replace(/[+-]\d{2}:?\d{2}$/, ''); // quitar ±HH:MM o ±HHMM si quedara
      const d = new Date(clean);
      if (isNaN(d.getTime())) return iso;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch {
      return iso;
    }
  }

  onVerDocumento(doc: DocumentoSoporte): void {
    if (doc.cargandoArchivo) return;

    if (doc.isFR010) {
      this.abrirVisor(doc);
      return;
    }

    if (doc.base64) {
      this.abrirVisor(doc);
      return;
    }

    if (!doc.enlace) {
      this.popup.error(this.translate.instant('POPUPS.DOC_NO_DISPONIBLE'));
      return;
    }

    doc.cargandoArchivo = true;
    this.gestorDocumental.get(`document/${encodeURIComponent(doc.enlace)}`).subscribe({
      next: (resp: any) => {
        const base64 = resp?.Data?.file || resp?.file || null;
        doc.cargandoArchivo = false;
        if (!base64) {
          this.popup.error(this.translate.instant('POPUPS.DOC_NO_DISPONIBLE'));
          return;
        }
        doc.base64 = base64;
        doc.mimeType = 'application/pdf';
        this.abrirVisor(doc);
      },
      error: () => {
        doc.cargandoArchivo = false;
        this.popup.error(this.translate.instant('POPUPS.ERROR_CARGAR_DOCUMENTO'));
      },
    });
  }

  private abrirVisor(doc: DocumentoSoporte): void {
    this.dialog.open(VisorDocumentosComponent, {
      width: doc.isFR010 ? '750px' : '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        nombre: doc.nombre,
        estado: doc.estado,
        autor: doc.autorSoporte,
        ...(doc.isFR010
          ? { isFR010: true, formData: doc.formData }
          : { base64: doc.base64, mimeType: doc.mimeType || 'application/pdf' }
        ),
      },
    });
  }

  onCargarDocumento(doc: DocumentoSoporte): void {
    this.popup.alertSuccess(this.translate.instant('POPUPS.CARGAR_DOCUMENTO_PLACEHOLDER'));
  }

  onNuevaObservacion(texto: string): void {
    const key = this.moduloActivo || '';
    const codigo = this.PANEL_A_TIPO[key];
    if (!codigo) return;

    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_OBSERVACION')).then(result => {
      if (!result.isConfirmed) return;

      const body = {
        comision_id: this.comisionId,
        codigo_tipo_seguimiento: codigo,
        rol: this.rolActual || 'DOCENTE',
        nombre: getNombreUsuario() || '',
        numero_identificacion: getDocumento() || '',
        texto,
      };

      this.seguimientoService.post('seguimiento/comentario', body).subscribe({
        next: () => {
          this.cargarComentariosPanel(key);
          this.popup.success(this.translate.instant('POPUPS.OBSERVACION_GUARDADA'));
        },
        error: () => {
          this.popup.error(this.translate.instant('POPUPS.ERROR_OBSERVACION'));
        },
      });
    });
  }

  private cargarDocumentosDesarrollo(): void {
    this.cargandoDocDesarrollo = true;
    this.seguimientoService.get(`seguimiento/documentos_desarrollo/${this.comisionId}`).subscribe({
      next: (resp: any) => {
        this.gruposDocumentos = Array.isArray(resp?.Data) ? resp.Data : [];
        this.cargandoDocDesarrollo = false;
      },
      error: () => { this.cargandoDocDesarrollo = false; },
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.itemSubiendoDocumento) return;

    const item = this.itemSubiendoDocumento;
    this.itemSubiendoDocumento = null;
    (event.target as HTMLInputElement).value = '';

    if (!this.idTipoDocumentoDesarrollo) {
      this.popup.error(this.translate.instant('POPUPS.ERROR_TIPO_DOC_NO_RESUELTO'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const body = {
        comision_id: this.comisionId,
        tipo_documento_codigo: item.codigo,
        id_tipo_documento: this.idTipoDocumentoDesarrollo,
        nombre: file.name,
        descripcion: item.nombre,
        file: base64,
      };
      this.seguimientoService.post('seguimiento/documento_desarrollo', body).subscribe({
        next: () => {
          this.cargarDocumentosDesarrollo();
          this.popup.success(this.translate.instant('POPUPS.DOC_SUBIDO'));
        },
        error: () => this.popup.error(this.translate.instant('POPUPS.ERROR_SUBIR_DOC')),
      });
    };
    reader.readAsDataURL(file);
  }

  onVerDocDesarrollo(item: any): void {
    if (!item.enlace) {
      this.popup.error(this.translate.instant('POPUPS.DOC_NO_DISPONIBLE'));
      return;
    }
    this.gestorDocumental.get(`document/${encodeURIComponent(item.enlace)}`).subscribe({
      next: (resp: any) => {
        const base64 = resp?.Data?.file || resp?.file || null;
        if (!base64) {
          this.popup.error(this.translate.instant('POPUPS.DOC_NO_DISPONIBLE'));
          return;
        }
        this.dialog.open(VisorDocumentosComponent, {
          width: '900px', maxWidth: '95vw', maxHeight: '90vh',
          data: { nombre: item.nombre, estado: this.mapEstadoDesarrollo(item.estado), base64, mimeType: 'application/pdf' },
        });
      },
      error: () => this.popup.error(this.translate.instant('POPUPS.ERROR_CARGAR_DOCUMENTO')),
    });
  }

  onEliminarDocDesarrollo(item: any): void {
    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_ELIMINAR_DOC')).then(result => {
      if (!result.isConfirmed) return;
      this.seguimientoService.put(`seguimiento/documento_desarrollo/${item.documento_comision_id}/desactivar`, {}).subscribe({
        next: () => {
          this.cargarDocumentosDesarrollo();
          this.popup.success(this.translate.instant('POPUPS.DOC_ELIMINADO'));
        },
        error: () => this.popup.error(this.translate.instant('POPUPS.ERROR_ELIMINAR_DOC')),
      });
    });
  }

  mapEstadoDesarrollo(codigo: string): EstadoDocumento {
    const mapa: Record<string, EstadoDocumento> = {
      'CARG': 'CARGADO', 'APROB': 'APROBADO', 'APROB_PROY': 'APROBADO',
      'APROB_SEC_ACAD': 'APROBADO', 'APROB_SEC_GRAL': 'APROBADO', 'APROB_DEC': 'APROBADO',
      'NO_APROB': 'RECHAZADO', 'CORR': 'POR_CORREGIR', 'SUBS': 'CARGADO', 'ANUL': 'RECHAZADO',
    };
    return mapa[codigo] ?? 'PENDIENTE';
  }

  getClaseEstadoDesarrollo(codigo: string): string {
    return estadoDocumentoClass(this.mapEstadoDesarrollo(codigo));
  }

  volver(): void {
    this.router.navigate(['/seguimiento']);
  }

  onRetornar(): void {
    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_RETORNAR')).then(r => {
      if (r.isConfirmed) this.popup.success(this.translate.instant('POPUPS.SOLICITUD_RETORNADA'));
    });
  }

  onRechazar(): void {
    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_RECHAZAR')).then(r => {
      if (r.isConfirmed) this.popup.success(this.translate.instant('POPUPS.SOLICITUD_RECHAZADA'));
    });
  }

  onEnviar(): void {
    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_ENVIAR')).then(r => {
      if (r.isConfirmed) this.popup.alertSuccess(this.translate.instant('POPUPS.SOLICITUD_ENVIADA'));
    });
  }

  private formatRol(rol: string | undefined): string {
    if (!rol) return 'Docente';
    const mapa: Record<string, string> = {
      'DOCENTE': 'Docente',
      'PROFE': 'Docente',
      'PROFESOR': 'Docente',
      'DECANO': 'Decano',
      'JEFE_UNIDAD': 'Jefe de unidad',
      'SECRETARIA_GENERAL': 'Secretaría General',
    };
    return mapa[rol.toUpperCase()] ??
      rol.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
}
