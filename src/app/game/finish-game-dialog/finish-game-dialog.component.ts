import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-finish-game-dialog',
  templateUrl: './finish-game-dialog.component.html',
  styleUrls: ['./finish-game-dialog.component.css']
})
export class FinishGameDialogComponent {

  message: string;

  constructor(@Inject(MAT_DIALOG_DATA) data: string) {
    this.message = data;
  }

}
