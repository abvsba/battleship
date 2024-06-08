import { Component } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginRegisterDialogComponent} from "./login-register-dialog/login-register-dialog.component";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'BattleShip';

  constructor(private dialog: MatDialog) {
  }

  login(): void {
    this.dialog.open(LoginRegisterDialogComponent);
  }
}


