import { Pipe, PipeTransform } from '@angular/core';
import { EstadoComision } from '../../models/estados.model';
import { estadoComisionClass } from '../../utils/estado-comision.util';

@Pipe({ name: 'estadoComisionPipe', standalone: false })
export class EstadoComisionPipe implements PipeTransform {
  transform(value: EstadoComision | string): string {
    return estadoComisionClass(value as EstadoComision);
  }
}
