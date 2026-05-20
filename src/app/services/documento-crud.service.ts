import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/request.manager';

@Injectable({ providedIn: 'root' })
export class DocumentoCrudService {
  private readonly client = this.requestManager.client('DOCUMENTO_CRUD_SERVICE');

  constructor(private readonly requestManager: RequestManager) {}

  get(endpoint: string) {
    return this.client.get(endpoint);
  }
}
