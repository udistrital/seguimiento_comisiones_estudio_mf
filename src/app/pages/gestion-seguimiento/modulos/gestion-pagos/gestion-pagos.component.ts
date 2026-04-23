import { Component, Input } from '@angular/core';
import { PagoComision } from '../../../../models/pago.model';
import { estadoPagoClass } from '../../../../utils/estado-comision.util';

@Component({
    selector: 'app-gestion-pagos',
    templateUrl: './gestion-pagos.component.html',
    styleUrls: ['./gestion-pagos.component.scss'],
    standalone: false
})
export class GestionPagosComponent {
  @Input() pagos: PagoComision[] = [];
  @Input() readOnly = false;

  displayedColumns = ['concepto', 'monto', 'fechaProgramada', 'fechaPago', 'estado'];

  getEstadoClass(pago: PagoComision): string {
    return estadoPagoClass(pago.estado);
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  }

  get totalProgramado(): number {
    return this.pagos.reduce((sum, p) => sum + p.monto, 0);
  }

  get totalPagado(): number {
    return this.pagos.filter(p => p.estado === 'PAGADO').reduce((sum, p) => sum + p.monto, 0);
  }
}
