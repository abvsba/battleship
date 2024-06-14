import {AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Ship} from "../../../shared/models/ship.model";
import {Board} from "../../../shared/models/board.model";
import {Cell} from "../../../shared/models/cell.model";
import {Coordinate} from "../../../shared/models/coordinate.model";
import {GameBot} from "../../../shared/models/game-bot.model";
import {MatDialog} from "@angular/material/dialog";
import {FinishGameDialogComponent} from "../finish-game-dialog/finish-game-dialog.component";
import {SaveGameDialogComponent} from "../save-game-dialog/save-game-dialog.component";
import {EventService} from "../../../service/eventService";
import {RestartGameDialogComponent} from "../restart-game-dialog/restart-game-dialog.component";
import {Subject, takeUntil} from "rxjs";
import {UserRestService} from "../../../service/userRest.service";
import {GameDetails} from "../../../shared/models/gameDetails.model";

@Component({
  selector: 'app-battleship-game',
  templateUrl: './battleship-game.component.html',
  styleUrls: ['./battleship-game.component.css']
})
export class BattleshipGameComponent implements AfterViewInit, OnDestroy {
  audioMissPath = '../../../assets/sounds/medium-explosion-40472.mp3';
  audioHitPath = '../../../assets/sounds/blast-37988.mp3';

  @ViewChildren('ship_self') listShipSelf!: QueryList<ElementRef>;
  @ViewChildren('ship_rival') listShipRival!: QueryList<ElementRef>;
  @ViewChildren('self_cell') listSelfCell!: QueryList<ElementRef>;
  @ViewChildren('rival_cell') listRivalCell!: QueryList<ElementRef>;

  audioMissileMissed = new Audio(this.audioMissPath);
  audioMissileHit = new Audio(this.audioHitPath)

  private destroyed = new Subject<void>();

  gameTimePid: any;
  gameTime = 0;

  mapShipStatRival: Map<string, HTMLElement> = new Map();
  mapShipStatSelf: Map<string, HTMLElement> = new Map();

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
  disableTableInteraction = true;

  turn = 0;
  bot = new GameBot(this.selfBoard);
  fireDirection = 0;
  previousShots: Cell[] = [];

  totalPlayerHits = 0;
  totalMissileLaunch = 0;
  gameFinish = false;
  gameRestarted = false;

  listNum: string[] = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  listNumRival: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', ''];
  listChar: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  rowList: number[] = Array.from({length: 10}, (_, index) => index);
  colList: number[] = Array.from({length: 10}, (_, index) => index);

  protected readonly Array = Array;

