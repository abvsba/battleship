import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private saveGameSubject = new Subject<void>();

  saveGame$ = this.saveGameSubject.asObservable();

  triggerSaveGame() {
    this.saveGameSubject.next();
  }

}
