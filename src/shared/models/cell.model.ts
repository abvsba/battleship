import {Ship} from "./ship.model";

export class Cell {
  row: number;
  col: number;
  ship : Ship | undefined;

  constructor(row: number, col: number, ship? : Ship) {
    this.row = row;
    this.col = col;
    this.ship = ship;
  }

  hasShip() {
    return !!this.ship;
  }
}


