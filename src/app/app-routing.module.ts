import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BattleshipGameComponent} from "./game/battleship-game/battleship-game.component";
import {ProfileComponent} from "./user/profile/profile.component";
import {AuthGuard} from "./service/authGuardService";

const routes: Routes = [
  { path: 'game', component: BattleshipGameComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo : '' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
