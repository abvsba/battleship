import {AfterViewInit, Component, ElementRef, QueryList, ViewChildren} from '@angular/core';
import {Ship} from "../../shared/models/ship.model";
import {Board} from "../../shared/models/board.model";
import {Cell} from "../../shared/models/cell.model";
import {Coordinate} from "../../shared/models/coordinate.model";

@Component({
  selector: 'app-battleship-game',
  templateUrl: './battleship-game.component.html',
  styleUrls: ['./battleship-game.component.css']
})
export class BattleshipGameComponent implements AfterViewInit{
  @ViewChildren('ship_self') listShipSelf!: QueryList<ElementRef>;

  mapShipSelf = new Map();

  cellWidth = 40;
  selfBoard = new Board();

  selectedShip!: Ship;
  selectedDiv!: number;

  selfShipList: Ship[] = initShips();

  rowList: number[] = Array.from({length: 10}, (_, index) => index);
  colList: number[] = Array.from({length: 10}, (_, index) => index);

  protected readonly Array = Array;

  ngAfterViewInit(): void {
    this.initShips();
  }

  initShips(): void {
    for (let i = 0; i < this.selfShipList.length; i++) {

      this.mapShipSelf.set(this.selfShipList[i].type, this.listShipSelf.get(i)!.nativeElement);
    }
  }

  onDragStart(shipView: Ship) {
    this.selectedShip = shipView;
  }

  onDrop(event: DragEvent, row: number, col: number) {

      const initialCol = col - this.selectedDiv;
      const initialRow = row - this.selectedDiv;

      let head = this.selectedShip.isHorizontal ? this.selfBoard.cell[row][initialCol] : this.selfBoard.cell[initialRow][col];
      let cellHTML = event.target as HTMLElement;
      const shipHTML = this.mapShipSelf.get(this.selectedShip.type);

      this.setLeftRight(this.selfBoard, head, shipHTML, cellHTML);
    }


  setLeftRight(board: Board, head: Cell, shipHTML: HTMLElement, cellHTML: HTMLElement) {

    let coordinate = this.shipIsInsideTable(head, cellHTML);
    if (coordinate) {

      this.selectedShip.oldHead = this.selectedShip.head;
      shipHTML.style.left = coordinate.getLeftString();
      shipHTML.style.top = coordinate.getTopString();

      this.selectedShip.head = new Cell(head.row, head.col);
      cellHTML.appendChild(shipHTML);

      this.emptyOrFillCellsWithShips(board, this.selectedShip.oldHead, head);
      return true;
    }
    return false;
  }


  shipIsInsideTable(head: Cell, cellHTML: HTMLElement) {
    let divWidth = this.selectedDiv * this.cellWidth;
    if (!divWidth) {
      divWidth = 0;
    }

    if (this.assertShipIsInsideTable(head, false)) {
      return this.getCoordinate(cellHTML, divWidth);
    }
    return undefined;
  }


  getCoordinate(cellHTML : HTMLElement, divWidth : number) {
    let divLeft, divTop;
    if (this.selectedShip.isHorizontal) {
      divLeft = cellHTML.offsetLeft - divWidth;
      divTop = cellHTML.offsetTop;
    } else {
      divLeft = cellHTML.offsetLeft;
      divTop = cellHTML.offsetTop - divWidth;
    }
    return new Coordinate(divLeft, divTop);
  }


  assertShipIsInsideTable(head: Cell, isClick: boolean) {
    let tailCol = head.col;
    let tailRow = head.row;

    const lengthAdjustment = this.selectedShip.length - 1;

    if (this.selectedShip.isHorizontal) {
      if (isClick) {
        tailRow += lengthAdjustment;
      } else {
        tailCol += lengthAdjustment;
      }
    } else if (isClick) {
      tailCol += lengthAdjustment;
    } else {
      tailRow += lengthAdjustment;
    }
    return (this.isValidCell(head.row, head.col) && this.isValidCell(tailRow, tailCol));
  }


  isValidCell(row: number, col: number) {
    return row >= 0 && row <= 9 && col >= 0 && col <= 9;
  }

  emptyOrFillCellsWithShips(board: Board, oldHead: Cell | undefined, head: Cell | undefined) {
    if (oldHead) {
      this.emptyOrFillCellsWithShipsAux(board, oldHead, false);
    }
    if (head) {
      this.emptyOrFillCellsWithShipsAux(board, head, true);
    }
  }


  emptyOrFillCellsWithShipsAux(board: Board, head: Cell | undefined, fill: boolean) {
    const isHorizontal = this.selectedShip.isHorizontal;

    for (let i = 0; i < this.selectedShip.length; i++) {
      board.cell[head!.row + (isHorizontal ? 0 : i)][head!.col + (isHorizontal ? i : 0)].ship = fill ? this.selectedShip : undefined;
    }
  }


  onMouseDown(selectedDiv: number) {
    this.selectedDiv = selectedDiv;
  }


  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

}


function initShips(): Ship[] {
  const carrier = new Ship('carrier', 5);
  const battleship = new Ship('battleship', 4);
  const destroyer = new Ship('destroyer', 3);
  const submarine = new Ship('submarine', 3);
  const patrolBoat = new Ship('patrolBoat', 2);

  return [carrier, battleship, destroyer, submarine, patrolBoat];
}

