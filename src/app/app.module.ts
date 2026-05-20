import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppComponent } from './app.component';
import { EmptyRouteComponent } from './empty-route/empty-route.component';

// Pages
import { BandejaComponent } from './pages/gestion-seguimiento/bandeja/bandeja.component';
import { DetalleComisionComponent } from './pages/gestion-seguimiento/detalle-comision/detalle-comision.component';
import { IndicadoresComponent } from './pages/gestion-seguimiento/indicadores/indicadores.component';

// Módulos de gestión
import { DocumentosSolicitudComponent } from './pages/gestion-seguimiento/modulos/documentos-solicitud/documentos-solicitud.component';
import { DocumentosDesarrolloComponent } from './pages/gestion-seguimiento/modulos/documentos-desarrollo/documentos-desarrollo.component';
import { GestionPagosComponent } from './pages/gestion-seguimiento/modulos/gestion-pagos/gestion-pagos.component';
import { CumplimientoComponent } from './pages/gestion-seguimiento/modulos/cumplimiento/cumplimiento.component';
import { ProrrogaCierreComponent } from './pages/gestion-seguimiento/modulos/prorroga-cierre/prorroga-cierre.component';

// Shared
import { DynamicTableComponent } from './shared/dynamic-table/dynamic-table.component';
import { CardModuloComponent } from './shared/card-modulo/card-modulo.component';
import { PanelObservacionesComponent } from './shared/panel-observaciones/panel-observaciones.component';
import { InfoGeneralComponent } from './shared/info-general/info-general.component';
import { PanelDocumentosComponent } from './shared/panel-documentos/panel-documentos.component';
import { VisorDocumentosComponent } from './shared/visor-documentos/visor-documentos.component';
import { Fr010FormComponent } from './shared/fr010-form/fr010-form.component';
import { EstadoComisionPipe } from './shared/pipes/estado-comision.pipe';

// Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// i18n
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '@env/environment';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, `${environment.deployUrl}assets/i18n/`, '.json');
}

export class SgaMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    console.warn(`[i18n] Missing translation: "${params.key}"`);
    return params.key;
  }
}

export function paginatorIntlFactory(translate: TranslateService): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  const update = () => {
    intl.itemsPerPageLabel = translate.instant('PAGINATOR.ITEMS_PER_PAGE');
    intl.nextPageLabel = translate.instant('PAGINATOR.NEXT_PAGE');
    intl.previousPageLabel = translate.instant('PAGINATOR.PREV_PAGE');
    intl.firstPageLabel = translate.instant('PAGINATOR.FIRST_PAGE');
    intl.lastPageLabel = translate.instant('PAGINATOR.LAST_PAGE');

    intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) return `0 / ${length}`;
      const start = page * pageSize + 1;
      const end = Math.min(start + pageSize - 1, length);
      return `${start} – ${end} / ${length}`;
    };

    intl.changes.next();
  };

  translate.onLangChange.subscribe(update);
  update();

  return intl;
}

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    EmptyRouteComponent,

    // Pages
    BandejaComponent,
    DetalleComisionComponent,
    IndicadoresComponent,

    // Módulos de gestión
    DocumentosSolicitudComponent,
    DocumentosDesarrolloComponent,
    GestionPagosComponent,
    CumplimientoComponent,
    ProrrogaCierreComponent,

    // Shared
    DynamicTableComponent,
    CardModuloComponent,
    PanelObservacionesComponent,
    InfoGeneralComponent,
    PanelDocumentosComponent,
    VisorDocumentosComponent,
    Fr010FormComponent,
    EstadoComisionPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    // Forms
    FormsModule,
    ReactiveFormsModule,

    // i18n
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: SgaMissingTranslationHandler,
      },
      defaultLanguage: 'es',
    }),

    // Material
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    {
      provide: MatPaginatorIntl,
      useFactory: paginatorIntlFactory,
      deps: [TranslateService],
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
