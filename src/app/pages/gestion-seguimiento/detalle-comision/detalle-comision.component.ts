import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { Role, resolverRolEfectivo } from '../../../models/roles.model';
import { ComisionDetalle } from '../../../models/comision.model';
import { DocumentoSoporte } from '../../../models/documento.model';
import { EstadoDocumento } from '../../../models/estados.model';
import { Observacion } from '../../../models/observacion.model';
import { PagoComision } from '../../../models/pago.model';
import { CumplimientoItem } from '../../../models/cumplimiento.model';
import { ModuloGestion } from '../../../models/modulo-gestion.model';
import { getRolesUsuario } from '../../../utils/auth.util';
import { PopUpManager } from '../../../managers/popup.manager';
import { SeguimientoService } from '../../../services/seguimiento.service';
import { ComisionesCrudService } from '../../../services/comisiones-crud.service';
import { GestorDocumentalService } from '../../../services/gestor-documental.service';
import { VisorDocumentosComponent } from '../../../shared/visor-documentos/visor-documentos.component';
import {
  MOCK_DETALLE,
  MOCK_DOCUMENTOS_DESARROLLO,
  MOCK_PAGOS,
  MOCK_CUMPLIMIENTO,
} from '../../../services/seguimiento-mock.data';

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
  pagos: PagoComision[] = [];
  cumplimiento: CumplimientoItem[] = [];
  observaciones: Observacion[] = [];

  moduloActivo: string | null = null;

  modulos: ModuloGestion[] = [
    { key: 'docs-solicitud',  icon: 'folder_open',  titleKey: 'MODULOS.DOCS_SOLICITUD' },
    { key: 'docs-desarrollo', icon: 'description',  titleKey: 'MODULOS.DOCS_DESARROLLO', badge: 2, badgeClass: 'bg-orange-100 text-orange-700' },
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
  ) {}

  ngOnInit(): void {
    const rolesUsuario = getRolesUsuario();
    this.rolActual = resolverRolEfectivo(rolesUsuario) || 'DOCENTE';

    const paramMode = this.route.snapshot.queryParamMap.get('mode');
    if (paramMode === 'GESTIONAR' || paramMode === 'VER') {
      this.mode = paramMode;
    }

    this.comisionId = Number(this.route.snapshot.paramMap.get('id'));

    this.cargarDetalle();
  }

  get isReadOnly(): boolean { return this.mode === 'VER'; }
  get isDocente(): boolean { return this.rolActual === 'DOCENTE'; }
  get isDecano(): boolean { return this.rolActual === 'DECANO'; }
  get isSecretariaGeneral(): boolean { return this.rolActual === 'SECRETARIA_GENERAL'; }
  get canUploadDocs(): boolean { return !this.isReadOnly && (this.isDocente || this.isDecano); }

  private cargarDetalle(): void {
    this.cargando = true;

    // TODO: reemplazar por endpoint real cuando el MID lo implemente
    setTimeout(() => {
      this.comision = { ...MOCK_DETALLE, id: this.comisionId };
      this.documentosDesarrollo = [...MOCK_DOCUMENTOS_DESARROLLO];
      this.pagos = [...MOCK_PAGOS];
      this.cumplimiento = [...MOCK_CUMPLIMIENTO];
      this.observaciones = [];
      this.cargando = false;
    }, 500);

    this.cargarDocumentosSolicitud();
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
            this.observaciones = obsRaw
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
      case 'CARG':                                       return 'CARGADO';
      case 'APROB_JEFE':
      case 'APROB_DEC':
      case 'APROB_SEC_GRAL': return 'APROBADO';
      case 'REC_JEFE':
      case 'REC_DEC':
      case 'REC_SEC_GRAL':   return 'RECHAZADO';
      case 'POR_COR':        return 'POR_CORREGIR';
      default:               return 'PENDIENTE';
    }
  }

  onModuloClick(key: string): void {
    this.moduloActivo = this.moduloActivo === key ? null : key;
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
    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_OBSERVACION')).then(result => {
      if (result.isConfirmed) {
        const nueva: Observacion = {
          id: Date.now(),
          comisionId: this.comisionId,
          autor: 'Usuario actual',
          rolAutor: this.rolActual || 'DOCENTE',
          fecha: new Date().toISOString().split('T')[0],
          texto,
          modulo: this.moduloActivo || 'general',
        };
        this.observaciones = [nueva, ...this.observaciones];
        this.popup.success(this.translate.instant('POPUPS.OBSERVACION_GUARDADA'));
      }
    });
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
