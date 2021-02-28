import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor() { }

  socket

  initConnection() {
    this.socket = io('https://ng-battleship-tp.herokuapp.com');
  }

  addPlayer(gameId) {
    this.socket.emit('addPlayerToGame', gameId)
  }
}
