import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-finish-game-dialog',
  templateUrl: './finish-game-dialog.component.html',
  styleUrls: ['./finish-game-dialog.component.css']
})
export class FinishGameDialogComponent {

  message: string;
  @Output() playAgain = new EventEmitter<any>();

  constructor(@Inject(MAT_DIALOG_DATA) data: string, private dialog: MatDialog,) {
    this.message = data;
  }

  play() {
    this.playAgain.emit();
    this.dialog.closeAll();
  }

}
