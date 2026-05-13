import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observacion } from '../../models/observacion.model';

@Component({
    selector: 'app-panel-observaciones',
    templateUrl: './panel-observaciones.component.html',
    styleUrls: ['./panel-observaciones.component.scss'],
    standalone: false
})
export class PanelObservacionesComponent {
  @Input() observaciones: Observacion[] = [];
  @Input() readOnly = false;
  @Input() titulo = 'DETALLE.OBSERVACIONES';

  @Output() nuevaObservacion = new EventEmitter<string>();

  textoNuevo = '';

  get observacionesOrdenadas(): Observacion[] {
    return [...this.observaciones].reverse();
  }

  enviar(): void {
    const texto = this.textoNuevo.trim();
    if (!texto) return;
    this.nuevaObservacion.emit(texto);
    this.textoNuevo = '';
  }
}
