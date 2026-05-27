import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

import { Role } from '../../../../models/roles.model';
import { PopUpManager } from '../../../../managers/popup.manager';
import { SeguimientoService } from '../../../../services/seguimiento.service';
import { estadoComisionClass } from '../../../../utils/estado-comision.util';
import { getNombreUsuario, getDocumento } from '../../../../utils/auth.util';

interface EstadoCumplimiento {
  id: number;
  nombre: string;
  codigo: string;
}

interface RegistroCumplimiento {
  id: number;
  descripcion: string;
  fecha_creacion: string;
  estado_id: number;
  estado_codigo: string;
  estado_nombre: string;
  activo: boolean;
}

@Component({
  selector: 'app-cumplimiento',
  templateUrl: './cumplimiento.component.html',
  styleUrls: ['./cumplimiento.component.scss'],
  standalone: false,
})
export class CumplimientoComponent implements OnChanges {
  @Input() comisionId!: number;
  @Input() rolActual: Role | null = null;
  @Input() mode: 'VER' | 'GESTIONAR' = 'VER';
  @Input() permisoRegistrar = true;

  @Output() estadoCambiado = new EventEmitter<string>();

  historial: RegistroCumplimiento[] = [];
  estadosCumplimiento: EstadoCumplimiento[] = [];
  cargando = false;
  guardando = false;

  readonly displayedColumns = ['descripcion', 'fecha', 'estado'];

  constructor(
    private readonly seguimientoService: SeguimientoService,
    private readonly popup: PopUpManager,
    private readonly translate: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['comisionId'] && this.comisionId) {
      this.cargarDatos();
    }
  }

  get puedeRegistrar(): boolean {
    return this.mode === 'GESTIONAR' && this.rolActual === 'DECANO' && this.permisoRegistrar;
  }

  private cargarDatos(): void {
    this.cargando = true;
    this.seguimientoService.get('seguimiento/estados_cumplimiento').subscribe({
      next: (resp: any) => {
        this.estadosCumplimiento = Array.isArray(resp?.Data) ? resp.Data : [];
      },
      error: () => {
        this.popup.error(this.translate.instant('CUMPLIMIENTO.ERROR_ESTADOS'));
      },
    });

    this.seguimientoService.get(`seguimiento/historial_cumplimiento/${this.comisionId}`).subscribe({
      next: (resp: any) => {
        this.historial = Array.isArray(resp?.Data) ? resp.Data : [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.popup.error(this.translate.instant('CUMPLIMIENTO.ERROR_CARGA'));
      },
    });
  }

  chipClass(codigo: string): string {
    // Reutiliza el mismo mapeo que el resto de la app, con fallback seguro.
    const estadosValidos = ['COM_INI','CUMP_PARCIAL','PROR','INCUMP_PARCIAL','CUMP_TOTAL','INCUMP_CIERRE','COM_FIN','COM_CANC'];
    if (estadosValidos.includes(codigo)) {
      return estadoComisionClass(codigo as any);
    }
    return 'st-pendiente';
  }

  formatFecha(iso: string): string {
    if (!iso) return '';
    try {
      const clean = iso.trim()
        .replace(' ', 'T')
        .replace(/\.\d+.*$/, '')
        .replace(/Z$/, '')
        .replace(/[+-]\d{2}:?\d{2}$/, '');
      const d = new Date(clean);
      if (isNaN(d.getTime())) return iso;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch {
      return iso;
    }
  }

  onRegistrar(): void {
    if (!this.estadosCumplimiento.length) {
      this.popup.error(this.translate.instant('CUMPLIMIENTO.ERROR_ESTADOS'));
      return;
    }

    const opcionesSelect = this.estadosCumplimiento
      .map(e => `<option value="${e.id}">${e.nombre}</option>`)
      .join('');

    Swal.fire({
      title: this.translate.instant('CUMPLIMIENTO.TITULO_SWAL'),
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
              ${this.translate.instant('CUMPLIMIENTO.ESTADO')}
            </label>
            <select id="swal-estado-cumplimiento"
              style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:6px; font-size:14px; color:#111827;">
              <option value="">${this.translate.instant('CUMPLIMIENTO.SELECCIONAR_ESTADO')}</option>
              ${opcionesSelect}
            </select>
          </div>
          <div>
            <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
              ${this.translate.instant('CUMPLIMIENTO.DESCRIPCION')}
            </label>
            <textarea id="swal-desc-cumplimiento" rows="4"
              placeholder="${this.translate.instant('CUMPLIMIENTO.DESCRIPCION_PH')}"
              style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:6px; font-size:14px; color:#111827; resize:vertical; box-sizing:border-box;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('CUMPLIMIENTO.CONFIRMAR'),
      cancelButtonText: this.translate.instant('CUMPLIMIENTO.CANCELAR'),
      confirmButtonColor: '#03678F',
      reverseButtons: true,
      customClass: { popup: 'sga-swal-popup' },
      preConfirm: () => {
        const desc = (document.getElementById('swal-desc-cumplimiento') as HTMLTextAreaElement)?.value?.trim();
        const estadoIdStr = (document.getElementById('swal-estado-cumplimiento') as HTMLSelectElement)?.value;
        const estadoId = parseInt(estadoIdStr, 10);

        if (!estadoId) {
          Swal.showValidationMessage(this.translate.instant('CUMPLIMIENTO.SELECCIONAR_ESTADO'));
          return false;
        }
        if (!desc) {
          Swal.showValidationMessage(this.translate.instant('CUMPLIMIENTO.DESCRIPCION_REQUERIDA'));
          return false;
        }
        return { descripcion: desc, estadoId };
      },
    }).then(result => {
      if (!result.isConfirmed || !result.value) return;
      const { descripcion, estadoId } = result.value;

      const estadoSeleccionado = this.estadosCumplimiento.find(e => e.id === estadoId);

      const body = {
        comision_id: this.comisionId,
        estado_id: estadoId,
        descripcion,
        rol: this.rolActual || 'DECANO',
        nombre: getNombreUsuario() || '',
        numero_identificacion: getDocumento() || '',
      };

      this.guardando = true;
      this.seguimientoService.post('seguimiento/registro_cumplimiento', body).subscribe({
        next: () => {
          this.guardando = false;
          this.cargarDatos();
          this.popup.success(this.translate.instant('CUMPLIMIENTO.EXITO_REGISTRO'));
          if (estadoSeleccionado) {
            this.estadoCambiado.emit(estadoSeleccionado.codigo);
          }
        },
        error: () => {
          this.guardando = false;
          this.popup.error(this.translate.instant('CUMPLIMIENTO.ERROR_REGISTRO'));
        },
      });
    });
  }
}
