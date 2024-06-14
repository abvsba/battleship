import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BattleshipGameComponent} from "./game/battleship-game/battleship-game.component";
import {ProfileComponent} from "./user/profile/profile.component";
import {AuthGuard} from "../service/authGuardService";
import {UsersRankingComponent} from "./user/users-ranking/users-ranking.component";

const routes: Routes = [
  { path: 'game', component: BattleshipGameComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: 'ranking', component: UsersRankingComponent},
  { path: '**', redirectTo : '' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
