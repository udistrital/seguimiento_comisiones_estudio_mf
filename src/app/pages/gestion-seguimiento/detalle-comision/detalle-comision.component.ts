import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Role, resolverRolEfectivo } from '../../../models/roles.model';
import { ComisionDetalle } from '../../../models/comision.model';
import { DocumentoSoporte } from '../../../models/documento.model';
import { Observacion } from '../../../models/observacion.model';
import { PagoComision } from '../../../models/pago.model';
import { CumplimientoItem } from '../../../models/cumplimiento.model';
import { ModuloGestion } from '../../../models/modulo-gestion.model';
import { getRolesUsuario } from '../../../utils/auth.util';
import { PopUpManager } from '../../../managers/popup.manager';
import {
  MOCK_DETALLE,
  MOCK_DOCUMENTOS_SOLICITUD,
  MOCK_DOCUMENTOS_DESARROLLO,
  MOCK_PAGOS,
  MOCK_CUMPLIMIENTO,
  MOCK_OBSERVACIONES,
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
    {
      key: 'docs-solicitud',
      icon: 'folder_open',
      titleKey: 'MODULOS.DOCS_SOLICITUD',
    },
    {
      key: 'docs-desarrollo',
      icon: 'description',
      titleKey: 'MODULOS.DOCS_DESARROLLO',
      badge: 2,
      badgeClass: 'bg-orange-100 text-orange-700',
    },
    {
      key: 'pagos',
      icon: 'payments',
      titleKey: 'MODULOS.GESTION_PAGOS',
    },
    {
      key: 'cumplimiento',
      icon: 'task_alt',
      titleKey: 'MODULOS.CUMPLIMIENTO',
    },
    {
      key: 'prorroga-cierre',
      icon: 'event_repeat',
      titleKey: 'MODULOS.PRORROGA_CIERRE',
    },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly popup: PopUpManager,
  ) {}

  ngOnInit(): void {
    const rolesUsuario = getRolesUsuario();
    this.rolActual = resolverRolEfectivo(rolesUsuario) || 'DOCENTE';

    const paramRole = this.route.snapshot.queryParamMap.get('role') as Role | null;
    if (paramRole) this.rolActual = paramRole;

    const paramMode = this.route.snapshot.queryParamMap.get('mode');
    if (paramMode === 'GESTIONAR' || paramMode === 'VER') {
      this.mode = paramMode;
    }

    this.comisionId = Number(this.route.snapshot.paramMap.get('id'));

    this.cargarDetalle();
  }

  get isReadOnly(): boolean {
    return this.mode === 'VER';
  }

  get isDocente(): boolean {
    return this.rolActual === 'DOCENTE';
  }

  get isSupervisor(): boolean {
    return this.rolActual === 'SUPERVISOR';
  }

  get isSecretariaGeneral(): boolean {
    return this.rolActual === 'SECRETARIA_GENERAL';
  }

  get canUploadDocs(): boolean {
    return !this.isReadOnly && (this.isDocente || this.isSupervisor);
  }

  private cargarDetalle(): void {
    this.cargando = true;

    // TODO: Reemplazar por SeguimientoService.obtenerDetalleComision(id)
    setTimeout(() => {
      this.comision = { ...MOCK_DETALLE, id: this.comisionId };
      this.documentosSolicitud = [...MOCK_DOCUMENTOS_SOLICITUD];
      this.documentosDesarrollo = [...MOCK_DOCUMENTOS_DESARROLLO];
      this.pagos = [...MOCK_PAGOS];
      this.cumplimiento = [...MOCK_CUMPLIMIENTO];
      this.observaciones = [...MOCK_OBSERVACIONES];
      this.cargando = false;
    }, 500);
  }

  onModuloClick(key: string): void {
    this.moduloActivo = this.moduloActivo === key ? null : key;
  }

  onNuevaObservacion(texto: string): void {
    this.popup.confirm(
      this.translate.instant('POPUPS.CONFIRMAR_OBSERVACION'),
    ).then(result => {
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

  onVerDocumento(doc: DocumentoSoporte): void {
    this.popup.alertSuccess(
      `${this.translate.instant('POPUPS.VER_DOCUMENTO')}: ${doc.nombre}`,
      this.translate.instant('DETALLE.VISOR_DOCUMENTO'),
    );
  }

  onCargarDocumento(doc: DocumentoSoporte): void {
    this.popup.alertSuccess(
      this.translate.instant('POPUPS.CARGAR_DOCUMENTO_PLACEHOLDER'),
    );
  }

  volver(): void {
    this.router.navigate(['/seguimiento']);
  }

  // --- Acciones de Secretaría General en prórroga/cierre ---

  onRetornar(): void {
    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_RETORNAR')).then(r => {
      if (r.isConfirmed) {
        this.popup.success(this.translate.instant('POPUPS.SOLICITUD_RETORNADA'));
      }
    });
  }

  onRechazar(): void {
    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_RECHAZAR')).then(r => {
      if (r.isConfirmed) {
        this.popup.success(this.translate.instant('POPUPS.SOLICITUD_RECHAZADA'));
      }
    });
  }

  onEnviar(): void {
    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_ENVIAR')).then(r => {
      if (r.isConfirmed) {
        this.popup.alertSuccess(this.translate.instant('POPUPS.SOLICITUD_ENVIADA'));
      }
    });
  }
}
