import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SnackbarType = 'success' | 'warning' | 'danger' | 'info';

export interface SnackbarState {
  message: string | null;
  type: SnackbarType;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private stateSubject = new BehaviorSubject<SnackbarState>({
    message: null,
    type: 'info',
    visible: false
  });

  readonly state$ = this.stateSubject.asObservable();
  private timeoutId: any;

  show(message: string, type: SnackbarType = 'info', durationMs: number = 3000) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.stateSubject.next({
      message,
      type,
      visible: true
    });

    this.timeoutId = setTimeout(() => {
      this.hide();
    }, durationMs);
  }

  hide() {
    this.stateSubject.next({
      ...this.stateSubject.value,
      visible: false,
      message: null
    });
    this.timeoutId = null;
  }
}

