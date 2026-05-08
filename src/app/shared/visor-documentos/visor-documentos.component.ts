import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface VisorDocumentosData {
  nombre: string;
  autor: string;
  estado: string;
  base64?: string;
  mimeType?: string;
  isFR010?: boolean;
  formData?: any;
}

@Component({
  selector: 'app-visor-documentos',
  templateUrl: './visor-documentos.component.html',
  styleUrls: ['./visor-documentos.component.scss'],
  standalone: false,
})
export class VisorDocumentosComponent implements OnInit, OnDestroy {
  pdfUrl?: SafeResourceUrl;
  private objectUrl?: string;

  get isFR010(): boolean { return !!this.data?.isFR010; }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: VisorDocumentosData,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    if (this.isFR010 || !this.data?.base64 || this.data.mimeType !== 'application/pdf') return;
    const blob = this.base64ToBlob(this.data.base64, this.data.mimeType);
    this.objectUrl = URL.createObjectURL(blob);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
  }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mimeType });
  }
}
