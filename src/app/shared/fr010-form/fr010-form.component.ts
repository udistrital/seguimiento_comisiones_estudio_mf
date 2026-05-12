import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fr010-form',
  templateUrl: './fr010-form.component.html',
  styleUrls: ['./fr010-form.component.scss'],
  standalone: false,
})
export class Fr010FormComponent implements OnInit {
  /** Datos persistidos del formulario a mostrar en solo lectura. */
  @Input() datosIniciales: any = null;

  form!: FormGroup;

  tipoEstudioOptions = [
    { value: 'MAESTRIA',     label: 'FR010.OPT_MAESTRIA' },
    { value: 'DOCTORADO',    label: 'FR010.OPT_DOCTORADO' },
    { value: 'POSTDOCTORADO', label: 'FR010.OPT_POSTDOCTORADO' },
  ];

  tipoApoyoOptions = [
    { value: 'COMISION_EXTERIOR',           label: 'FR010.OPT_COMISION_EXTERIOR' },
    { value: 'COMISION_COLOMBIA_FUERA',     label: 'FR010.OPT_COMISION_COLOMBIA_FUERA' },
    { value: 'COMISION_BOGOTA',             label: 'FR010.OPT_COMISION_BOGOTA' },
    { value: 'COMISION_SEMIPRESENCIAL',     label: 'FR010.OPT_COMISION_SEMIPRESENCIAL' },
    { value: 'APOYO_DESCARGA_MATRICULA',    label: 'FR010.OPT_APOYO_DESCARGA_MATRICULA' },
    { value: 'APOYO_DESCARGA',              label: 'FR010.OPT_APOYO_DESCARGA' },
  ];

  readonly loadingSolicitante = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    this.form = this.fb.group({
      solicitante: this.fb.group({
        q1_fecha: [{ value: todayIso, disabled: true }],
        q2_facultad: [{ value: '', disabled: true }],
        q3_nombres_apellidos: [{ value: '', disabled: true }],
        q4_documento_identificacion: [{ value: '', disabled: true }],
        q5_edad: [{ value: '', disabled: true }],
        q6_correo: [{ value: '', disabled: true }],
        q7_proyecto: [{ value: '', disabled: true }],
        q8_telefono: [{ value: '', disabled: true }],
        q9_celular: [{ value: '', disabled: true }],
        q10_fecha_ingreso_universidad: [{ value: null, disabled: true }],
        q10_resolucion_rh: [{ value: '', disabled: true }],
        q11_categoria_ingreso: [{ value: '', disabled: true }],
        q12_categoria_actual: [{ value: '', disabled: true }],
      }),

      solicitud: this.fb.group(
        {
          q13_tipo_estudio: [null, [Validators.required]],
          q14_nombre_programa: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
          q15_titulo_aspira: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
          q16_universidad: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
          q17_pais: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
          q18_ciudad: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
          q19_fecha_aceptacion: [null, [Validators.required]],
          q20_num_semestres: ['', [Validators.required]],
          q22_tipo_apoyo_requerido: [null, [Validators.required]],
          q23_fecha_inicio_estudios: [null, [Validators.required]],
          q24_fecha_culminacion_estudios: [null, [Validators.required]],
          q25_tiempo_requerido_culminacion: ['', [Validators.required]],
          q26_costo_total_requerido: ['', [Validators.required]],
        },
        { validators: [this.solicitudDatesValidator()] }
      ),

      financiacion_colombia: this.fb.group({
        q27_pago_matricula_valor: [''],
        q28_pago_matricula_total: [''],
        q29_tiquetes: [''],
        q30_descarga_academica_horas: [''],
        q31_descarga_academica_valor_total: [''],
        q32_costo_reemplazo_docente: [''],
      }),

      financiacion_exterior: this.fb.group({
        q33_valor_salario_tiempo_comision: [''],
        q34_pago_matricula_valor: [''],
        q35_pago_total_matricula: [''],
        q36_tiquetes: [''],
        q37_seguro_medico: [''],
        q38_gastos_instalacion: [''],
        q39_costo_reemplazo_docente: [''],
      }),

      beca: this.fb.group({
        q40_cubrimiento_beca: [''],
        q41_institucion_otorga: [''],
        q42_tipo_financiacion_monto: [''],
        q43_duracion_beca: [''],
      }),

      observaciones: [''],
    });