  constructor(private event : EventService, private dialog: MatDialog, private auth : UserRestService) {
    this.event.saveGame$
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.openSaveGame();
    });

    this.event.restartGame$
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.openRestartGame();
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

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
    if (this.disableTableInteraction) {
      this.selectedShip = shipView;
    }
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
    if (this.disableTableInteraction) {
      this.selectedDiv = selectedDiv;
    }
  }


  onDragOver(event: DragEvent) {
    if (this.disableTableInteraction) {
      event.preventDefault();
    }
  }

  onClickCell(event: Event, row: number, col: number) {
    const cell = this.rivalBoard.getCell(row, col);
    let ship = cell.ship!;
    this.totalMissileLaunch++;

    if (!this.gameFinish && this.checkValidCellToClick(cell, ship)) {
      if (cell.hasShip()) {
        ship.hit = ++ship.hit;
        cell.hit = 'boom';
        this.totalPlayerHits++;
        this.audioMissileHit.load();
        this.audioMissileHit.play().then(r => {});
        if (ship.length === ship.hit) {
          this.showShipWhenAllHit(ship);
          if (this.checkWin(this.totalPlayerHits)) {
            this.showFinalMessage('You win');
          }
        }
      } else {
        cell.hit = 'miss';
        this.audioMissileMissed.load();
        this.audioMissileMissed.play().then(r => {});
      }

      this.turn = 1;

      if (!this.gameFinish) {
        this.botTurn();
      }
    }
  }

  checkValidCellToClick(cell: Cell, ship: Ship) {
      if (ship === undefined) {
        return cell.hit === undefined;
      } else {
        return cell.hit === undefined && ship.length !== ship.hit;
      }
  }

  checkWin(hits: number) {
    return hits === 17;
  }

  showFinalMessage(message: string) {
    this.gameFinish = true;
    clearInterval(this.gameTimePid);
    this.dialog.open(FinishGameDialogComponent, {data:  message});
    let result = message === 'You win' ? 'win' : 'lose';

    if (!this.gameRestarted) {
      this.saveGameDetails(result);
    }
  }

  saveGameDetails(result : string) {
    const gameDetails : GameDetails = {
      username: this.auth.getUser().username,
      totalHits: this.totalMissileLaunch,
      result : result,
      timeConsumed : this.gameTime,
      date: undefined
    };
    this.auth.saveGameDetail(gameDetails).subscribe();
  }

  botTurn() {
    let validShot = 0;
    let cell;
    if (this.previousShots.length == 0) {
      do {
        cell = this.bot.getHighestCellToFire();
        validShot = this.validShot(cell);
      } while (validShot == 0);
    } else if (this.previousShots.length == 1) {
      let lastShotCell = this.previousShots.at(0)!;
      do {
        let direction = Math.floor(Math.random() * 4);

        switch (direction) {
          case 0:
            if (this.isValidCell(lastShotCell.getRow() - 1, lastShotCell.getCol())) {
              cell = this.bot.cellToFire(lastShotCell.getRow() - 1, lastShotCell.getCol());
              validShot = this.validShot(cell);
            }
            break;
          case 1:
            if (this.isValidCell(lastShotCell.getRow(), lastShotCell.getCol() - 1)) {
              cell = this.bot.cellToFire(lastShotCell.getRow(), lastShotCell.getCol() - 1);
              validShot = this.validShot(cell);
            }
            break;
          case 2:
            if (this.isValidCell(lastShotCell.getRow() + 1, lastShotCell.getCol())) {
              cell = this.bot.cellToFire(lastShotCell.getRow() + 1, lastShotCell.getCol());
              validShot = this.validShot(cell);
            }
            break;
          case 3:
            if (this.isValidCell(lastShotCell.getRow(), lastShotCell.getCol() + 1)) {
              cell = this.bot.cellToFire(lastShotCell.getRow(), lastShotCell.getCol() + 1);
              validShot = this.validShot(cell);
            }
            break;
        }
        if (validShot == 1) {
          this.fireDirection = direction;
          if (cell!.ship!.length === cell!.ship!.hit) {
            this.bot.sunkShip(cell!.ship!);
            cell!.ship!.isVisible = true;
            this.mapShipStatSelf.get(cell!.ship!.type)!.style.backgroundColor = 'red';
            if (this.bot.checkBotWin()) {
              this.showFinalMessage('You lose');
            } else {
              this.previousShots = [];
            }
          }
        }
      } while (validShot == 0);
    } else {
      let count = 0;
      do {
        let lastShotCell = this.previousShots.at(this.previousShots.length - 1)!;
        let direction = this.fireDirection;
        validShot = 0;

        switch (direction) {
          case 0:
            if (this.isValidCell(lastShotCell.getRow() - 1, lastShotCell.getCol())) {
              cell = this.bot.cellToFire(lastShotCell.getRow() - 1, lastShotCell.getCol());
              validShot = this.validShot(cell);
            }
            if (validShot == 0 || validShot == 2) {
              this.fireDirection = 2;
            }
            break;
          case 1:
            if (this.isValidCell(lastShotCell.getRow(), lastShotCell.getCol() - 1)) {
              cell = this.bot.cellToFire(lastShotCell.getRow(), lastShotCell.getCol() - 1);
              validShot = this.validShot(cell);
            }
            if (validShot == 0 || validShot == 2) {
              this.fireDirection = 3;
            }
            break;
          case 2:
            if (this.isValidCell(lastShotCell.getRow() + 1, lastShotCell.getCol())) {
              cell = this.bot.cellToFire(lastShotCell.getRow() + 1, lastShotCell.getCol());
              validShot = this.validShot(cell);
            }
            if (validShot == 0 || validShot == 2) {
              this.fireDirection = 0;
            }
            break;
          case 3:
            if (this.isValidCell(lastShotCell.getRow(), lastShotCell.getCol() + 1)) {
              cell = this.bot.cellToFire(lastShotCell.getRow(), lastShotCell.getCol() + 1);
              validShot = this.validShot(cell);
            }
            if (validShot == 0 || validShot == 2) {
              this.fireDirection = 1;
            }
            break;
        }
        if (validShot == 1 && (cell!.ship!.length === cell!.ship!.hit)) {
          this.bot.sunkShip(cell!.ship!);
          cell!.ship!.isVisible = true;
          this.mapShipStatSelf.get(cell!.ship!.type)!.style.backgroundColor = 'red';
          if (this.bot.checkBotWin()) {
            this.showFinalMessage('You lose');
          } else {
            this.previousShots.forEach((c, index) => {
              if (c.ship?.type === cell!.ship!.type) {
                this.previousShots.splice(index);
              }
            });
          }
        } else if ((validShot == 0 || validShot == 2) && count < 2) {
          this.previousShots = this.previousShots.reverse();
          count++;
        }
        if (count >= 2) {
          this.fireDirection = Math.floor(Math.random() * 4);
          count = 0;
        }
      } while (validShot == 0);
    }

    this.bot.assessMap();
    this.turn = 0;
  }

  // changeDirectionWhenHitMiss(fireDirection : number, validShot: number) {
  //   if (validShot == 0 || validShot == 2) {
  //     this.fireDirection = fireDirection;
  //   }
  // }
  //
  // prueba(lastShotCell : Cell, direction : number) {
  //   const directionRowValues = [-1, 0, 1, 0];
  //   const directionColValues = [0, -1, 0, 1];
  //
  //   let directionRow = directionRowValues[direction];
  //   let directionCol = directionColValues[direction];
  //
  //   if (this.isValidCell(lastShotCell.getRow() + directionRow, lastShotCell.getCol() + directionCol)) {
  //     let cell = this.bot.cellToFire(lastShotCell.getRow() + directionRow, lastShotCell.getCol() + directionCol);
  //     return this.validShot(cell);
  //   }
  // }

  validShot(cell: Cell) {
    if (this.isValidCell(cell.getRow(), cell.getCol())) {
      let ship = cell.ship!;
      if (cell.hit === undefined) {
        if (cell.hasShip()) {
          ship.hit = ++ship.hit;
          cell.hit = 'boom';
          this.previousShots.push(cell);
          return 1;
        } else {
          cell.hit = 'miss';
          return 2;
        }
      } else {
        return 0;
      }
    }
    return 0;
  }

  onClickShip(ship: Ship) {
    if (this.disableTableInteraction) {
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
  }


  onDropOnTopOfShip(event: DragEvent) {
    if (this.disableTableInteraction) {
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
  }


  positionShipRandomly() {
    let ship = 0;
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

  checkAllShipsArePositioned() {
    for (let ship of this.selfShipList) {
      if (!ship.head) {
        return false;
      }
    }
    return true;
  }

  startGame() {
    this.disableTableInteraction = false;

    this.gameTime = 0;
    this.gameTimePid = window.setInterval(() => {
      this.gameTime += 1;
    }, 1000);

    this.turn = 0;
    this.previousShots = [];
    this.totalPlayerHits = 0;
    this.gameFinish = false;
  }

  showShipWhenAllHit(ship: Ship) {
    this.mapShipStatRival.get(ship.type)!.style.backgroundColor = 'red';
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


  openSaveGame() {
    this.dialog.open(SaveGameDialogComponent,{
      data: {
        totalPlayerHits : this.totalPlayerHits,
        fireDirection : this.fireDirection,
        previousShots : this.previousShots,
        selfShip: this.selfShipList,
        rivalShip : this.rivalShipList,
        selfBoard : this.selfBoard,
        rivalBoard : this.rivalBoard
      },
    });
  }

  openRestartGame() {
    const dialogRef = this.dialog.open(RestartGameDialogComponent);

    dialogRef.componentInstance.restart.subscribe((data) => {

      this.disableTableInteraction = false;
      this.selfBoard = new Board();
      this.rivalBoard = new Board();

      for (let cell of data.selfBoard) {
        this.selfBoard.setCell(cell);
      }
      for (let cell of data.rivalBoard) {
        this.rivalBoard.setCell(cell);
      }

      this.fireDirection = data.gameData[0].fireDirection;
      this.previousShots = data.previousShots;
      this.totalPlayerHits = data.gameData[0].totalHits;

      this.bot = new GameBot(this.selfBoard);
      this.restartGame(data.ships);
    });
  }

  restartGame(tables: Ship[][]) {
    this.gameFinish = false;
    this.gameRestarted = true;
    this.gameTime = 0;
    clearInterval(this.gameTimePid);

    let board = this.selfBoard;
    let map = this.mapShipSelf;
    let cells = this.listSelfCell;
    let shipList = this.selfShipList;
    let tableNumber = 0;

    for (let table of tables) {
      for (let ship of table) {
        this.selectedShip = shipList.find(selfShip => selfShip.type === ship.type)!;
        Object.assign(this.selectedShip, ship);

        const shipHTML = map.get(ship.type);
        const cellHTML = cells.get(ship.head!.row * 10 + ship.head!.col)?.nativeElement;

        let dimension = new Coordinate(this.cellWidth, (this.cellWidth * this.selectedShip.length));
        if (!ship.isHorizontal) {
          this.setWidthAndHeight(dimension, shipHTML);
        }
        else{
          shipHTML.style.width = dimension.getTopString();
          shipHTML.style.height = dimension.getLeftString();
        }

        let coordinate = this.getCoordinate(cellHTML, 0);
        this.setTopAndLeft(coordinate, shipHTML);
        cellHTML.appendChild(shipHTML);
        this.emptyOrFillCellsWithShips(board, undefined, ship.head!);
        this.selectedShip.oldHead = ship.head!;
        if (tableNumber === 0) {
          if (ship.hit === ship.length) {
            this.mapShipStatSelf.get(ship.type)!.style.backgroundColor = 'red';
            this.bot.sunkShip(ship);
          } else {
            this.mapShipStatSelf.get(ship.type)!.style.backgroundColor = 'rgba(100, 149, 237, 0.35)';
          }
        } else if (ship.hit === ship.length) {
          this.mapShipStatRival.get(ship.type)!.style.backgroundColor = 'red';
        } else {
          this.mapShipStatRival.get(ship.type)!.style.backgroundColor = 'rgba(100, 149, 237, 0.35)';
        }
      }
      board = this.rivalBoard;
      map = this.mapShipRival;
      cells = this.listRivalCell;
      shipList = this.rivalShipList;
      tableNumber++;
    }
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

