import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SqliteService } from './sqlite.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor(
    private storage: Storage,
    private router: Router,
    private sqliteService: SqliteService
  ) {
    this.init();
  }

  async init() {
    await this.storage.create();
    const isLoggedIn = await this.storage.get('isLoggedIn');
    this._isAuthenticated.next(!!isLoggedIn);
  }

  async login(mobileNumber: string, pin: string): Promise<boolean> {
    try {
      // Authenticate using database
      const isValid = await this.sqliteService.authenticateUser(mobileNumber, pin);
      
      if (isValid) {
        await this.storage.set('isLoggedIn', true);
        await this.storage.set('currentUser', mobileNumber);
        this._isAuthenticated.next(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    await this.storage.remove('isLoggedIn');
    await this.storage.remove('currentUser');
    this._isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }

  async getCurrentUser(): Promise<string | null> {
    return await this.storage.get('currentUser');
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated.value;
  }
}
