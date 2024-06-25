import {Board} from "./board.model";
import {Cell} from "./cell.model";
import {Ship} from "./ship.model";

export class GameBot {

  patrolBoat: boolean;
  destroyer: boolean;
  submarine: boolean;
  battleship: boolean;
  carrier: boolean;
  probabilities: Map<number, number>;
  private board: Board;
  private highest = 0;
  boardSize = 10;

  constructor(board: Board) {
    this.board = board;

    this.patrolBoat = true;
    this.destroyer = true;
    this.submarine = true;
    this.battleship = true;
    this.carrier = true;
    this.probabilities = new Map<number, number>();

    this.assessMap();
  }

  assessMap() {
    this.highest = 0;
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        let cell = new Cell(i, j);
        let probability = 0;

        if(this.board.checkProbability(i, j) == 0) {
          if (this.patrolBoat) {
            if (this.board.checkProbability(i-1, j) == 0)
              probability++;
            if (this.board.checkProbability(i+1, j) == 0)
              probability++;
            if (this.board.checkProbability(i, j-1) == 0)
              probability++;
            if (this.board.checkProbability(i, j+1) == 0)
              probability++;
          }
          if (this.destroyer) {
            if (this.board.checkProbability(i-2, j) == 0 &&
              this.board.checkProbability(i-1, j) == 0)
              probability++;
            if (this.board.checkProbability(i+2, j) == 0 &&
              this.board.checkProbability(i+1, j) == 0)
              probability++;
            if (this.board.checkProbability(i, j-2) == 0 &&
              this.board.checkProbability(i, j-1) == 0)
              probability++;
            if (this.board.checkProbability(i, j+2) == 0 &&
              this.board.checkProbability(i, j+1) == 0)
              probability++;
          }
          if (this.submarine) {
            if (this.board.checkProbability(i-2, j) == 0 &&
              this.board.checkProbability(i-1, j) == 0)
              probability++;
            if (this.board.checkProbability(i+2, j) == 0 &&
              this.board.checkProbability(i+1, j) == 0)
              probability++;
            if (this.board.checkProbability(i, j-2) == 0 &&
              this.board.checkProbability(i, j-1) == 0)
              probability++;
            if (this.board.checkProbability(i, j+2) == 0 &&
              this.board.checkProbability(i, j+1) == 0)
              probability++;
          }
          if (this.battleship) {
            if (this.board.checkProbability(i-3, j) == 0 &&
              this.board.checkProbability(i-2, j) == 0 &&
              this.board.checkProbability(i-1, j) == 0)
              probability++;
            if (this.board.checkProbability(i+3, j) == 0 &&
              this.board.checkProbability(i+2, j) == 0 &&
              this.board.checkProbability(i+1, j) == 0)
              probability++;
            if (this.board.checkProbability(i, j-3) == 0 &&
              this.board.checkProbability(i, j-2) == 0 &&
              this.board.checkProbability(i, j-1) == 0)
              probability++;
            if (this.board.checkProbability(i, j+3) == 0 &&
              this.board.checkProbability(i, j+2) == 0 &&
              this.board.checkProbability(i, j+1) == 0)
              probability++;
          }
          if (this.carrier) {
            if (this.board.checkProbability(i-4, j) == 0 &&
              this.board.checkProbability(i-3, j) == 0 &&
              this.board.checkProbability(i-2, j) == 0 &&
              this.board.checkProbability(i-1, j) == 0)
              probability++;
            if (this.board.checkProbability(i+4, j) == 0 &&
              this.board.checkProbability(i+3, j) == 0 &&
              this.board.checkProbability(i+2, j) == 0 &&
              this.board.checkProbability(i+1, j) == 0)
              probability++;
            if (this.board.checkProbability(i, j-4) == 0 &&
              this.board.checkProbability(i, j-3) == 0 &&
              this.board.checkProbability(i, j-2) == 0 &&
              this.board.checkProbability(i, j-1) == 0)
              probability++;
            if (this.board.checkProbability(i, j+4) == 0 &&
              this.board.checkProbability(i, j+3) == 0 &&
              this.board.checkProbability(i, j+2) == 0 &&
              this.board.checkProbability(i, j+1) == 0)
              probability++;
          }
        }

        if (this.isEdge(i, j)) {
          probability *= 1.25;
        } else if(this.isCorner(i, j)) {
          probability *= 1.4;
        }

        this.highest = (probability > this.highest) ? probability : this.highest;
        let key = cell.getRow()*10 + cell.getCol();
        this.probabilities.set(key, probability);
      }
    }
  }
  isEdge(i: number, j: number) {
    //Is it along a side but NOT the corner?
    return ((i == 0 ||
        i == this.boardSize - 1 ||
        j == 0 ||
        j == this.boardSize - 1)
      &&
      !(i == 0 && j == 0) ||
      (i == 0 && j == this.boardSize - 1) ||
      (i == this.boardSize - 1 && j == 0) ||
      (i == this.boardSize - 1 && j == this.boardSize - 1));
  }

  isCorner(i: number, j: number) {
    return ((i == 0 && j == 0) ||
      (i == 0 && j == this.boardSize - 1) ||
      (i == this.boardSize - 1 && j == 0) ||
      (i == this.boardSize - 1 && j == this.boardSize - 1));
  }

  getHighestCellToFire() {
    let list: Cell[] = [];

    for (let x = 0; x < this.boardSize; x++) {
      for (let y = 0; y < this.boardSize; y++) {
        let c = new Cell(x, y);
        let key = c.getRow()*10 + c.getCol();

        let probability = this.probabilities.get(key)!;

        if (probability >= this.highest)
          list.push(c);
      }
    }

    if (list.length == 1)
      return this.board.getCell(list.at(0)!.getRow(), list.at(0)!.getCol());
    else {
      let row = list.at(Math.floor(Math.random()*list.length))!.getRow();
      let col = list.at(Math.floor(Math.random()*list.length))!.getCol();
      return this.board.getCell(row, col);
    }
  }

  cellToFire(row: number, col: number) {
    return this.board.getCell(row, col);
  }

}
