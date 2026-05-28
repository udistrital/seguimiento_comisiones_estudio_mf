import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfiguracionService } from '../services/configuracion.service';

@Injectable({ providedIn: 'root' })
export class PermisosUtils {

  constructor(private configuracionService: ConfiguracionService) {}

  /**
   * Consulta todos los permisos de una lista en una sola solicitud HTTP.
   * Retorna un mapa { nombreOpcion: boolean } para cada opción solicitada.
   */
  obtenerPermisos(roles: string[], opciones: string[]): Observable<Record<string, boolean>> {
    const vacio = opciones.reduce((acc, op) => ({ ...acc, [op]: false }), {} as Record<string, boolean>);
    if (!roles.length || !opciones.length) return of(vacio);

    const endpoint = `perfil_x_menu_opcion?limit=-1&query=Opcion__Nombre__in:${opciones.join('|')},Perfil__Nombre__in:${roles.join('|')}`;
    return this.configuracionService.get(endpoint).pipe(
      map((response: any) => {
        const data: any[] = Array.isArray(response?.Data) ? response.Data
          : Array.isArray(response) ? response : [];
        const concedidos = new Set(data.map((row: any) => row?.Opcion?.Nombre).filter(Boolean));
        return opciones.reduce((acc, op) => ({ ...acc, [op]: concedidos.has(op) }), {} as Record<string, boolean>);
      }),
      catchError(() => of(vacio))
    );
  }

  /** @deprecated Usar obtenerPermisos() para múltiples permisos en una sola solicitud. */
  tienePermiso(roles: string[], nombreOpcion: string): Observable<boolean> {
    const endpoint = `perfil_x_menu_opcion?limit=-1&query=Opcion__Nombre:${nombreOpcion},Perfil__Nombre__in:${roles.join('|')}`;
    return this.configuracionService.get(endpoint).pipe(
      map((response: any) => {
        const data = response?.Data || response;
        return Array.isArray(data) && data.length > 0;
      }),
      catchError(() => of(false))
    );
  }
}
