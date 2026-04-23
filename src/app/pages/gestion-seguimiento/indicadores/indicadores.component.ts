import { Component } from '@angular/core';
import { MOCK_COMISIONES } from '../../../services/seguimiento-mock.data';

@Component({
    selector: 'app-indicadores',
    templateUrl: './indicadores.component.html',
    styleUrls: ['./indicadores.component.scss'],
    standalone: false
})
export class IndicadoresComponent {
  stats = {
    total: MOCK_COMISIONES.length,
    enEjecucion: MOCK_COMISIONES.filter(c => c.estado === 'EN_EJECUCION').length,
    enRevision: MOCK_COMISIONES.filter(c => c.estado === 'EN_REVISION').length,
    finalizadas: MOCK_COMISIONES.filter(c => c.estado === 'FINALIZADA').length,
    canceladas: MOCK_COMISIONES.filter(c => c.estado === 'CANCELADA').length,
    conProrroga: MOCK_COMISIONES.filter(c => c.estadoProrroga !== 'NO_APLICA').length,
  };
}
