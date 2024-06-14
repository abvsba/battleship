import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BattleshipGameComponent} from "./game/battleship-game/battleship-game.component";
import {ShipStatComponent} from "./game/ship-stat/ship-stat.component";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import { FinishGameDialogComponent } from './game/finish-game-dialog/finish-game-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import { LoginRegisterDialogComponent } from './user/login-register-dialog/login-register-dialog.component';
import {MatInputModule} from "@angular/material/input";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {UserRestService} from "../service/userRest.service";
import {InterceptorService, SecondInterceptor} from "../service/interceptor.service";
import { ProfileComponent } from './user/profile/profile.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { SaveGameDialogComponent } from './game/save-game-dialog/save-game-dialog.component';
import {RestartGameDialogComponent} from "./game/restart-game-dialog/restart-game-dialog.component";
import {MatMenuModule} from "@angular/material/menu";
import {MatRadioModule} from "@angular/material/radio";
import {MatTableModule} from "@angular/material/table";
import { UsersRankingComponent } from './user/users-ranking/users-ranking.component';


@NgModule({
  declarations: [
    AppComponent,
    BattleshipGameComponent,
    ShipStatComponent,
    FinishGameDialogComponent,
    LoginRegisterDialogComponent,
    ProfileComponent,
    SaveGameDialogComponent,
    RestartGameDialogComponent,
    UsersRankingComponent
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
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatRadioModule,
    MatTableModule
  ],
  providers: [
    UserRestService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SecondInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
