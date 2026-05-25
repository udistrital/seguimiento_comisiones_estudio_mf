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
    enEjecucion: MOCK_COMISIONES.filter(c => c.estado === 'CUMP_PARCIAL').length,
    enRevision: MOCK_COMISIONES.filter(c => c.estado === 'INCUMP_PARCIAL').length,
    finalizadas: MOCK_COMISIONES.filter(c => c.estado === 'COM_FIN').length,
    canceladas: MOCK_COMISIONES.filter(c => c.estado === 'COM_CANC').length,
    conProrroga: MOCK_COMISIONES.filter(c => c.estadoProrroga !== 'NO_APLICA').length,
  };
}
