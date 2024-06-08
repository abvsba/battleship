import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';

import {User} from "../../shared/models/user.model";

@Injectable({
  providedIn: 'root',
})
export class UserRestService {
  private BASE_URL = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}


  register(user : User): Observable<User> {
    return this.http.post<User>(this.BASE_URL + '/signup', user);
  }

}
