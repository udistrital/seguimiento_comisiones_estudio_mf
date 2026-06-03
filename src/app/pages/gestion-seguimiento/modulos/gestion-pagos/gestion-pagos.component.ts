import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

import { Role } from '../../../../models/roles.model';
import { PopUpManager } from '../../../../managers/popup.manager';
import { SeguimientoService } from '../../../../services/seguimiento.service';
import { GestorDocumentalService } from '../../../../services/gestor-documental.service';
import { VisorDocumentosComponent } from '../../../../shared/visor-documentos/visor-documentos.component';
import { getNombreUsuario } from '../../../../utils/auth.util';
import { mapEstadoDocumento } from '../../../../utils/estado-comision.util';

@Component({
    selector: 'app-gestion-pagos',
    templateUrl: './gestion-pagos.component.html',
    styleUrls: ['./gestion-pagos.component.scss'],
    standalone: false
})
export class GestionPagosComponent implements OnChanges {
  @Input() comisionId!: number;
  @Input() rolActual: Role | null = null;
  @Input() idTipoDocumento: number | null = null;
  @Input() permisoSubir = true;
  @Input() permisoEliminar = true;
  @Input() permisoVer = true;

  @ViewChild('fileInputPago') fileInputPago!: ElementRef<HTMLInputElement>;

  documentos: any[] = [];
  cargando = false;
  subiendo = false;

  readonly displayedColumns = ['nombre', 'subido_por', 'estado', 'acciones'];

  constructor(
    private readonly seguimientoService: SeguimientoService,
    private readonly gestorDocumental: GestorDocumentalService,
    private readonly dialog: MatDialog,
    private readonly popup: PopUpManager,
    private readonly translate: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['comisionId'] && this.comisionId) {
      this.cargarDocumentos();
    }
  }

  get puedeSubir(): boolean {
    return this.rolActual === 'DECANO' && this.permisoSubir;
  }

  get puedeEliminar(): boolean {
    return this.rolActual === 'DECANO' && this.permisoEliminar;
  }

  private cargarDocumentos(): void {
    this.cargando = true;
    this.seguimientoService.get(`seguimiento/documentos_pagos/${this.comisionId}`).subscribe({
      next: (resp: any) => {
        this.documentos = Array.isArray(resp?.Data) ? resp.Data : [];
        this.cargando = false;
      },
      error: () => { this.cargando = false; },
    });
  }

  nombreRol(rol: string): string {
    const map: Record<string, string> = {
      DECANO: 'Decano',
      SECRETARIA_GENERAL: 'Secretaría General',
      DOCENTE: 'Docente',
    };
    return map[rol] || rol;
  }

  onSubirDocumento(): void {
    Swal.fire({
      title: this.translate.instant('PAGOS.NOMBRE_DOCUMENTO'),
      input: 'text',
      inputPlaceholder: this.translate.instant('PAGOS.NOMBRE_PLACEHOLDER'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('PAGOS.CONTINUAR'),
      cancelButtonText: this.translate.instant('PAGOS.CANCELAR'),
      reverseButtons: true,
      customClass: { popup: 'sga-swal-popup' },
      inputValidator: (value) => {
        if (!value || value.trim().length < 12) {
          return this.translate.instant('PAGOS.NOMBRE_MIN_CHARS');
        }
        return null;
      },
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;
      const nombre = result.value.trim();
      (this as any)._nombrePendiente = nombre;
      this.fileInputPago.nativeElement.value = '';
      this.fileInputPago.nativeElement.click();
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const nombre: string = (this as any)._nombrePendiente;
    (this as any)._nombrePendiente = null;

    if (!file || !nombre) return;

    if (!this.idTipoDocumento) {
      this.popup.error(this.translate.instant('POPUPS.ERROR_TIPO_DOC_NO_RESUELTO'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const body = {
        comision_id: this.comisionId,
        tipo_documento_codigo: 'PAG_SOPORTE',
        id_tipo_documento: this.idTipoDocumento,
        nombre,
        descripcion: JSON.stringify({
          rol: this.rolActual,
          nombre: getNombreUsuario() || '',
        }),
        file: base64,
      };
      this.subiendo = true;
      this.seguimientoService.post('seguimiento/documento_desarrollo', body).subscribe({
        next: () => {
          this.subiendo = false;
          this.cargarDocumentos();
          this.popup.success(this.translate.instant('POPUPS.DOC_SUBIDO'));
        },
        error: () => {
          this.subiendo = false;
          this.popup.error(this.translate.instant('POPUPS.ERROR_SUBIR_DOC'));
        },
      });
    };
    reader.readAsDataURL(file);
  }

  onVerDocumento(doc: any): void {
    if (!doc.enlace) {
      this.popup.error(this.translate.instant('POPUPS.DOC_NO_DISPONIBLE'));
      return;
    }
    this.gestorDocumental.get(`document/${encodeURIComponent(doc.enlace)}`).subscribe({
      next: (resp: any) => {
        const base64 = resp?.Data?.file || resp?.file || null;
        if (!base64) {
          this.popup.error(this.translate.instant('POPUPS.DOC_NO_DISPONIBLE'));
          return;
        }
        const autorLabel = this.nombreRol(doc.subido_por_rol) +
          (doc.subido_por_nombre ? ' — ' + doc.subido_por_nombre : '');
        this.dialog.open(VisorDocumentosComponent, {
          width: '900px', maxWidth: '95vw', maxHeight: '90vh',
          data: { nombre: doc.nombre, autor: autorLabel, estado: mapEstadoDocumento(doc.estado), base64, mimeType: 'application/pdf' },
        });
      },
      error: () => this.popup.error(this.translate.instant('POPUPS.ERROR_CARGAR_DOCUMENTO')),
    });
  }

  onEliminarDocumento(doc: any): void {
    this.popup.confirm(this.translate.instant('POPUPS.CONFIRMAR_ELIMINAR_DOC')).then(result => {
      if (!result.isConfirmed) return;
      this.seguimientoService.put(`seguimiento/documento_desarrollo/${doc.documento_comision_id}/desactivar`, {}).subscribe({
        next: () => {
          this.cargarDocumentos();
          this.popup.success(this.translate.instant('POPUPS.DOC_ELIMINADO'));
        },
        error: () => this.popup.error(this.translate.instant('POPUPS.ERROR_ELIMINAR_DOC')),
      });
    });
  }
}
