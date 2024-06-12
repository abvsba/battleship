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
    this.board[cell.row][cell.col] = new Cell(cell.row, cell.col, undefined, cell.hit);
  }

  checkProbability(row: number, col: number) {
    if (row < 0 || col < 0 ||
      col >= this.numberCol ||	row >= this.numberRow) {
      return 1;
    }

    let cell = this.getCell(row, col);
    if(cell.isMiss() || cell.isBoom()) {
      return 1;
    } else
      return 0;
  }

}


