import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor(
    private storage: Storage
  ) {
    this.init();
  }

  async init() {
    await this.storage.create();
    // Auto-authenticate - no login required
    await this.storage.set('isLoggedIn', true);
    this._isAuthenticated.next(true);
  }


  isAuthenticated(): boolean {
    return this._isAuthenticated.value;
  }
}
