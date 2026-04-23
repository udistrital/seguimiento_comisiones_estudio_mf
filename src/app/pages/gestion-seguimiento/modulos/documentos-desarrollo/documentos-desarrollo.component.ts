import { Component, Input } from '@angular/core';
import { DocumentoSoporte } from '../../../../models/documento.model';

@Component({
    selector: 'app-documentos-desarrollo',
    templateUrl: './documentos-desarrollo.component.html',
    styleUrls: ['./documentos-desarrollo.component.scss'],
    standalone: false
})
export class DocumentosDesarrolloComponent {
  @Input() documentos: DocumentoSoporte[] = [];
  @Input() permitirCarga = false;
}
