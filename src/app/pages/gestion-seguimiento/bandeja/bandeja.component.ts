import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Role, resolverRolEfectivo } from '../../../models/roles.model';
import { ComisionRow } from '../../../models/comision.model';
import { EstadoComision, EstadoProrroga } from '../../../models/estados.model';
import { ColumnDef, TableAction } from '../../../shared/dynamic-table/dynamic-table.types';
import { getColumnsByRole, getActionsByRole, BandejaActionKey } from './bandeja.table-config';
import { getRolesUsuario, getDocumento } from '../../../utils/auth.util';
import { PopUpManager } from '../../../managers/popup.manager';
import { SeguimientoService } from '../../../services/seguimiento.service';
import { PermisosUtils } from '../../../utils/role-permissions';

@Component({
    selector: 'app-bandeja-seguimiento',
    templateUrl: './bandeja.component.html',
    styleUrls: ['./bandeja.component.scss'],
    standalone: false
})
export class BandejaComponent implements OnInit {
  rolActual: Role | null = null;
  roles: string[] = [];
  rolLabel = '';
  comisiones: ComisionRow[] = [];
  columns: ColumnDef<ComisionRow>[] = [];
  actions: TableAction<ComisionRow>[] = [];
  enableFilters = false;

  cargando = true;
  errorCarga = false;

  readonly opcionesPermisos = ['ver_filtros_tabla', 'gestionar_comision'];
  permisos: { [key: string]: boolean } = {};
  permisosListos = false;

  constructor(
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly popup: PopUpManager,
    private readonly seguimientoService: SeguimientoService,
    private readonly permisosUtils: PermisosUtils,
  ) {}

  ngOnInit(): void {
    this.roles = getRolesUsuario();
    this.rolActual = resolverRolEfectivo(this.roles);

    if (!this.rolActual) {
      this.rolActual = 'DOCENTE'; // fallback para desarrollo local
    }

    this.translate.get('ROLES.' + this.rolActual).subscribe(label => { this.rolLabel = label; });
    // Valor inicial basado en rol; se refina cuando cargan los permisos
    this.enableFilters = this.rolActual !== 'DOCENTE';

    this.columns = getColumnsByRole(this.rolActual);
    this.actions = getActionsByRole(this.rolActual);

    this.cargarComisiones();

    this.permisosUtils.obtenerPermisos(this.roles, this.opcionesPermisos).subscribe({
      next: (permisos) => {
        this.permisos = permisos;
        this.permisosListos = true;
        this.enableFilters = permisos['ver_filtros_tabla'] ?? false;
        if (!permisos['gestionar_comision']) {
          this.actions = this.actions.filter(a => a.key !== 'GESTIONAR');
        }
      },
      error: () => { this.permisosListos = true; },
    });
  }

  private cargarComisiones(): void {
    this.cargando = true;
    this.errorCarga = false;

    const cedula = getDocumento() ?? '';
    let llamada$;

    switch (this.rolActual) {
      case 'DOCENTE':
        llamada$ = this.seguimientoService.get(`seguimiento/comisiones_docente/${cedula}`);
        break;
      case 'DECANO':
        llamada$ = this.seguimientoService.get(`seguimiento/comisiones_decano/${cedula}`);
        break;
      case 'SECRETARIA_GENERAL':
        llamada$ = this.seguimientoService.get('seguimiento/comisiones_secretaria_general');
        break;
      default:
        this.comisiones = [];
        this.cargando = false;
        return;
    }

    llamada$.subscribe({
      next: (resp: any) => {
        const items: any[] = Array.isArray(resp?.Data) ? resp.Data : [];
        this.comisiones = this.mapearRespuesta(items);
        this.cargando = false;
      },
      error: () => {
        this.errorCarga = true;
        this.cargando = false;
      },
    });
  }

  private mapearRespuesta(items: any[]): ComisionRow[] {
    return items.map(item => ({
      id: item.comision_id ?? 0,
      solicitudId: item.solicitud_id ?? 0,
      docente: item.docente ?? '',
      idDocente: item.id_docente ?? '',
      programa: item.programa ?? '',
      fechaSolicitud: this.extraerFecha(item.fecha_solicitud),
      fechaInicio: this.extraerFecha(item.fecha_inicio),
      fechaFin: this.extraerFecha(item.fecha_fin),
      estado: (item.estado_comision || 'COM_INI') as EstadoComision,
      estadoProrroga: 'NO_APLICA' as EstadoProrroga,
    }));
  }

  private extraerFecha(valor: string | null | undefined): string {
    if (!valor) return '';
    // Normaliza tanto "2026-01-15T00:00:00Z" como "2026-01-15 20:06:26.515418 +0000 +0000"
    return valor.substring(0, 10);
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
