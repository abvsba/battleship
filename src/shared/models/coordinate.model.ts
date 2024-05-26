
export class Coordinate {
  left: number;
  top: number;

  constructor(left: number, top: number) {
    this.left = left;
    this.top = top;
  }

  getTopString() : string {
    return `${this.top}px`
  }

  getLeftString() : string {
    return `${this.left}px`
  }
}
