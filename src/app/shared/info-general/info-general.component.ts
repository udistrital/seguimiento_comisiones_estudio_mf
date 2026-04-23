import { Component, Input } from '@angular/core';
import { ComisionDetalle } from '../../models/comision.model';

@Component({
    selector: 'app-info-general',
    templateUrl: './info-general.component.html',
    styleUrls: ['./info-general.component.scss'],
    standalone: false
})
export class InfoGeneralComponent {
  @Input() comision!: ComisionDetalle;
}
