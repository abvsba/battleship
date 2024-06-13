import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {GameRestService} from "../../../service/gameRest.service";
import {Observable} from "rxjs";
import {Game} from "../../../shared/models/game.model";
import {MatDialog} from "@angular/material/dialog";
import {UserRestService} from "../../../service/userRest.service";

@Component({
  selector: 'app-restart-game-dialog',
  templateUrl: './restart-game.component.html',
  styleUrls: ['./restart-game.component.css']
})
export class RestartGameComponent implements OnInit{

  games$!: Observable<Game[]>
  selectedGameId: number | null = null;

  @Output() restart = new EventEmitter<any>();
  constructor(private restService: GameRestService, private dialog: MatDialog,
              private auth : UserRestService) {
  }

  ngOnInit(): void {
    this.games$ = this.fetchAll();
  }


  fetchAll(): Observable<Game[]> {
    return this.restService.findAllGames(this.auth.getUser().id);
  }

  restartGame() {
    this.restService.restartGame(this.selectedGameId!, this.auth.getUser().id).subscribe( (data : any) => {
        this.restart.emit(data);
        this.dialog.closeAll();
    });
  }

  isInvalid() {
    return this.selectedGameId === null;
  }

}
