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

  userRecordsBtn;

  constructor(private auth : UserRestService) {
    this.getRecords();
    this.userRecordsBtn = false;
  }

  getGameHistoryByUser() {
    this.auth.getGameUserHistory().subscribe((data: GameDetails[]) => {
      this.dataSource = data;
    });
    this.userRecordsBtn = true;
  }

  getRecords() {
    this.auth.getGameHistory().subscribe((data: GameDetails[]) => {
      this.dataSource = data;
    });
    this.userRecordsBtn = false;
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
}
