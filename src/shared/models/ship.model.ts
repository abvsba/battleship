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
              isVisible : boolean = true, hit : number = 0, oldHead? : Cell, head? : Cell) {
    this.type = type;
    this.length = length;
    this.isHorizontal = isHorizontal;
    this.isVisible = isVisible;
    this.hit = hit;
    this.oldHead = oldHead;
    this.head = head;
  }

}


