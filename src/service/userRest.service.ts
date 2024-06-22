import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, first, Observable, tap} from 'rxjs';

import {User} from "../shared/models/user.model";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Router} from "@angular/router";
import {GameDetails} from "../shared/models/gameDetails.model";
import {ErrorService} from "./error.service";

@Injectable({
  providedIn: 'root',
})
export class UserRestService {
  private BASE_URL = 'http://localhost:3000/users';
  private user: User | undefined;

  constructor(private http: HttpClient, private router: Router, private errorService: ErrorService) {
  }

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
        catchError(error => this.errorService.handleError(error))
      );
  }

  patchPassword(oldPassword: string, newPassword: string) {
    return this.http.patch(this.BASE_URL + '/' + this.user?.id + '/password',
      {oldPassword: oldPassword, newPassword: newPassword})
      .pipe(catchError(error => this.errorService.handleError(error)));
  }

  register(user: User): Observable<any> {
    return this.http.post<User>(this.BASE_URL + '/signup', user)
      .pipe(catchError(error => this.errorService.handleError(error)));
  }

  getUsername(username: string) : Observable<string> {
    return this.http.get<string>(this.BASE_URL + '/' + username + '/username')
  }

  getEmail(email: string) : Observable<string> {
    return this.http.get<string>(this.BASE_URL + '/' + email + '/email')
  }

  deleteUser(userid: number) {
    return this.http.delete(this.BASE_URL + '/' + userid)
      .pipe(catchError(error => this.errorService.handleError(error)));
  }


  saveGameDetail(gameDetails: GameDetails) {
    return this.http.post(this.BASE_URL + '/' + this.user?.id + '/histories', gameDetails)
      .pipe(catchError(error => this.errorService.handleError(error)));

  }

  getGameUserHistory() {
    return this.http.get<GameDetails[]>(this.BASE_URL + '/' + this.user?.id + '/histories')
      .pipe(catchError(error => this.errorService.handleError(error)));
  }

  getGameHistory() {
    return this.http.get<GameDetails[]>(this.BASE_URL + '/histories')
      .pipe(catchError(error => this.errorService.handleError(error)));
  }

  getToken(): string | undefined {
    return this.user?.token;
  }

  getUser(): User {
    return this.user!;
  }

  logout() {
    this.user = undefined;
    this.router.navigate(['/home']).then();
  }

  isAuthenticated(): boolean {
    return this.user != null && !(new JwtHelperService().isTokenExpired(this.user.token));
  }
}