    if (this.datosIniciales) {
      this.patchFromExisting(this.datosIniciales);
    }

    this.form.disable();
  }

  public patchFromExisting(data: any): void {
    if (data.solicitante) {
      this.form.get('solicitante')?.patchValue(data.solicitante);
    }

    if (data.solicitud) {
      const patched = { ...data.solicitud };
      ['q19_fecha_aceptacion', 'q23_fecha_inicio_estudios', 'q24_fecha_culminacion_estudios'].forEach((key) => {
        if (patched[key] && typeof patched[key] === 'string' && patched[key].trim()) {
          patched[key] = new Date(patched[key]);
        }
      });
      this.form.get('solicitud')?.patchValue(patched);
    }

    if (data.financiacion_colombia) {
      this.form.get('financiacion_colombia')?.patchValue(data.financiacion_colombia);
    }

    if (data.financiacion_exterior) {
      this.form.get('financiacion_exterior')?.patchValue(data.financiacion_exterior);
    }

    if (data.beca) {
      this.form.get('beca')?.patchValue(data.beca);
    }

    if (data.observaciones) {
      this.form.get('observaciones')?.patchValue(data.observaciones);
    }
  }

  public isInvalid(path: string): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  public hasSolicitudGroupError(errorKey: string): boolean {
    const group = this.form.get('solicitud');
    if (!group) return false;
    const touched =
      group.get('q19_fecha_aceptacion')?.touched ||
      group.get('q23_fecha_inicio_estudios')?.touched ||
      group.get('q24_fecha_culminacion_estudios')?.touched;
    return !!group.hasError(errorKey) && !!touched;
  }

  public getError(path: string): string {
    const control = this.form.get(path);
    if (!control?.errors) return '';
    if (control.errors['required']) return this.translate.instant('VALIDATIONS.REQUIRED');
    if (control.errors['minlength']) {
      return this.translate.instant('VALIDATIONS.MIN_LENGTH', { requiredLength: control.errors['minlength'].requiredLength });
    }
    if (control.errors['maxlength']) {
      return this.translate.instant('VALIDATIONS.MAX_LENGTH', { requiredLength: control.errors['maxlength'].requiredLength });
    }
    return this.translate.instant('VALIDATIONS.INVALID_FIELD');
  }

  public onlyDigits(event: Event, path: string, maxLength = 12): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, maxLength);
    input.value = value;
    this.form.get(path)?.setValue(value);
  }

  public normalizeText(path: string): void {
    const control = this.form.get(path);
    if (!control) return;
    control.setValue(String(control.value ?? '').replace(/\s+/g, ' ').trim(), { emitEvent: false });
    control.updateValueAndValidity({ emitEvent: false });
  }

  private solicitudDatesValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const toDate = (val: any): Date | null => {
        if (!val) return null;
        if (val instanceof Date && !isNaN(val.getTime())) return val;
        const d = new Date(String(val));
        return isNaN(d.getTime()) ? null : d;
      };

      const fechaAceptacion = toDate(group.get('q19_fecha_aceptacion')?.value);
      const fechaInicio     = toDate(group.get('q23_fecha_inicio_estudios')?.value);
      const fechaFin        = toDate(group.get('q24_fecha_culminacion_estudios')?.value);
      const errors: Record<string, boolean> = {};

      if (fechaAceptacion && fechaInicio && fechaAceptacion > fechaInicio) errors['acceptanceAfterStart'] = true;
      if (fechaInicio && fechaFin && fechaFin < fechaInicio) errors['endBeforeStart'] = true;

      return Object.keys(errors).length ? errors : null;
    };
  }
}
