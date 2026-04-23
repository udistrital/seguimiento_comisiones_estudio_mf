import { Component, Input } from '@angular/core';
import { CumplimientoItem } from '../../../../models/cumplimiento.model';

@Component({
    selector: 'app-cumplimiento',
    templateUrl: './cumplimiento.component.html',
    styleUrls: ['./cumplimiento.component.scss'],
    standalone: false
})
export class CumplimientoComponent {
  @Input() items: CumplimientoItem[] = [];
  @Input() readOnly = false;

  displayedColumns = ['descripcion', 'fechaLimite', 'cumplido', 'observacion'];

  get porcentajeCumplimiento(): number {
    if (this.items.length === 0) return 0;
    const cumplidos = this.items.filter(i => i.cumplido).length;
    return Math.round((cumplidos / this.items.length) * 100);
  }
}
