import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComisionDetalle } from '../../../../models/comision.model';
import { estadoProrrogaClass } from '../../../../utils/estado-comision.util';
import { Role } from '../../../../models/roles.model';

@Component({
    selector: 'app-prorroga-cierre',
    templateUrl: './prorroga-cierre.component.html',
    styleUrls: ['./prorroga-cierre.component.scss'],
    standalone: false
})
export class ProrrogaCierreComponent {
  @Input() comision!: ComisionDetalle;
  @Input() readOnly = false;
  @Input() rolActual: Role | null = null;

  @Output() retornar = new EventEmitter<void>();
  @Output() rechazar = new EventEmitter<void>();
  @Output() enviar = new EventEmitter<void>();

  fechaNuevaFin = '';
  justificacion = '';

  get prorrogaClass(): string {
    return estadoProrrogaClass(this.comision?.estadoProrroga);
  }

  get isSecretariaGeneral(): boolean {
    return this.rolActual === 'SECRETARIA_GENERAL';
  }

  get canSolicitarProrroga(): boolean {
    return !this.readOnly && this.rolActual === 'DOCENTE' && this.comision?.estadoProrroga === 'NO_APLICA';
  }
}
