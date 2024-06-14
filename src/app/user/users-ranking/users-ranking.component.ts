import { Component } from '@angular/core';
import {GameDetails} from "../../../shared/models/gameDetails.model";
import {UserRestService} from "../../../service/userRest.service";

@Component({
  selector: 'app-users-ranking',
  templateUrl: './users-ranking.component.html',
  styleUrls: ['./users-ranking.component.css']
})
export class UsersRankingComponent {

  displayedColumns: string[] = ['Username', 'Date', 'Total hits', 'Time consumed', 'Result', 'Punctuation'];
  dataSource! : GameDetails[];

  constructor(private auth : UserRestService) {
    this.auth.getGameHistory().subscribe((data: GameDetails[]) => {
      this.dataSource = data;
    });
  }

  getGameHistotyByUser() {
    this.auth.getGameUserHistory().subscribe((data: GameDetails[]) => {
      this.dataSource = data;
    });
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
}
