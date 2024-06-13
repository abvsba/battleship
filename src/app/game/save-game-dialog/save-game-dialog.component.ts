import {Component, Inject} from '@angular/core';
import {Cell} from "../../../shared/models/cell.model";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {Board} from "../../../shared/models/board.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UserRestService} from "../../../service/userRest.service";
import {Game} from "../../../shared/models/game.model";
import {GameRestService} from "../../../service/gameRest.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-save-game-dialog',
  templateUrl: './save-game-dialog.component.html',
  styleUrls: ['./save-game-dialog.component.css']
})
export class SaveGameDialogComponent {

  saveForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  selfBoard! : Board;
  rivalBoard! : Board;
  game! : Game;

  constructor(@Inject(MAT_DIALOG_DATA) data: any,
              private restService: GameRestService,
              private auth : UserRestService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {

    this.selfBoard = data.selfBoard;
    this.rivalBoard = data.rivalBoard;

    const newBoard = this.selectOnlyHitCell();

    this.game = {
      id: undefined,
      name: undefined,
      totalPlayerHits: data.totalPlayerHits,
      fireDirection : data.fireDirection,
      previousShots : data.previousShots,
      selfShips: data.selfShip,
      rivalShips: data.rivalShip,
      selfBoard: newBoard[0],
      rivalBoard: newBoard[1],
      date: undefined
    };
  }

  saveGame() {
    this.game.name = this.saveForm.value.name!
    this.restService.saveGame(this.game, this.auth.getUser().id).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.snackBar.open('Game saved successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        this.snackBar.open(error.error.message, 'Error', {duration: 3000});
      }
    });
  }

  isInvalid() {
    return this.saveForm.value.name === '';
  }

  selectOnlyHitCell() {
    let newSelfBoard : Cell[] = [];
    let newRivalBoard : Cell[] = [];

    for (let i = 0; i < this.selfBoard.numberRow; i++) {
      for (let j = 0; j < this.selfBoard.numberCol; j++) {

        if (this.selfBoard.getCell(i, j).hit) {
          newSelfBoard.push(this.selfBoard.getCell(i, j));
        }
        if (this.rivalBoard.getCell(i, j).hit) {
          newRivalBoard.push(this.rivalBoard.getCell(i, j));
        }
      }
    }
    return [newSelfBoard, newRivalBoard];
  }
}
