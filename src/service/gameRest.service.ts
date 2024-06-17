import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable} from "rxjs";
import {Game} from "../shared/models/game.model";
import {Ship} from "../shared/models/ship.model";
import {UserRestService} from "./userRest.service";
import {ErrorService} from "./error.service";

@Injectable({
  providedIn: 'root',
})
export class GameRestService {
  private baseurl = 'http://localhost:3000/users';

  userId : number | undefined = undefined;

  constructor(private http: HttpClient, private auth : UserRestService, private errorService : ErrorService) {
    this.userId = this.auth.getUser().id;
  }

  saveGame(game : Game) {
    return this.http.post<Ship[]>(this.baseurl + '/' + this.userId + '/games/save', { game : game })
      .pipe(catchError(error => this.errorService.handleError(error)));
  }

  fetchAllGamesByUserId() {
    return this.http.get<Game[]>(this.baseurl + '/' + this.userId + '/games')
      .pipe(catchError(error => this.errorService.handleError(error)));
  }

  restartGame(gameId : number): Observable<any> {
    return this.http.get(this.baseurl + '/' + this.userId + '/games/' + gameId)
      .pipe(catchError(error => this.errorService.handleError(error)));
  }

  deleteGameById(gameId : number) {
    return this.http.delete(this.baseurl + '/' + this.userId + '/games/' + gameId)
      .pipe(catchError(error => this.errorService.handleError(error)));
  }
}
