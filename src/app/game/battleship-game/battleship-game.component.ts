import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren
} from '@angular/core';
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
import {ManualDialogComponent} from "../manual-dialog/manual-dialog.component";
import {SocketService} from "../../../service/socketService";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NavigationStart, Router} from "@angular/router";


@Component({
  selector: 'app-battleship-game',
  templateUrl: './battleship-game.component.html',
  styleUrls: ['./battleship-game.component.css']
})
export class BattleshipGameComponent implements AfterViewInit, OnDestroy{
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

  totalPlayerHits = new Array(2).fill(0);
  totalMissileLaunch = 0;
  gameFinish = false;
  gameRestarted = false;

  enemyConnected = false;
  enemyReady = false;
  bothPlayersReady = false;
  playerTurn = true;
  isMultiplayer = false;
  trigger = false;
  mode = 'Single-player'

  listNum: string[] = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  listNumRival: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', ''];
  listChar: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  rowList: number[] = Array.from({length: 10}, (_, index) => index);
  colList: number[] = Array.from({length: 10}, (_, index) => index);

  protected readonly Array = Array;

  constructor(private event : EventService,
              private dialog: MatDialog,
              private auth : UserRestService,
              private socketService: SocketService,
              private snackBar: MatSnackBar) {

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

    this.audioMissileMissed.volume = 0.15;
    this.audioMissileHit.volume = 0.4;
  }

  ngOnDestroy() {
    if (this.isMultiplayer) {
      this.socketService.disconnectedEmit();
    }
    this.destroyed.next();
    this.destroyed.complete();
  }

  ngAfterViewInit(): void {
    this.initShips();
  }

  initShips(): void {
    for (let i = 0; i < this.selfShipList.length; i++) {

      this.mapShipSelf.set(this.selfShipList[i].type, this.listShipSelf.get(i)!.nativeElement);

      this.rivalShipList[i].isVisible = false;
      this.mapShipRival.set(this.rivalShipList[i].type, this.listShipRival.get(i)!.nativeElement);

    }
  }

  changeGameMode() {
    this.isMultiplayer = !this.isMultiplayer;

    if (this.isMultiplayer) {
      this.socketService.joinGame('default-game');
      this.socketService.onEnemyConnected(() => {
        console.log("enemy connected")
        this.enemyConnected = true;
      });

      this.socketService.enemyReady(() => this.enemyReady = true);

      this.socketService.disconnected(() => {
        this.resetValueWhenDisconnected();
          this.snackBar.open('Enemy disconnected, waiting another enemy', 'Close', {duration: 6000});
      });
    }
    else {
      this.resetValueWhenDisconnected();
      this.snackBar.open('You are disconnected, returning to single-player mode', 'Close', {duration: 6000});
      this.socketService.disconnectedEmit();
    }
    this.mode = this.isMultiplayer ? 'Multiplayer' : 'Single-player';
  }

  resetValueWhenDisconnected() {
    this.enemyConnected = false;
    this.enemyReady = false;
    this.bothPlayersReady = false;
    this.playerTurn = true;
    this.playAgain()
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

      let head = this.selectedShip.isHorizontal ?
        this.selfBoard.getCell(row, initialCol) : this.selfBoard.getCell(initialRow, col);
      let cellHTML = event.target as HTMLElement;
      const shipHTML = this.mapShipSelf.get(this.selectedShip.type);

      if (!this.setLeftRight(this.selfBoard, head, shipHTML, cellHTML, undefined)) {
        this.changeShipColorWhenFailPositioning(shipHTML);
      }
    }
    this.onDropOnShip = false;
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

