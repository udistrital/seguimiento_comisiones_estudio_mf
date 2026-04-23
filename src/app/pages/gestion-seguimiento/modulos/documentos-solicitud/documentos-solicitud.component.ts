import { Component, Input } from '@angular/core';
import { DocumentoSoporte } from '../../../../models/documento.model';

@Component({
    selector: 'app-documentos-solicitud',
    templateUrl: './documentos-solicitud.component.html',
    styleUrls: ['./documentos-solicitud.component.scss'],
    standalone: false
})
export class DocumentosSolicitudComponent {
  @Input() documentos: DocumentoSoporte[] = [];
}
