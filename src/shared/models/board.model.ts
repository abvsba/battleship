import {Cell} from "./cell.model";

export class Board {
  numberRow = 10;
  numberCol = 10;

  board : Cell[][];

  constructor() {
    this.board = this.initBoard();
  }

  initBoard() : Cell[][] {
    this.board = [];

    for (let i = 0; i < this.numberRow; i++) {
      this.board.push([]);
      for (let j = 0; j < this.numberCol; j++) {
        this.board[i].push(new Cell(i, j))
      }
    }
    return this.board;
  }

  getCell(row : number, col: number) {
    return this.board[row][col];
  }

  setCell(cell : Cell) {
    this.board[cell.row][cell.col] = cell;
  }

}


