import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import {Ship} from "../shared/models/ship.model";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  joinGame(gameId: string) {
    this.socket = io('http://localhost:3000');
    this.socket.emit('joinGame', gameId);
  }

  disconnected(callback: (data: any) => void) {
    this.socket.on('enemyDisconnected', callback);
  }

  disconnectedEmit() {
    this.socket.disconnect();
  }
  onEnemyConnected(callback: (data: any) => void) {
    this.socket.on('enemyConnected', callback);
  }

  playerReady(ships : Ship[]) {
    this.socket.emit('playerReady', ships);
  }

  enemyReady(callback: () => void) {
    this.socket.on('enemyReady', callback);
  }

  bothPlayerReady(callback: (ships: Ship[], turn : boolean) => void) {
    this.socket.on('bothPlayersReady',callback);
  }

  clickCell(row : number, col : number) {
    this.socket.emit('clickCell', row, col);
  }

  clickCellReply( callback: (row: number, col : number) => void) {
    this.socket.on('clickCellReply', callback);
  }

}
