import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/request.manager';

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private readonly client = this.requestManager.client('COMISIONES_MID_SERVICE');

  constructor(private readonly requestManager: RequestManager) {}

  get(endpoint: string) {
    return this.client.get(endpoint);
  }

  post(endpoint: string, element: any) {
    return this.client.post(endpoint, element);
  }

  put(endpoint: string, element: any) {
    return this.client.put(endpoint, element);
  }

  delete(endpoint: string) {
    return this.client.delete(endpoint);
  }
}
