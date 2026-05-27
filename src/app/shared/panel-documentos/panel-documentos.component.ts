import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentoSoporte } from '../../models/documento.model';
import { estadoDocumentoClass } from '../../utils/estado-comision.util';

@Component({
    selector: 'app-panel-documentos',
    templateUrl: './panel-documentos.component.html',
    styleUrls: ['./panel-documentos.component.scss'],
    standalone: false
})
export class PanelDocumentosComponent {
  @Input() documentos: DocumentoSoporte[] = [];
  @Input() titulo = 'DETALLE.DOCUMENTOS';
  @Input() permitirVer = true;
  @Input() permitirCarga = false;
  @Input() permitirCheck = false;

  @Output() verDocumento = new EventEmitter<DocumentoSoporte>();
  @Output() cargarDocumento = new EventEmitter<DocumentoSoporte>();

  displayedColumns: string[] = ['nombre', 'autorSoporte', 'estado', 'acciones'];

  getEstadoClass(doc: DocumentoSoporte): string {
    return estadoDocumentoClass(doc.estado);
  }

  onVer(doc: DocumentoSoporte): void {
    this.verDocumento.emit(doc);
  }

  onCargar(doc: DocumentoSoporte): void {
    this.cargarDocumento.emit(doc);
  }
}