  onClickCell(row: number, col: number, board : Board, trigger : boolean = true) {
    const cell = board.getCell(row, col);
    let ship = cell.ship!;
    this.totalMissileLaunch++;

    if (!this.gameFinish && this.checkValidCellToClick(cell, ship) &&
      (!this.isMultiplayer || (this.bothPlayersReady && this.playerTurn))) {
      if (this.isMultiplayer && trigger) {
        this.socketService.clickCell(row, col);
        this.playerTurn = !this.playerTurn;
      }

      if (cell.hasShip()) {
        ship.hit = ++ship.hit;
        cell.hit = 'boom';
        this.totalPlayerHits[this.playerTurn ? 0 : 1]++;
        this.audioMissileHit.load();
        this.audioMissileHit.play().then();
        if (ship.length === ship.hit) {
          this.showShipWhenAllHit(ship, board);
          if (this.checkWin(this.totalPlayerHits[this.isMultiplayer ? 1 : 0])) {
            this.showFinalMessage('You win');
          }
          else if (this.checkWin(this.totalPlayerHits[0])) {
            this.showFinalMessage('You lose');
          }
        }
      } else {
        cell.hit = 'miss';
        this.audioMissileMissed.load();
        this.audioMissileMissed.play().then();
      }

      this.turn = 1;

      if (!this.gameFinish && !this.isMultiplayer) {
        this.botTurn();
      }
    }
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


  saveGameDetails(result : string) {
    if (this.auth.getUser()) {
      const gameDetails: GameDetails = {
        username: this.auth.getUser()?.username,
        totalHits: this.totalMissileLaunch,
        result: result,
        timeConsumed: this.gameTime,
        date: undefined
      };
      this.auth.saveGameDetail(gameDetails).subscribe();
    }
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
            this.bot.assessMap();
            cell!.ship!.isVisible = true;
            this.mapShipStatSelf.get(cell!.ship!.type)!.style.backgroundColor = '#EE7674';
            if (this.checkWin(this.totalPlayerHits[1])) {
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
        if (validShot == 1 && (cell?.ship!.length === cell?.ship!.hit)) {
          this.bot.assessMap();
          cell!.ship!.isVisible = true;
          this.mapShipStatSelf.get(cell!.ship!.type)!.style.backgroundColor = '#EE7674';
          if (this.checkWin(this.totalPlayerHits[1])) {
            this.showFinalMessage('You lose');
          } else {
            this.previousShots = this.previousShots.filter((c) => c.ship?.type !== cell!.ship!.type);
          }
        } else if ((validShot == 0 || validShot == 2) && count < 2) {
          this.previousShots.reverse();
          count++;
        }

        if (count >= 2) {
          this.previousShots = shuffle(this.previousShots);
          this.fireDirection = Math.floor(Math.random() * 4);
          count = 0;
        }
      } while (validShot == 0);
    }

    this.bot.assessMap();
    this.turn = 0;
  }


