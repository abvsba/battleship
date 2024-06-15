import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {BattleshipGameComponent} from "./game/battleship-game/battleship-game.component";
import {ProfileComponent} from "./user/profile/profile.component";
import {AuthGuard} from "../service/authGuardService";
import {UsersRankingComponent} from "./user/users-ranking/users-ranking.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  { path: 'game', component: BattleshipGameComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: 'ranking', component: UsersRankingComponent},
  { path: 'home', component: HomeComponent},
  { path: '**', redirectTo : 'home' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
