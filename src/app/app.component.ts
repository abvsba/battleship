import { Component } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginRegisterDialogComponent} from "./user/login-register-dialog/login-register-dialog.component";
import {UserRestService} from "../service/userRest.service";
import {EventService} from "../service/eventService";
import {Router} from "@angular/router";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'BattleShip';

  constructor(private dialog: MatDialog,
              private events : EventService,
              private auth : UserRestService,
              private router: Router) {
  }

  isGameRouteActive(): boolean {
    return this.router.url === '/game';
  }

  login(): void {
    this.dialog.open(LoginRegisterDialogComponent);
  }

  logout(): void {
    this.auth.logout();
  }

  saveGame() {
    this.events.triggerSaveGame();
  }

  restartGame() {
    this.events.triggerRestartGame();
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

}


