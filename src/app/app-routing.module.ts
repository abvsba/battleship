import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BattleshipGameComponent} from "./battleship-game/battleship-game.component";

const routes: Routes = [
  { path: 'game', component: BattleshipGameComponent },
  { path: '**', redirectTo : 'game' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
