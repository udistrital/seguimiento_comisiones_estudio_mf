import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModuloGestion } from '../../models/modulo-gestion.model';

@Component({
    selector: 'app-card-modulo',
    templateUrl: './card-modulo.component.html',
    styleUrls: ['./card-modulo.component.scss'],
    standalone: false
})
export class CardModuloComponent {
  @Input() modulo!: ModuloGestion;
  @Output() moduloClick = new EventEmitter<string>();

  onClick(): void {
    this.moduloClick.emit(this.modulo.key);
  }
}
