import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComisionDetalle } from '../../../../models/comision.model';
import { Role } from '../../../../models/roles.model';
import { estadoProrrogaClass } from '../../../../utils/estado-comision.util';
import { PopUpManager } from '../../../../managers/popup.manager';
import { TranslateService } from '@ngx-translate/core';
import { VisorDocumentosComponent } from '../../../../shared/visor-documentos/visor-documentos.component';
import { ComisionesCrudService } from '../../../../services/comisiones-crud.service';
import { SeguimientoService } from '../../../../services/seguimiento.service';
import { ProrrogaDetalleModalComponent } from './prorroga-detalle-modal/prorroga-detalle-modal.component';

@Component({
  selector: 'app-prorroga-cierre',
  templateUrl: './prorroga-cierre.component.html',
  styleUrls: ['./prorroga-cierre.component.scss'],
  standalone: false
})
export class ProrrogaCierreComponent implements OnInit {

  // ======================================================
  // INPUTS / OUTPUTS
  // ======================================================

  @Input() comision!: ComisionDetalle;
  @Input() rolActual: Role | null = null;
  @Input() readOnly = false;

  @Output() retornar = new EventEmitter<void>();
  @Output() rechazar = new EventEmitter<void>();
  @Output() enviar = new EventEmitter<void>();


  // ======================================================
  // CONSTRUCTOR
  // ======================================================

  constructor(
    private popup: PopUpManager,
    private translate: TranslateService,
    private dialog: MatDialog,
    private comisionesCrudService: ComisionesCrudService,
    private seguimientoService: SeguimientoService,
  ) {}


  // ======================================================
  // VARIABLES
  // ======================================================

  justificacion = '';

  itemSubiendoDocumento: any = null;

  documentosProrroga: Record<string, any> = {};

  cargandoDocumentosProrroga = false;


  // ======================================================
  // TABLA DOCUMENTOS
  // ======================================================

  documentosProrrogaTabla: any[] = [];


  // ======================================================
  // BANDERA VISTA
  // ======================================================

  puedeCrearProrroga = false;

  cargandoValidacionProrroga = false;

  mensajeValidacionProrroga = '';

  // TRUE  -> mostrar seguimiento de prórroga en curso
  // FALSE -> mostrar formulario de creación
  tieneProrrogaEnCurso = false;


  // ======================================================
  // MOCK HISTÓRICO
  // ======================================================

  historicoProrrogas: any[] = [];


  // ======================================================
  // MOCK PRÓRROGA EN CURSO
  // ======================================================

  prorrogaActual: any = null;


  // ======================================================
  // INIT
  // ======================================================

  ngOnInit(): void {

    if (!this.readOnly) {
      this.cargarTiposDocumentosProrroga();
      this.validarPuedeCrearProrroga();
    }

    this.cargarHistoricoProrrogas();
  }


  // ======================================================
  // GETTERS
  // ======================================================

  get prorrogaClass(): string {
    return estadoProrrogaClass(this.comision?.estadoProrroga);
  }

  get isSecretariaGeneral(): boolean {
    return this.rolActual === 'SECRETARIA_GENERAL';
  }

  get canSolicitarProrroga(): boolean {
    return !this.readOnly && this.rolActual === 'DOCENTE' && this.comision?.estadoProrroga === 'NO_APLICA';
  }


  // ======================================================
  // CARGAR HISTÓRICO PRÓRROGAS
  // ======================================================

