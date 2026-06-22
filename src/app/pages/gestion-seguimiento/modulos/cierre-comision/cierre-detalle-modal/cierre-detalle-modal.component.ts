import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import { SeguimientoService } from '../../../../../services/seguimiento.service';
import { PopUpManager } from '../../../../../managers/popup.manager';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-cierre-detalle-modal',
  templateUrl: './cierre-detalle-modal.component.html',
  styleUrls: ['./cierre-detalle-modal.component.scss'],
  standalone: false,
})
export class CierreDetalleModalComponent implements OnInit {

  // ======================================================
  // VARIABLES
  // ======================================================

  cargando = true;

  detalleSolicitud: any = null;


  // ======================================================
  // CONSTRUCTOR
  // ======================================================

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      solicitudId: number;
    },

    private dialogRef:
      MatDialogRef<CierreDetalleModalComponent>,

    private seguimientoService: SeguimientoService,

    private popup: PopUpManager,
    private translate: TranslateService,
  ) {}


  // ======================================================
  // INIT
  // ======================================================

  ngOnInit(): void {

    console.log(
      'DATA MODAL CIERRE',
      this.data,
    );

    this.cargarDetalleSolicitud();
  }


  // ======================================================
  // CARGAR DETALLE
  // ======================================================

  cargarDetalleSolicitud(): void {

    if (!this.data?.solicitudId) {

      this.popup.error(
        this.translate.instant(
          'CIERRE_DETALLE.ERROR_SIN_SOLICITUD'
        )
      );

      this.dialogRef.close();

      return;
    }

    this.cargando = true;

    console.log(
      'CONSULTANDO DETALLE',
      this.data.solicitudId,
    );

    this.seguimientoService
      .get(
        `solicitud/detalles_solicitud/${this.data.solicitudId}`
      )
      .subscribe({

        next: (resp: any) => {

          console.log(
            'RESPUESTA DETALLE CIERRE',
            resp,
          );

          this.cargando = false;

          // ==========================================
          // VALIDAR SUCCESS
          // ==========================================

          if (!resp?.Success) {

            resp?.Message ||
            this.translate.instant(
              'CIERRE_DETALLE.ERROR_CARGAR_DETALLE'
            )

            this.dialogRef.close();

            return;
          }

          // ==========================================
          // VALIDAR STATUS
          // ==========================================

          if (
            resp?.Status !== '200' &&
            resp?.Status !== 200
          ) {
            this.popup.error(
            resp?.Message ||
            this.translate.instant(
              'CIERRE_DETALLE.ERROR_ESTADO_INVALIDO'
            ));

            this.dialogRef.close();

            return;
          }

          // ==========================================
          // VALIDAR DATA
          // ==========================================

          if (!resp?.Data) {

            this.popup.error(
              this.translate.instant(
                'CIERRE_DETALLE.ERROR_SIN_INFORMACION'
              )
            );
            this.dialogRef.close();

            return;
          }

          this.detalleSolicitud =
            resp.Data;

          console.log(
            'DETALLE ASIGNADO',
            this.detalleSolicitud,
          );
        },

        error: (errorResp: any) => {

          console.error(
            this.translate.instant(
              'CIERRE_DETALLE.ERROR_DETALLE'
            ),
            errorResp,
          );

          this.cargando = false;

          const mensajeError =
            errorResp?.error?.Error ||
            errorResp?.error?.Message ||
            this.translate.instant(
              'CIERRE_DETALLE.ERROR_DETALLE'
            );
          this.popup.error(
            mensajeError
          );

          this.dialogRef.close();
        },
      });
  }

  get observacionDocente(): string {

    return (
      this.detalleSolicitud?.Solicitud?.ObservacionCierre ||
      this.detalleSolicitud?.Solicitud?.Observacion ||
      this.translate.instant(
        'CIERRE_DETALLE.SIN_OBSERVACIONES'
      )
    );
  }


  // ======================================================
  // CERRAR
  // ======================================================

  cerrar(): void {

    this.dialogRef.close();
  }

}