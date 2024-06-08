import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BattleshipGameComponent} from "./game/battleship-game/battleship-game.component";
import {ShipStatComponent} from "./game/ship-stat/ship-stat.component";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import { FinishGameDialogComponent } from './game/battleship-game/finish-game-dialog/finish-game-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import { LoginRegisterDialogComponent } from './login-register-dialog/login-register-dialog.component';
import {MatInputModule} from "@angular/material/input";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from "@angular/common/http";


@NgModule({
  declarations: [
    AppComponent,
    BattleshipGameComponent,
    ShipStatComponent,
    FinishGameDialogComponent,
    LoginRegisterDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
