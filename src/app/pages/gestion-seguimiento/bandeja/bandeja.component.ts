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
    private readonly seguimientoService: SeguimientoService,
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

    const cedula = getDocumento() ?? '';
    let llamada$;

    switch (this.rolActual) {
      case 'DOCENTE':
        llamada$ = this.seguimientoService.listarComisionesDocente(cedula);
        break;
      case 'DECANO':
        llamada$ = this.seguimientoService.listarComisionesDecano(cedula);
        break;
      case 'SECRETARIA_GENERAL':
      case 'SECRETARIA_ACADEMICA':
        llamada$ = this.seguimientoService.listarComisionesSecretariaGeneral();
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
      estado: (item.estado_comision || 'PENDIENTE') as EstadoComision,
      estadoProrroga: 'NO_APLICA' as EstadoProrroga,
    }));
  }

  private extraerFecha(valor: string | null | undefined): string {
    if (!valor) return '';
    // Los timestamps de Go vienen como "2026-01-15T00:00:00Z" — extraer solo la fecha
    const partes = valor.split('T');
    return partes[0] ?? valor;
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
