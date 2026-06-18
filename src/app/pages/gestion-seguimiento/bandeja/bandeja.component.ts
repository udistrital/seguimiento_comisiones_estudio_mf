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

  // ADMIN_SGA
  isAdminSga = false;
  rolEmulado: Role = 'SECRETARIA_GENERAL';
  readonly rolesEmulables: Role[] = ['DOCENTE', 'SECRETARIA_GENERAL', 'DECANO'];
  cedulaBusqueda = '';
  cedulasHistorial: string[] = [];
  private readonly SK_ROL    = 'admin_sga_rol_emulado_seg';
  private readonly SK_CEDULA = 'admin_sga_cedula_seg';
  private readonly SK_CEDULAS = 'admin_sga_cedulas_seg';

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

    if (this.rolActual === 'ADMIN_SGA') {
      this.isAdminSga = true;

      const savedRol = sessionStorage.getItem(this.SK_ROL) as Role | null;
      const savedCedula = sessionStorage.getItem(this.SK_CEDULA) || '';
      try { this.cedulasHistorial = JSON.parse(sessionStorage.getItem(this.SK_CEDULAS) || '[]'); } catch { this.cedulasHistorial = []; }

      if (savedRol && (this.rolesEmulables as string[]).includes(savedRol)) {
        this.rolEmulado = savedRol;
        this.cedulaBusqueda = savedRol === 'DOCENTE' ? savedCedula : '';
        this.columns = getColumnsByRole(savedRol);
        this.actions = getActionsByRole(savedRol);
        if (savedRol !== 'DOCENTE' || savedCedula) {
          this.cargarComoAdminSga();
        } else {
          this.cargando = false;
        }
      } else {
        this.rolEmulado = 'SECRETARIA_GENERAL';
        this.columns = getColumnsByRole('SECRETARIA_GENERAL');
        this.actions = getActionsByRole('SECRETARIA_GENERAL');
        this.cargarComoAdminSga();
      }

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
      return;
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

  onRolEmuladoSeleccionado(rol: Role): void {
    this.rolEmulado = rol;
    this.comisiones = [];
    this.errorCarga = false;
    sessionStorage.setItem(this.SK_ROL, rol);
    this.columns = getColumnsByRole(rol);
    this.actions = getActionsByRole(rol);
    if (rol === 'DOCENTE') {
      this.cedulaBusqueda = sessionStorage.getItem(this.SK_CEDULA) || '';
      this.cargando = false;
    } else {
      this.cedulaBusqueda = '';
      this.cargarComoAdminSga();
    }
  }

  buscarComoDocente(): void {
    const cedula = this.cedulaBusqueda.trim();
    if (!cedula) { this.popup.error(this.translate.instant('ADMIN_SGA.CEDULA_REQUERIDA')); return; }
    sessionStorage.setItem(this.SK_CEDULA, cedula);
    if (!this.cedulasHistorial.includes(cedula)) {
      this.cedulasHistorial = [cedula, ...this.cedulasHistorial].slice(0, 5);
      sessionStorage.setItem(this.SK_CEDULAS, JSON.stringify(this.cedulasHistorial));
    }
    this.cargarComoAdminSga();
  }

  private cargarComoAdminSga(): void {
    this.cargando = true;
    this.errorCarga = false;

    let endpoint: string;
    switch (this.rolEmulado) {
      case 'DOCENTE':
        endpoint = `seguimiento/comisiones_docente/${this.cedulaBusqueda}`;
        break;
      case 'DECANO':
      case 'SECRETARIA_GENERAL':
        endpoint = 'seguimiento/comisiones_secretaria_general';
        break;
      default:
        this.cargando = false;
        return;
    }

    this.seguimientoService.get(endpoint).subscribe({
      next: (resp: any) => {
        const items: any[] = Array.isArray(resp?.Data) ? resp.Data : [];
        this.comisiones = this.mapearRespuesta(items);
        this.cargando = false;
      },
      error: () => { this.errorCarga = true; this.cargando = false; },
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
    this.router.navigate(['/seguimiento', event.row.id]);
  }
}