  validShot(cell: Cell) {
    if (this.isValidCell(cell.getRow(), cell.getCol())) {
      let ship = cell.ship!;
      if (cell.hit === undefined) {
        if (cell.hasShip()) {
          ship.hit = ++ship.hit;
          cell.hit = 'boom';
          this.totalPlayerHits[1]++;
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


  positionShipRandomly(shipList : Ship[] = this.rivalShipList) {
    let map, board, cell;
    if (shipList == this.rivalShipList) {
      map = this.mapShipRival;
      board = this.rivalBoard;
      cell = this.listRivalCell
    }
    else {
      map = this.mapShipSelf;
      board = this.selfBoard;
      cell = this.listSelfCell
    }

    let ship = 0;
    this.selectedDiv = 0;

    while (ship < shipList.length) {
      const randomNumber = Math.floor(Math.random() * 100);
      let cellHTML = cell.get(randomNumber)?.nativeElement;
      let row = cellHTML.getAttribute('data-x');
      let col = cellHTML.getAttribute('data-y');

      const head = new Cell(+row, +col);
      this.selectedShip = shipList[ship];
      const shipHTML = map.get(this.selectedShip.type);

      if (Math.random() < 0.25) {
        this.selectedShip.isHorizontal = false;
        let dimension = new Coordinate(this.cellWidth, (this.cellWidth * this.selectedShip.length));
        this.setWidthAndHeight(dimension, shipHTML);
      }
      if (this.setLeftRight(board, head, shipHTML, cellHTML, this.notShipAround)) {
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

    this.turn = 0;
    this.previousShots = [];
    this.totalPlayerHits = new Array(2).fill(0);
    this.gameFinish = false;
    this.disableTableInteraction = false;

    if (this.isMultiplayer) {
      this.socketService.playerReady(this.selfShipList);
      this.socketService.bothPlayerReady( (ships, turn) => {
        this.playerTurn = turn;
        ships.forEach(ship =>
          this.assignShip(this.rivalShipList, ship, this.mapShipRival, this.listRivalCell, this.rivalBoard));

        this.bothPlayersReady = true;
      });
      this.socketService.clickCellReply((row, col) => {
        this.playerTurn = !this.playerTurn;
        this.onClickCell(row, col, this.selfBoard, false);
      });
    }
    else {
      this.gameTime = 0;
      this.gameTimePid = window.setInterval(() => {
        this.gameTime += 1;
      }, 1000);

      this.positionShipRandomly();
    }
  }


  showShipWhenAllHit(ship: Ship, board : Board) {
    let map = board == this.selfBoard ? this.mapShipStatSelf : this.mapShipStatRival;
    map.get(ship.type)!.style.backgroundColor = '#EE7674';
    for (let i = 0; i < ship.length; i++) {
      if (ship?.isHorizontal) {
        board.getCell(ship.head!.row, ship.head!.col + i).hit = undefined;
      }
      else {
        board.getCell(ship.head!.row + i, ship.head!.col).hit = undefined;
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
      board.getCell(head!.row + (isHorizontal ? 0 : i), head!.col + (isHorizontal ? i : 0)).ship =
        fill ? this.selectedShip : undefined;
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
        isStartGame : !this.disableTableInteraction,
        totalPlayerHits : this.totalPlayerHits[0],
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
      this.previousShots = data.previousShots.map((cell : Cell) => new Cell(cell.row, cell.col));
      this.totalPlayerHits[0] = data.gameData[0].totalHits;
      this.totalPlayerHits[1] = data.ships[1].reduce((totalHits : number, ship : Ship) => totalHits + ship.hit, 0);

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
        this.assignShip(shipList, ship, map, cells, board);
        this.resetShipStat(tableNumber, ship);
      }
      board = this.rivalBoard;
      map = this.mapShipRival;
      cells = this.listRivalCell;
      shipList = this.rivalShipList;
      tableNumber++;
    }
    this.previousShots = this.previousShots.map((cell) => this.selfBoard.getCell(cell.row, cell.col));
  }

  assignShip(shipList : Ship[], ship : Ship, map : Map<any, any>, cells : QueryList<ElementRef>, board: Board ) {
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
    this.emptyOrFillCellsWithShips(board, undefined, ship.head);
    this.selectedShip.oldHead = ship.head!;
  }


  showFinalMessage(message: string) {
    this.gameFinish = true;
    clearInterval(this.gameTimePid);
    let dialogRef = this.dialog.open(FinishGameDialogComponent, {data:  message});

    dialogRef.componentInstance.playAgain.subscribe(() => {
      this.playAgain();
    });

    let result = message === 'You win' ? 'win' : 'lose';

    if (!this.gameRestarted) {
      this.saveGameDetails(result);
    }
  }

  playAgain() {
    this.disableTableInteraction = true;


    this.selfShipList.forEach(ship => ship.isVisible = false);
    this.positionShipRandomly(this.selfShipList);

    this.listShipSelf.forEach((item, index) => {
      if (!this.selfShipList[index].isHorizontal) {
        item.nativeElement.style.height = '40px';
      }
      item.nativeElement.style.width = `${this.selfShipList[index].length * 40}px`;
      item.nativeElement.style.left = `${index < 3 ? 40 : 290}px`;
      item.nativeElement.style.top = `${index < 3 ? index*50 + 485 : (index-3)*50 + 485}px`;
    });

    this.listShipRival.forEach((item, index) => {
      if (!this.rivalShipList[index].isHorizontal) {
        item.nativeElement.style.height = '40px';
      }
      item.nativeElement.style.width = `${this.rivalShipList[index].length * 40}px`;
    });

    this.selfBoard = new Board();
    this.rivalBoard = new Board();

    for (let i = 0; i < this.selfShipList.length; i++) {
      this.selfShipList[i].setProperty();
      this.rivalShipList[i].setProperty();
      this.resetShipStat(0, this.selfShipList[i]);
      this.resetShipStat(1, this.rivalShipList[i]);
    }
    this.bot = new GameBot(this.selfBoard);
    this.fireDirection = 0;
    this.previousShots = [];

    this.totalPlayerHits = new Array(2).fill(0)
    this.totalMissileLaunch = 0;
    this.gameFinish = false;
    this.gameRestarted = false;
  }


  resetShipStat(tableNumber : number, ship: Ship) {
    if (tableNumber === 0) {
      if (ship.hit === ship.length) {
        this.mapShipStatSelf.get(ship.type)!.style.backgroundColor = '#EE7674';
      } else {
        this.mapShipStatSelf.get(ship.type)!.style.backgroundColor = 'rgba(100, 149, 237, 0.35)';
      }
    } else if (ship.hit === ship.length) {
      this.mapShipStatRival.get(ship.type)!.style.backgroundColor = '#EE7674';
    } else {
      this.mapShipStatRival.get(ship.type)!.style.backgroundColor = 'rgba(100, 149, 237, 0.35)';
    }
  }

  openManual() {
    this.dialog.open(ManualDialogComponent);
  }

}

function shuffle(array : Cell[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function initShips(): Ship[] {
  const carrier = new Ship('carrier', 5);
  const battleship = new Ship('battleship', 4);
  const destroyer = new Ship('destroyer', 3);
  const submarine = new Ship('submarine', 3);
  const patrolBoat = new Ship('patrolBoat', 2);

  return [carrier, battleship, destroyer, submarine, patrolBoat];
}

