import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {Game} from "../../shared/models/game.model";
import {Ship} from "../../shared/models/ship.model";

@Injectable({
  providedIn: 'root',
})
export class GameRestService {
  private baseurl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  saveGame(game : Game, userId : number): Observable<Ship[]> {
    return this.http.post<Ship[]>(this.baseurl + '/' + userId + '/games/save', { game : game });
  }



}
