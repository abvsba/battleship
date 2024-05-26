import {Cell} from "./cell.model";

export class Board {
  cell : Cell[][];
  constructor() {
    this.cell = this.initBoard();
  }

  initBoard() : Cell[][] {
    const numberRow = 10;
    const numberCol = 10;
    const board: Cell[][] = [];

    for (let i = 0; i < numberRow; i++) {
      board.push([]);
      for (let j = 0; j < numberCol; j++) {
        board[i].push(new Cell(i, j))
      }
    }
    return board;
  }
}


