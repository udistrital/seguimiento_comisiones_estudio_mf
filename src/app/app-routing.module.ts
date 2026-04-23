import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { BandejaComponent } from './pages/gestion-seguimiento/bandeja/bandeja.component';
import { DetalleComisionComponent } from './pages/gestion-seguimiento/detalle-comision/detalle-comision.component';
import { IndicadoresComponent } from './pages/gestion-seguimiento/indicadores/indicadores.component';
import { APP_BASE_HREF } from '@angular/common';

const routes: Routes = [
  { path: '', redirectTo: 'seguimiento', pathMatch: 'full' },
  { path: 'seguimiento', component: BandejaComponent },
  { path: 'seguimiento/indicadores', component: IndicadoresComponent },
  { path: 'seguimiento/:id', component: DetalleComisionComponent },
  { path: '**', component: EmptyRouteComponent },
];

export function appBaseHrefFactory(): string {
  const p = window.location.pathname || '/';
  if (p.startsWith('/seguimiento-comisiones')) return '/seguimiento-comisiones';
  return '/';
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: APP_BASE_HREF, useFactory: appBaseHrefFactory },
  ],
})
export class AppRoutingModule {}
