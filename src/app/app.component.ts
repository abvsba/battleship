import { Component } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginRegisterDialogComponent} from "./login-register-dialog/login-register-dialog.component";
import {UserRestService} from "./service/userRest.service";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'BattleShip';

  constructor(private dialog: MatDialog, private auth : UserRestService) {
  }

  login(): void {
    this.dialog.open(LoginRegisterDialogComponent);
  }

  logout(): void {
    this.auth.logout();
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

}


