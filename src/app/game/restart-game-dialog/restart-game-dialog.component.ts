import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Observable} from "rxjs";
import {Game} from "../../../shared/models/game.model";
import {User} from "../../../shared/models/user.model";
import {GameRestService} from "../../../service/gameRest.service";
import {MatDialog} from "@angular/material/dialog";
import {UserRestService} from "../../../service/userRest.service";

@Component({
  selector: 'app-restart-game-dialog',
  templateUrl: './restart-game-dialog.component.html',
  styleUrls: ['./restart-game-dialog.component.css']
})
export class RestartGameDialogComponent implements OnInit{

  games$!: Observable<Game[]>;
  user! : User;
  selectedGameId: number | null = null;

  @Output() restart = new EventEmitter<any>();

  constructor(private restService: GameRestService,
              private dialog: MatDialog,
              private auth : UserRestService) {
  }

  ngOnInit(): void {
    this.user = this.auth.getUser()
    this.games$ = this.fetchAllGamesByUserId(this.user.id);
  }

  fetchAllGamesByUserId(userId : number): Observable<Game[]> {
    return this.restService.fetchAllGamesByUserId(userId);
  }

  restartGame() {
    this.restService.restartGame(this.user.id, this.selectedGameId!)
      .subscribe( (data : any) => {
        this.restart.emit(data);
        this.dialog.closeAll();
      });
  }

  deleteGame(gameId : number) {
    this.restService.deleteGameById(gameId)
      .subscribe( () => {
        this.games$ = this.fetchAllGamesByUserId(this.user.id);
      });
  }

  isInvalid() {
    return this.selectedGameId === null;
  }

}
