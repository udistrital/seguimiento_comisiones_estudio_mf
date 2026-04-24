import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Role, resolverRolEfectivo } from '../../../models/roles.model';
import { ComisionRow } from '../../../models/comision.model';
import { ColumnDef, TableAction } from '../../../shared/dynamic-table/dynamic-table.types';
import { getColumnsByRole, getActionsByRole, BandejaActionKey } from './bandeja.table-config';
import { getRolesUsuario, getDocumento } from '../../../utils/auth.util';
import { PopUpManager } from '../../../managers/popup.manager';
import { MOCK_COMISIONES } from '../../../services/seguimiento-mock.data';

@Component({
    selector: 'app-bandeja-seguimiento',
    templateUrl: './bandeja.component.html',
    styleUrls: ['./bandeja.component.scss'],
    standalone: false
})
export class BandejaComponent implements OnInit {
  rolActual: Role | null = null;
  rolLabel = '';
  comisiones: ComisionRow[] = [];
  columns: ColumnDef<ComisionRow>[] = [];
  actions: TableAction<ComisionRow>[] = [];
  enableFilters = false;

  cargando = true;
  errorCarga = false;

  constructor(
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly popup: PopUpManager,
  ) {}

  ngOnInit(): void {
    const rolesUsuario = getRolesUsuario();
    this.rolActual = resolverRolEfectivo(rolesUsuario);

    if (!this.rolActual) {
      this.rolActual = 'DOCENTE'; // fallback para desarrollo local
    }

    this.rolLabel = this.translate.instant('ROLES.' + this.rolActual);
    this.enableFilters = this.rolActual !== 'DOCENTE';

    this.columns = getColumnsByRole(this.rolActual);
    this.actions = getActionsByRole(this.rolActual);

    this.cargarComisiones();
  }

  private cargarComisiones(): void {
    this.cargando = true;
    this.errorCarga = false;

    // TODO: Reemplazar por llamada real al servicio cuando los endpoints existan.
    // Por ahora se usan datos mock filtrados por rol.
    setTimeout(() => {
      try {
        switch (this.rolActual) {
          case 'DOCENTE':
            // Docente solo ve sus propias comisiones
            this.comisiones = MOCK_COMISIONES.filter(c =>
              c.idDocente === (getDocumento() || '1032456789')
            );
            // Si no hay match con documento real, mostrar todas las mock
            if (this.comisiones.length === 0) {
              this.comisiones = MOCK_COMISIONES.slice(0, 3);
            }
            break;

          case 'DECANO':
            // Decano ve comisiones asignadas
            this.comisiones = MOCK_COMISIONES.filter(c =>
              c.estado !== 'CANCELADA'
            );
            break;

          case 'SECRETARIA_GENERAL':
            // Secretaría General ve todas
            this.comisiones = [...MOCK_COMISIONES];
            break;

          default:
            this.comisiones = [];
        }

        this.cargando = false;
      } catch {
        this.errorCarga = true;
        this.cargando = false;
      }
    }, 600);
  }

  onAction(event: { action: string; row: ComisionRow }): void {
    const key = event.action as BandejaActionKey;
    const comision = event.row;

    switch (key) {
      case 'VER':
        this.router.navigate(['/seguimiento', comision.id], {
          queryParams: { mode: 'VER' },
        });
        break;

      case 'GESTIONAR':
        this.router.navigate(['/seguimiento', comision.id], {
          queryParams: { mode: 'GESTIONAR' },
        });
        break;

      default:
        console.warn(`[Bandeja] Acción no reconocida: ${key}`);
    }
  }
}
