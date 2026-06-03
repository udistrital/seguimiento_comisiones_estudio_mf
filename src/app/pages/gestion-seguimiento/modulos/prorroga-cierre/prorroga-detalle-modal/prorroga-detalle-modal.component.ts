import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SeguimientoService } from '../../../../../services/seguimiento.service';
import { PopUpManager } from '../../../../../managers/popup.manager';
import { MatDialog } from '@angular/material/dialog';
import { VisorDocumentosComponent } from '../../../../../shared/visor-documentos/visor-documentos.component';
import { GestorDocumentalService } from '../../../../../services/gestor-documental.service';

@Component({
  selector: 'app-prorroga-detalle-modal',
  templateUrl: './prorroga-detalle-modal.component.html',
  styleUrls: ['./prorroga-detalle-modal.component.scss'],
  standalone: false,
})
export class ProrrogaDetalleModalComponent {

  cargando = true;

  detalleSolicitud: any = null;

  cargandoDocumento = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProrrogaDetalleModalComponent>,
    private seguimientoService: SeguimientoService,
    private popup: PopUpManager,
    private dialog: MatDialog,
    private gestorDocumental: GestorDocumentalService,
  ) {}

  ngOnInit(): void {
    this.cargarDetalleSolicitud();
  }

  cargarDetalleSolicitud(): void {

    this.cargando = true;

    this.seguimientoService
      .get(`solicitud/detalles_solicitud/${this.data.solicitudId}`)
      .subscribe({

        next: (resp: any) => {

          this.cargando = false;

          if (!resp?.Success) {

            this.popup.error(
              resp?.Message || 'No fue posible cargar el detalle.'
            );

            this.dialogRef.close();

            return;
          }

          this.detalleSolicitud = resp.Data;
        },

        error: () => {

          this.cargando = false;

          this.popup.error(
            'Ocurrió un error cargando el detalle.'
          );

          this.dialogRef.close();
        },
      });
  }

  verDocumento(doc: any): void {

    if (!doc?.Enlace) {

      this.popup.error(
        'El documento no posee enlace.'
      );

      return;
    }

    // =========================
    // LOADER SUPERPUESTO
    // =========================

    this.popup.loading(
      'Cargando documento...'
    );

    this.gestorDocumental
      .get(
        `document/${encodeURIComponent(doc.Enlace)}`
      )
      .subscribe({

        next: (resp: any) => {

          this.popup.close();

          const base64 =
            resp?.Data?.file ||
            resp?.file ||
            null;

          if (!base64) {

            this.popup.error(
              "Documento no disponible"
            );

            return;
          }

          this.dialog.open(
            VisorDocumentosComponent,
            {
              width: '900px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              data: {
                nombre: doc.Nombre,
                estado: doc?.Estado?.Nombre || 'Documento',
                base64,
                mimeType: 'application/pdf',
              },
            },
          );
        },

        error: () => {

          this.popup.close();

          this.popup.error(
            "Error al cargar el documento"
          );
        },
      });
  }
  cerrar(): void {
    this.dialogRef.close();
  }
}