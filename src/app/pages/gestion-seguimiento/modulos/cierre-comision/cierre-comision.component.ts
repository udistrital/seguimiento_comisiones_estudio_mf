import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { ComisionDetalle } from '../../../../models/comision.model';
import { Role } from '../../../../models/roles.model';
import { PopUpManager } from '../../../../managers/popup.manager';
import { SeguimientoService } from '../../../../services/seguimiento.service';
import { MatDialog } from '@angular/material/dialog';
import { CierreDetalleModalComponent } from './cierre-detalle-modal/cierre-detalle-modal.component';

@Component({
  selector: 'app-cierre-comision',
  templateUrl: './cierre-comision.component.html',
  styleUrls: ['./cierre-comision.component.scss'],
  standalone: false,
})
export class CierreComisionComponent implements OnInit {

  // ======================================================
  // INPUTS / OUTPUTS
  // ======================================================

  @Input() comision!: ComisionDetalle;

  @Input() readOnly = false;

  @Input() rolActual: Role | null = null;

  @Output() retornar = new EventEmitter<void>();

  @Output() rechazar = new EventEmitter<void>();

  @Output() enviar = new EventEmitter<void>();


  // ======================================================
  // CONSTRUCTOR
  // ======================================================

  constructor(
    private readonly popup: PopUpManager,
    private readonly seguimientoService: SeguimientoService,
    private readonly dialog: MatDialog,
  ) {}


  // ======================================================
  // VARIABLES
  // ======================================================

  cargandoValidacionCierre = false;

  puedeCrearSolicitudCierre = false;

  mensajeValidacionCierre = '';


  // ======================================================
  // HISTÓRICO CIERRES
  // ======================================================

  historicoCierres: any[] = [];


  // ======================================================
  // SOLICITUD ACTIVA
  // ======================================================

  solicitudCierre: any = null;

  tieneSolicitudCierreActiva = false;


  // ======================================================
  // INIT
  // ======================================================

  ngOnInit(): void {

    this.validarSolicitudCierre();

    this.cargarHistoricoCierres();

  }


  // ======================================================
  // GETTERS
  // ======================================================

  get canSolicitarCierre(): boolean {

    return (
      !this.readOnly &&
      this.rolActual === 'DOCENTE'
    );
  }


  // ======================================================
  // CARGAR HISTÓRICO CIERRES
  // ======================================================

  cargarHistoricoCierres(): void {

    if (!this.comision?.id) {
      return;
    }

    this.seguimientoService
      .get(
        `comision/historico_solicitudes_cierre/${this.comision.id}`
      )
      .subscribe({

        next: (resp: any) => {

          if (!resp?.Success) {

            this.popup.error(
              'No fue posible consultar el histórico de solicitudes de cierre.'
            );

            return;
          }

          if (
            resp?.Status !== '200' &&
            resp?.Status !== 200
          ) {

            this.popup.error(
              'El histórico de cierres respondió con un estado inválido.'
            );

            return;
          }

          if (!Array.isArray(resp?.Data)) {

            this.popup.error(
              'La respuesta del histórico de cierres es inválida.'
            );

            return;
          }

          const historico = resp.Data.map((item: any) => {

            const fecha = new Date(item.fecha_creacion);

            return {
              solicitud_id: item.solicitud_id,
              historico_id: item.historico_id,
              estado: item.estado,
              fecha_creacion: fecha.toLocaleDateString(
                'es-CO',
                {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                },
              ),
            };
          });

          // ==========================================
          // SOLICITUD ACTIVA
          // ==========================================

          const solicitudActiva = historico.find(
            (item: any) =>
              item.estado?.trim()?.toLowerCase() !==
              'no aprobada'
          );

          if (solicitudActiva) {

            this.tieneSolicitudCierreActiva = true;

            this.solicitudCierre = solicitudActiva;

            this.puedeCrearSolicitudCierre = false;
          }
          else {

            this.tieneSolicitudCierreActiva = false;

            this.solicitudCierre = null;
          }

          // ==========================================
          // HISTÓRICO SOLO RECHAZADAS
          // ==========================================

          this.historicoCierres = historico.filter(
            (item: any) =>
              item.estado?.trim()?.toLowerCase() ===
              'no aprobada'
          );
        },

        error: () => {

          this.popup.error(
            'Ocurrió un error consultando el histórico de solicitudes de cierre.'
          );
        },
      });
  }


  // ======================================================
  // VALIDAR SOLICITUD CIERRE
  // ======================================================

  validarSolicitudCierre(): void {

    if (!this.comision?.id) {
      return;
    }

    this.cargandoValidacionCierre = true;

    this.seguimientoService
      .get(
        `comision/validar_solicitud_cierre/${this.comision.id}`
      )
      .subscribe({

        next: (resp: any) => {

          this.cargandoValidacionCierre = false;

          if (!resp?.Success) {

            this.popup.error(
              resp?.Message ||
              'No fue posible validar la solicitud de cierre.'
            );

            return;
          }

          if (
            resp?.Status !== '200' &&
            resp?.Status !== 200
          ) {

            this.popup.error(
              resp?.Message ||
              'La validación respondió con un estado inválido.'
            );

            return;
          }

          const data = resp?.Data;

          this.puedeCrearSolicitudCierre =
            data?.puede_crear_cierre === true;

          this.mensajeValidacionCierre =
            data?.mensaje || '';
        },

        error: (errorResp: any) => {

          this.cargandoValidacionCierre = false;

          const mensajeError =
            errorResp?.error?.Error ||
            errorResp?.error?.Message ||
            'Ocurrió un error validando la solicitud de cierre.';

          this.popup.error(mensajeError);
        },
      });
  }


  // ======================================================
  // CREAR SOLICITUD CIERRE
  // ======================================================

  crearSolicitudCierre(): void {

    this.popup.confirm(
      '¿Está seguro de crear la solicitud de cierre de la comisión de estudios? Una vez enviada, será remitida para revisión y supervisión por parte del Decano.'
    ).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      const body = {
        comision_id: this.comision.id,
        observacion:
          'Se solicita cierre debido a finalización de la comisión de estudios.',
        cod_abreviacion_rol: this.rolActual,
      };

      this.seguimientoService
        .post(
          'comision/crear_solicitud_cierre',
          body,
        )
        .subscribe({

          next: (resp: any) => {

            if (!resp?.Success) {

              const mensajeError =
                resp?.Error ||
                resp?.Message ||
                'No fue posible crear la solicitud de cierre.';

              this.popup.alertError(mensajeError);

              return;
            }

            if (
              resp?.Status !== '200' &&
              resp?.Status !== 200
            ) {

              const mensajeError =
                resp?.Error ||
                'La solicitud de cierre respondió con un estado inválido.';

              this.popup.alertError(mensajeError);

              return;
            }

            this.popup.alertSuccess(
              'La solicitud de cierre fue creada correctamente.'
            );

            setTimeout(() => {

              window.location.reload();

            }, 1000);
          },

          error: (errorResp: any) => {

            const mensajeError =
              errorResp?.error?.Error ||
              errorResp?.error?.Message ||
              'Ocurrió un error creando la solicitud de cierre.';

            this.popup.alertError(mensajeError);
          },
        });
    });
  }


  // ======================================================
  // DETALLE
  // ======================================================

  verDetalleSolicitud(solicitudId: number): void {
    console.log('SOLICITUD SELECCIONADA', solicitudId);
    this.dialog.open(
      CierreDetalleModalComponent,
      {
        width: '1100px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        autoFocus: false,
        data: {
          solicitudId: solicitudId,
        },
      },
    );
  }

}