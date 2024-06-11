import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BattleshipGameComponent} from "./game/battleship-game/battleship-game.component";
import {ProfileComponent} from "./profile/profile.component";

const routes: Routes = [
  { path: 'game', component: BattleshipGameComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo : '' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
