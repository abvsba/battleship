import {Ship} from "./ship.model";

export class Cell {
  row: number;
  col: number;
  ship : Ship | undefined;
  hit : string | undefined;

  constructor(row: number, col: number, ship? : Ship, hit? : string) {
    this.row = row;
    this.col = col;
    this.ship = ship;
    this.hit = hit;
  }

  hasShip() {
    return !!this.ship;
  }

  getRow() {
    return this.row;
  }

  getCol() {
    return this.col;
  }

  isBoom() {
    return this.hit === 'boom';
  }

  isMiss() {
    return this.hit === 'miss';
  }

}


