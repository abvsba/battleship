import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private restartGameSubject = new Subject<void>();
  private saveGameSubject = new Subject<void>();

  restartGame$ = this.restartGameSubject.asObservable();
  saveGame$ = this.saveGameSubject.asObservable();

  triggerSaveGame() {
    this.saveGameSubject.next();
  }

  triggerRestartGame() {
    this.restartGameSubject.next();
  }

}
