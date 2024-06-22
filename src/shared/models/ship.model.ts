import {Cell} from "./cell.model";

export class Ship {

  type: string;
  length: number;
  isHorizontal : boolean;
  isVisible : boolean;
  hit : number;
  oldHead?: Cell;
  head? : Cell;


  constructor(type: string, length: number, isHorizontal : boolean = true,
              isVisible : boolean = false, hit : number = 0, oldHead? : Cell, head? : Cell) {
    this.type = type;
    this.length = length;
    this.isHorizontal = isHorizontal;
    this.isVisible = isVisible;
    this.hit = hit;
    this.oldHead = oldHead;
    this.head = head;
  }

  setProperty() {
    this.isHorizontal = true;
    this.isVisible = false;
    this.hit = 0;
    this.oldHead = undefined;
    this.head = undefined
  }

}


