import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/request.manager';

@Injectable({ providedIn: 'root' })
export class GestorDocumentalService {
  private readonly client = this.requestManager.client('GESTOR_DOCUMENTAL_MID_SERVICE');

  constructor(private readonly requestManager: RequestManager) {}

  get(endpoint: string) {
    return this.client.get(endpoint);
  }
}
