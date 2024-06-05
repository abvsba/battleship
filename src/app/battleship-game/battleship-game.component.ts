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
  @ViewChildren('self_cell') listSelfCell!: QueryList<ElementRef>;
  @ViewChildren('rival_cell') listRivalCell!: QueryList<ElementRef>;

  mapShipSelf = new Map();
  mapShipRival = new Map();

  cellWidth = 40;
  selfBoard: Board = new Board();
  rivalBoard : Board = new Board();
  selfShipList: Ship[] = initShips();
  rivalShipList: Ship[] = initShips();

  selectedShip!: Ship;
  selectedDiv!: number;

  onDropOnShip = false;

  rowList: number[] = Array.from({length: 10}, (_, index) => index);
  colList: number[] = Array.from({length: 10}, (_, index) => index);

  protected readonly Array = Array;

  ngAfterViewInit(): void {
    this.initShips();
    this.positionShipRandomly();
  }

  initShips(): void {
    for (let i = 0; i < this.selfShipList.length; i++) {

      this.mapShipSelf.set(this.selfShipList[i].type, this.listShipSelf.get(i)!.nativeElement);

      this.rivalShipList[i].isVisible = false;
      this.mapShipRival.set(this.rivalShipList[i].type, this.listShipRival.get(i)!.nativeElement);

    }
  }

  onDragStart(shipView: Ship) {
    this.selectedShip = shipView;
  }


  onDrop(event: DragEvent, row: number, col: number) {

    if (!this.onDropOnShip) {
      const initialCol = col - this.selectedDiv;
      const initialRow = row - this.selectedDiv;

      let head = this.selectedShip.isHorizontal ? this.selfBoard.getCell(row, initialCol) : this.selfBoard.getCell(initialRow, col);
      let cellHTML = event.target as HTMLElement;
      const shipHTML = this.mapShipSelf.get(this.selectedShip.type);

      if (!this.setLeftRight(this.selfBoard, head, shipHTML, cellHTML, undefined)) {
        this.changeShipColorWhenFailPositioning(shipHTML);
      }
    }
    this.onDropOnShip = false;
  }


  onMouseDown(selectedDiv: number) {
    this.selectedDiv = selectedDiv;
  }


  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onClickCell(event: Event, row: number, col: number) {
    const cell = this.rivalBoard.getCell(row, col);
    const ship = cell.ship!;
    let cellHTML = event.target as HTMLElement;

    if (cell.hasShip()) {
      ship.hit = ++ship.hit;
      cell.hit = 'boom';
      if (ship.length === ship.hit) {
        this.showShipWhenAllHit(ship);
      }
    } else {
      cell.hit = 'miss';
    }
    cellHTML.classList.add('disableClick');
  }

  onClickShip(ship: Ship) {
    this.selectedShip = ship;
    let blockHeight = (this.cellWidth * ship.length);
    let dimensionV = new Coordinate(this.cellWidth, blockHeight);
    let dimensionH = new Coordinate(blockHeight, this.cellWidth);
    let isHorizontal = ship.isHorizontal;
    let dimension = isHorizontal ? dimensionV : dimensionH;

    const shipHTML = this.mapShipSelf.get(ship.type);
    if (this.assertShipIsInsideTable(ship.head!, true) &&
      this.assertThereIsNoOverlap(this.selfBoard, ship.head!, false)) {

      this.setWidthAndHeight(dimension, shipHTML);
      ship.isHorizontal = !isHorizontal;
      this.emptyAndFillCellsWithShipsWhenChangeDirection(ship, isHorizontal);
    }
    else {
      this.changeShipColorWhenFailPositioning(shipHTML);
    }
  }


  onDropOnTopOfShip(event: DragEvent) {
    this.onDropOnShip = true;
    let ship = this.selectedShip;
    let div = event.target as HTMLElement;

    if (this.selectedShip.type === (div.parentNode as HTMLElement).id) {

      let dropInDiv = +(div).id;
      const shipHTML = this.mapShipSelf.get(this.selectedShip.type);
      let isHorizontal = this.selectedShip.isHorizontal;

      const row = isHorizontal ? ship.head!.row : ship.head!.row + dropInDiv - this.selectedDiv;
      const col = isHorizontal ? ship.head!.col + dropInDiv - this.selectedDiv : ship.head!.col;

      if (this.assertThereIsNoOverlap(this.selfBoard, new Cell(row, col), true)) {
        ship.oldHead = new Cell(ship.head!.row, ship.head!.col);

        if (isHorizontal) {
          shipHTML.style.left = `${parseInt(shipHTML.style.left) + (dropInDiv - this.selectedDiv) * this.cellWidth}px`;
          ship.head!.col = col;
        } else {
          shipHTML.style.top = `${parseInt(shipHTML.style.top) + (dropInDiv - this.selectedDiv) * this.cellWidth}px`;
          ship.head!.row = row;
        }

        this.emptyOrFillCellsWithShips(this.selfBoard, ship.oldHead, ship.head);
        const cellHTML = this.listSelfCell.get(ship.head!.row * 10 + ship.head!.col)?.nativeElement;
        cellHTML.appendChild(shipHTML);
      }
      else {
        this.changeShipColorWhenFailPositioning(shipHTML);
      }
    }
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
      const shipHTML = this.mapShipRival.get(this.selectedShip.type);

      if (Math.random() < 0.5) {
        this.selectedShip.isHorizontal = false;
        let dimension = new Coordinate(this.cellWidth, (this.cellWidth * this.selectedShip.length));
        this.setWidthAndHeight(dimension, shipHTML);
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
    return this.isValidCell(row, col) && this.rivalBoard.getCell(row, col).hasShip();
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


  showShipWhenAllHit(ship: Ship) {
    for (let i = 0; i < ship.length; i++) {
      if (ship?.isHorizontal) {
        this.rivalBoard.getCell(ship.head!.row, ship.head!.col + i).hit = undefined;
      }
      else {
        this.rivalBoard.getCell(ship.head!.row + i, ship.head!.col).hit = undefined;
      }
    }
    ship.isVisible = true;
  }


  setLeftRight(board: Board, head: Cell, shipHTML: HTMLElement, cellHTML: HTMLElement, notShipAround: Function | undefined) {

    let coordinate = this.shipIsInsideTable(head, cellHTML);
    if (coordinate && this.assertThereIsNoOverlap(board, head, true) && (!notShipAround || notShipAround(this, head))) {

      this.selectedShip.oldHead = this.selectedShip.head;
      this.setTopAndLeft(coordinate, shipHTML);

      this.selectedShip.head = new Cell(head.row, head.col);
      cellHTML.appendChild(shipHTML);

      this.emptyOrFillCellsWithShips(board, this.selectedShip.oldHead, head);
      return true;
    }
    return false;
  }


  assertThereIsNoOverlap(board: Board, head: Cell, isDrop: boolean) {
    let isHorizontal = this.selectedShip.isHorizontal;
    if (!this.selectedDiv) {
      this.selectedDiv = 0;
    }

    let hasShip;
    for (let i = 0; i < this.selectedShip.length; i++) {
      if (isDrop) {
        hasShip = board.getCell(head.row + (isHorizontal ? 0 : i), head.col + (isHorizontal ? i : 0))?.ship;
      } else {
        hasShip = board.getCell(head.row + (isHorizontal ? i : 0), head.col + (isHorizontal ? 0 : i))?.ship;
      }
      if (hasShip && hasShip !== this.selectedShip) {
        return false;
      }
    }
    return true;
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
      board.getCell(head!.row + (isHorizontal ? 0 : i), head!.col + (isHorizontal ? i : 0)).ship = fill ? this.selectedShip : undefined;
    }
  }


  emptyAndFillCellsWithShipsWhenChangeDirection(ship: Ship, isHorizontal: boolean) {
    const initialRow = ship.head!.row;
    const initialCol = ship.head!.col;

    for (let i = 0; i < ship.length; i++) {
      this.selfBoard.getCell(initialRow, initialCol + i).ship = isHorizontal ? undefined : ship;
      this.selfBoard.getCell(initialRow + i, initialCol).ship = isHorizontal ? ship : undefined;
    }
    this.selfBoard.getCell(initialRow, initialCol).ship = ship;
  }


  changeShipColorWhenFailPositioning(shipHTML: HTMLElement) {
    shipHTML.classList.add('borderChange')
    setTimeout(() => {
      shipHTML.classList.remove('borderChange')
    }, 1000);
  }


  setWidthAndHeight(coordinate : Coordinate, shipHTML : HTMLElement) {
    shipHTML.style.width = coordinate.getLeftString();
    shipHTML.style.height = coordinate.getTopString();
  }

  setTopAndLeft(coordinate : Coordinate, shipHTML : HTMLElement) {
    shipHTML.style.left = coordinate.getLeftString();
    shipHTML.style.top = coordinate.getTopString();
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

