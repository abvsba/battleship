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
  @ViewChildren('ship_rival') listShipRival!: QueryList<ElementRef>;
  @ViewChildren('rival_cell') listRivalCell!: QueryList<ElementRef>;

  mapShipSelf = new Map();
  mapShipRival = new Map();

  cellWidth = 40;
  selfBoard = new Board();
  rivalBoard = new Board();

  selectedShip!: Ship;
  selectedDiv!: number;

  selfShipList: Ship[] = initShips();
  rivalShipList: Ship[] = initShips();

  rowList: number[] = Array.from({length: 10}, (_, index) => index);
  colList: number[] = Array.from({length: 10}, (_, index) => index);

  protected readonly Array = Array;

  ngAfterViewInit(): void {
    this.initShips();
    this.positionShipRandomly();
  }

  initShips(): void {
    for (let i = 0; i < this.selfShipList.length; i++) {

      this.rivalShipList[i].isVisible = false;
      this.mapShipRival.set(this.rivalShipList[i], this.listShipRival.get(i)!.nativeElement);

      this.mapShipSelf.set(this.selfShipList[i].type, this.listShipSelf.get(i)!.nativeElement);
    }
  }

  onDragStart(shipView: Ship) {
    this.selectedShip = shipView;
  }

  positionShipRandomly() {
    let ship = 0
    while (ship < this.rivalShipList.length) {
      const randomNumber = Math.floor(Math.random() * 100);
      let cellHTML = this.listRivalCell.get(randomNumber)?.nativeElement;
      let row = cellHTML.getAttribute('data-x');
      let col = cellHTML.getAttribute('data-y');

      const head = new Cell(+row, +col);
      this.selectedShip = this.rivalShipList[ship];
      const shipHTML = this.mapShipRival.get(this.selectedShip);

      if (Math.random() < 0.5) {
        this.selectedShip.isHorizontal = false;
        let dimension = new Coordinate(this.cellWidth, (this.cellWidth * this.selectedShip.length));
        shipHTML.style.width = dimension.getLeftString();
        shipHTML.style.height = dimension.getTopString();
      }
      if (this.setLeftRight(this.rivalBoard, head, shipHTML, cellHTML, this.notShipAround)) {
        ship++;
      }
    }
  }

  notShipAround(app: any, head: Cell) {
    let length = app.selectedShip.length;
    let row = head.row;
    let col = head.col;

    return app.checkAdjacentCells(row, col) && (app.selectedShip.isHorizontal ?
      !app.hasShipAtCell(row, col - 1) && !app.hasShipAtCell(row, col + length) :
      !app.hasShipAtCell(row - 1, col) && !app.hasShipAtCell(row + length, col));
  }

  hasShipAtCell(row: number, col: number) {
    return this.isValidCell(row, col) && this.rivalBoard.cell[row][col].hasShip();
  }

  checkAdjacentCells(row: number, col: number) {
    let isHorizontal = this.selectedShip.isHorizontal;

    for (let i = 0; i < this.selectedShip.length; i++) {
      if (this.hasShipAtCell(row + (isHorizontal ? 1 : i), col + (isHorizontal? i : 1 )) ||
        this.hasShipAtCell(row +  (isHorizontal ? -1 : i), col + (isHorizontal ? i : -1 ))) {
        return false;
      }
    }
    return true;
  }

  onDrop(event: DragEvent, row: number, col: number) {

      const initialCol = col - this.selectedDiv;
      const initialRow = row - this.selectedDiv;

      let head = this.selectedShip.isHorizontal ? this.selfBoard.cell[row][initialCol] : this.selfBoard.cell[initialRow][col];
      let cellHTML = event.target as HTMLElement;
      const shipHTML = this.mapShipSelf.get(this.selectedShip.type);

      this.setLeftRight(this.selfBoard, head, shipHTML, cellHTML, undefined);
    }


  setLeftRight(board: Board, head: Cell, shipHTML: HTMLElement, cellHTML: HTMLElement, callback: Function | undefined) {

    let coordinate = this.shipIsInsideTable(head, cellHTML);
    if (coordinate && (!callback || callback(this, head))) {

      if (!callback) {
        this.selectedShip.oldHead = this.selectedShip.head;
      }

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