  cargarHistoricoProrrogas(): void {

    if (!this.comision?.id) {
      return;
    }

    this.seguimientoService
      .get(
        `comision/historico_solicitudes_prorroga/${this.comision.id}`
      )
      .subscribe({

        next: (resp: any) => {

          // VALIDAR SUCCESS
          if (!resp?.Success) {

            this.popup.error(
              this.translate.instant('POPUPS.ERROR_HISTORICO_PRORROGA')
            );

            return;
          }

          // VALIDAR STATUS
          if (resp?.Status !== '200' && resp?.Status !== 200) {

            this.popup.error(
              this.translate.instant('POPUPS.ERROR_HISTORICO_PRORROGA_ESTADO')
            );

            return;
          }

          // VALIDAR DATA
          if (!Array.isArray(resp?.Data)) {

            this.popup.error(
              this.translate.instant('POPUPS.ERROR_HISTORICO_PRORROGA_RESPUESTA')
            );

            return;
          }

          const historico = resp.Data.map((item: any) => {

            const fecha = new Date(item.fecha_creacion);

            return {
              solicitud_id: item.solicitud_id,
              historico_id: item.historico_id,
              estado: item.estado,
              fecha_creacion: fecha.toLocaleDateString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }),
            };
          });

          // ============================================
          // PRÓRROGA ACTUAL
          // ============================================

          const solicitudActiva = historico.find(
            (item: any) =>
              item.estado?.trim()?.toLowerCase() !== 'no aprobada'
          );

          if (solicitudActiva) {

            this.tieneProrrogaEnCurso = true;

            this.prorrogaActual = solicitudActiva;
          }
          else {

            this.tieneProrrogaEnCurso = false;

            this.prorrogaActual = null;
          }

          // ============================================
          // HISTÓRICO SOLO NO APROBADAS
          // ============================================

          this.historicoProrrogas = historico.filter(
            (item: any) =>
              item.estado?.trim()?.toLowerCase() === 'no aprobada'
          );
        },

        error: () => {

          this.popup.error(
            this.translate.instant('POPUPS.ERROR_HISTORICO_PRORROGA_CARGA')
          );
        },
      });
  }

  // ======================================================
  // VALIDAR SI PUEDE CREAR PRÓRROGA
  // ======================================================

  validarPuedeCrearProrroga(): void {

    if (!this.comision?.id) {
      return;
    }

    this.cargandoValidacionProrroga = true;

    this.seguimientoService
      .get(
        `comision/validar_solicitud_prorroga/${this.comision.id}`
      )
      .subscribe({

        next: (resp: any) => {

          this.cargandoValidacionProrroga = false;

          // VALIDAR SUCCESS
          if (!resp?.Success) {

            this.popup.error(
              resp?.Message ||
              this.translate.instant('POPUPS.ERROR_VALIDAR_PRORROGA')
            );

            return;
          }

          // VALIDAR STATUS
          if (resp?.Status !== '200' && resp?.Status !== 200) {

            this.popup.error(
              resp?.Message ||
              this.translate.instant('POPUPS.ERROR_VALIDAR_PRORROGA_ESTADO')
            );

            return;
          }

          const data = resp?.Data;

          this.puedeCrearProrroga =
            data?.puede_crear_prorroga === true;

          this.mensajeValidacionProrroga =
            data?.mensaje || '';

          // SI NO PUEDE CREAR
          // ENTONCES HAY PRÓRROGA EN CURSO
          this.tieneProrrogaEnCurso =
            !this.puedeCrearProrroga;
        },

        error: (errorResp: any) => {

          this.cargandoValidacionProrroga = false;

          const mensajeError =
            errorResp?.error?.Error ||
            errorResp?.error?.Message ||
            this.translate.instant('POPUPS.ERROR_VALIDAR_PRORROGA_CARGA');;

          this.popup.error(mensajeError);
        },
      });
  }


  // ======================================================
  // CARGAR TIPOS DOCUMENTOS
  // ======================================================

  cargarTiposDocumentosProrroga(): void {

    this.cargandoDocumentosProrroga = true;

    this.comisionesCrudService
      .get(
        'tipo_documento_solicitud?limit=-1&query=codigo_abreviacion__startswith:SOL_PRO,RolUsuario:DOCENTE'
      )
      .subscribe({

        next: (resp: any) => {

          this.cargandoDocumentosProrroga = false;

          // VALIDAR SUCCESS
          if (!resp?.Success) {

            this.popup.error(
              this.translate.instant('POPUPS.ERROR_DOCUMENTOS_PRORROGA')
            );

            return;
          }

          // VALIDAR STATUS
          if (resp?.Status !== '200') {

            this.popup.error(
              this.translate.instant('POPUPS.ERROR_DOCUMENTOS_PRORROGA_ESTADO')
            );

            return;
          }

          // VALIDAR DATA
          if (!Array.isArray(resp?.Data)) {

            this.popup.error(
              this.translate.instant('POPUPS.ERROR_DOCUMENTOS_PRORROGA_RESPUESTA')
            );

            return;
          }

          // VALIDAR VACÍO
          if (resp.Data.length === 0) {

            this.popup.error(
              this.translate.instant('POPUPS.ERROR_DOCUMENTOS_PRORROGA_VACIO')
            );

            return;
          }

          // MAPEAR TABLA
          this.documentosProrrogaTabla = resp.Data.map((doc: any) => ({
            id: doc.Id,
            nombre: doc.Nombre,
            descripcion: doc.Descripcion,
            codigo: doc.CodigoAbreviacion,
            rolUsuario: doc.RolUsuario,
            activo: doc.Activo,
          }));
        },

        error: () => {

          this.cargandoDocumentosProrroga = false;

          this.popup.error(
            this.translate.instant('POPUPS.ERROR_DOCUMENTOS_PRORROGA')
          );
        },
      });
  }


  // ======================================================
  // VALIDAR DOCUMENTO
  // ======================================================

  tieneDocumentoProrroga(codigo: string): boolean {

    return !!this.documentosProrroga[codigo];
  }


  // ======================================================
  // SUBIR DOCUMENTO
  // ======================================================

  onSubirDocumentoProrroga(event: Event): void {

    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file || !this.itemSubiendoDocumento) {
      return;
    }

    const item = this.itemSubiendoDocumento;

    (event.target as HTMLInputElement).value = '';

    const reader = new FileReader();

    reader.onload = () => {

      const base64 = (reader.result as string).split(',')[1];

      this.documentosProrroga[item.codigo] = {
        id: item.id,
        codigo: item.codigo,
        nombre: file.name,
        descripcion: item.descripcion,
        base64,
        mimeType: file.type,
        fechaCarga: new Date(),
      };

      this.popup.success(
        this.translate.instant('POPUPS.DOC_SUBIDO')
      );

      this.itemSubiendoDocumento = null;
    };

    reader.readAsDataURL(file);
  }


  // ======================================================
  // VER DOCUMENTO
  // ======================================================

  onVerDocumentoProrroga(item: any): void {

    const documento = this.documentosProrroga[item.codigo];

    if (!documento?.base64) {

      this.popup.error(
        this.translate.instant('POPUPS.DOC_NO_DISPONIBLE')
      );

      return;
    }

    this.dialog.open(VisorDocumentosComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        nombre: documento.nombre,
        estado: 'Cargado',
        base64: documento.base64,
        mimeType: documento.mimeType || 'application/pdf',
      },
    });
  }


  // ======================================================
  // ELIMINAR DOCUMENTO
  // ======================================================

  onEliminarDocumentoProrroga(item: any): void {

    const documento = this.documentosProrroga[item.codigo];

    if (!documento) {
      return;
    }

    this.popup.confirm(
      this.translate.instant('POPUPS.CONFIRMAR_ELIMINAR_DOC')
    ).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      delete this.documentosProrroga[item.codigo];

      this.popup.success(
        this.translate.instant('POPUPS.DOC_ELIMINADO')
      );
    });
  }


  // ======================================================
  // VALIDACION DOCUMENTOS COMPLETOS
  // ======================================================

  get documentosProrrogaCompletos(): boolean {

    return (
      this.documentosProrrogaTabla.length > 0 &&
      Object.keys(this.documentosProrroga).length ===
      this.documentosProrrogaTabla.length
    );
  }

  // ======================================================
  // CREAR SOLICITUD PRÓRROGA
  // ======================================================

  crearSolicitudProrroga(): void {

    // ==========================================
    // VALIDAR DOCUMENTOS
    // ==========================================

    if (!this.documentosProrrogaCompletos) {

      this.popup.error(
        this.translate.instant('POPUPS.PRORROGA_DOCS_REQUERIDOS')
      );

      return;
    }

    // ==========================================
    // CONFIRMAR ENVÍO
    // ==========================================

    this.popup.confirm(
      this.translate.instant('POPUPS.CONFIRMAR_CREAR_PRORROGA')
    ).then(result => {

      // SI CANCELA
      if (!result.isConfirmed) {
        return;
      }

      // ==========================================
      // ARMAR DOCUMENTOS
      // ==========================================

      const documentosSolicitudProrroga =
        this.documentosProrrogaTabla.map(doc => {

          const archivo = this.documentosProrroga[doc.codigo];

          return {
            codigo_abreviacion: doc.codigo,
            documento_solicitud: {
              IdTipoDocumento: doc.id,
              nombre: archivo.nombre,
              descripcion: archivo.descripcion,
              metadatos: {},
              file: archivo.base64,
            },
          };
        });

      // ==========================================
      // ARMAR BODY
      // ==========================================

      const body = {
        comision_id: this.comision.id,
        documentos_solicitud_prorroga:
          documentosSolicitudProrroga,
        observacion: this.justificacion,
        cod_abreviacion_rol: this.rolActual,
      };

      console.log('BODY PRÓRROGA', body);

      // ==========================================
      // CONSUMIR SERVICIO
      // ==========================================

      this.seguimientoService
        .post(
          'comision/crear_solicitud_prorroga',
          body,
        )
        .subscribe({

          next: (resp: any) => {

            // VALIDAR SUCCESS
            if (!resp?.Success) {

              const mensajeError =
                resp?.Error ||
                resp?.Message ||
                this.translate.instant('POPUPS.ERROR_CREAR_PRORROGA');

              this.popup.alertError(mensajeError);

              return;
            }

            // VALIDAR STATUS
            if (resp?.Status !== '200' && resp?.Status !== 200) {

              const mensajeError =
                resp?.Error ||
                this.translate.instant('POPUPS.ERROR_CREAR_PRORROGA_ESTADO');

              this.popup.alertError(mensajeError);

              return;
            }

            // ==========================================
            // LIMPIAR CACHE LOCAL
            // ==========================================

            this.documentosProrroga = {};

            this.justificacion = '';

            // ==========================================
            // MENSAJE SUCCESS
            // ==========================================

            this.popup.alertSuccess(
              this.translate.instant('POPUPS.PRORROGA_CREADA_OK')
            );

            // ==========================================
            // RECARGAR PÁGINA
            // ==========================================

            setTimeout(() => {

              window.location.reload();

            }, 1000);
          },

          error: (errorResp: any) => {

            const mensajeError =
              errorResp?.error?.Error ||
              errorResp?.error?.Message ||
              this.translate.instant('POPUPS.ERROR_CREAR_PRORROGA_CARGA');

            this.popup.alertError(mensajeError);
          },
        });
    });
  }

  abrirDetalleSolicitud(solicitudId: number): void {
    this.dialog.open(
      ProrrogaDetalleModalComponent,
      {
        width: '1100px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        autoFocus: false,
        data: {
          solicitudId,
        },
      },
    );
  }

}