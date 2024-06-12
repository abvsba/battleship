import {inject, Injectable} from '@angular/core';
import {UserRestService} from "./userRest.service";
import {CanActivateFn, Router} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {

  constructor(private auth: UserRestService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/']).then();
      return false;
    }
  }
}

export const AuthGuard: CanActivateFn = (): boolean => {
  return inject(AuthGuardService).canActivate();
}
