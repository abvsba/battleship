import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, EMPTY, first, Observable, tap, throwError} from 'rxjs';

import {User} from "../shared/models/user.model";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {GameDetails} from "../shared/models/gameDetails.model";

@Injectable({
  providedIn: 'root',
})
export class UserRestService {
  static NOT_FOUND = 404;
  static CONNECTION_REFUSE = 401;

  private BASE_URL = 'http://localhost:3000/users';
  private user : User | undefined;

  private errorNotification = '';
  private showErrors: boolean = true;

  constructor(private http: HttpClient, private router : Router, private snackBar: MatSnackBar) {}

  login(username: string, password: string): Observable<any> {

    return this.http.post<User>(this.BASE_URL + '/login', {username, password})
      .pipe(
        first(),
        tap((jsonToken: any) => {
          const jwtHelper = new JwtHelperService();
          this.user = jsonToken;
          this.user!.id = jwtHelper.decodeToken(jsonToken.token).id;
          this.user!.username = jwtHelper.decodeToken(jsonToken.token).username;
          this.user!.email = jwtHelper.decodeToken(jsonToken.token).email;
        }),
        catchError(error => this.handleError(error))
    );
  }

  patchPassword(oldPassword: string, newPassword : string) {
    return this.http.patch(this.BASE_URL + '/' + this.user!.id + '/password',
      { oldPassword : oldPassword, newPassword : newPassword })
      .pipe(catchError(error => this.handleError(error)));
  }

  register(user : User): Observable<any> {
    return this.http.post<User>(this.BASE_URL + '/signup', user)
      .pipe(catchError(error => this.handleError(error)));
  }

  getUsername(username: string) {
    return this.http.get(this.BASE_URL + '/' + username + '/username');
  }

  getEmail(email: string) {
    return this.http.get(this.BASE_URL + '/' + email + '/email');
  }

  logout() {
    this.user = undefined;
    this.router.navigate(['']).then();
  }

  deleteUser(userid : number) {
    return this.http.delete(this.BASE_URL + '/' + userid)
      .pipe(catchError(error => this.handleError(error)));
  }


  saveGameDetail(gameDetails : GameDetails) {
    return this.http.post(this.BASE_URL + '/' + this.user!.id + '/histories', gameDetails);
  }

  getGameUserHistory() {
    return this.http.get<GameDetails[]>(this.BASE_URL + '/' + this.user!.id + '/histories');
  }

  getGameHistory() {
    return this.http.get<GameDetails[]>(this.BASE_URL + '/histories');
  }

  getToken(): string | undefined{
    return this.user?.token;
  }

  getUser(): User {
    return this.user!;
  }

  isAuthenticated(): boolean {
    return this.user != null && !(new JwtHelperService().isTokenExpired(this.user.token));
  }

  error(notification: string): UserRestService {
    this.errorNotification = notification;
    return this;
  }

  private showError(notification: string): void {
    if(this.showErrors) {
      if (this.errorNotification) {
        this.snackBar.open(this.errorNotification, 'Error', {duration: 5000});
        this.errorNotification = '';
      } else {
        this.snackBar.open(notification, 'Error', {duration: 5000});
      }
    }
    this.showErrors = true;
  }

  private handleError(response: any): any {
    if (response.status === UserRestService.NOT_FOUND || response.status === UserRestService.CONNECTION_REFUSE) {
      this.showError('Username not exist or incorrect password');
      return EMPTY;
    } else {
      try {
        this.showError('(' + response.status + '): ' + response.error.message);
        return throwError(() => response.error);
      } catch (e) {
        this.showError('Not response');
        return throwError(() => response.error);
      }
    }
  }
}
