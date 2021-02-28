import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor() { }

  socket

  initConnection() {
    this.socket = io('http://localhost:3000');
  }

  addPlayer(gameId) {
    this.socket.emit('addPlayerToGame', gameId)
  }
}
