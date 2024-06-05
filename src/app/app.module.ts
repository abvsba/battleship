import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BattleshipGameComponent} from "./game/battleship-game/battleship-game.component";
import {ShipStatComponent} from "./game/ship-stat/ship-stat.component";


@NgModule({
  declarations: [
    AppComponent,
    BattleshipGameComponent,
    ShipStatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
