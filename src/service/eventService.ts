import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private saveGameSubject = new Subject<void>();
  private restartGameSubject = new Subject<void>();

  saveGame$ = this.saveGameSubject.asObservable();
  restartGame$ = this.restartGameSubject.asObservable();

  triggerSaveGame() {
    this.saveGameSubject.next();
  }

  triggerRestartGame() {
    this.restartGameSubject.next();
  }

}
