import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {first, Observable, tap} from 'rxjs';

import {User} from "../../shared/models/user.model";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root',
})
export class UserRestService {
  private BASE_URL = 'http://localhost:3000/user';
  private user : User | undefined;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<User> {

    return this.http.post<User>(this.BASE_URL + '/login', {username, password}).pipe(
      first(),
      tap((jsonToken: any) => {
        const jwtHelper = new JwtHelperService();
        this.user = jsonToken;
        this.user!.username = jwtHelper.decodeToken(jsonToken.token).username;
        this.user!.email = jwtHelper.decodeToken(jsonToken.token).email;
      })
    );
  }

  register(user : User): Observable<User> {
    return this.http.post<User>(this.BASE_URL + '/signup', user);
  }

}
