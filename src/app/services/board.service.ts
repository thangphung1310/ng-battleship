import { Injectable } from '@angular/core';
import {Board} from '../models/board'
import {Player} from '../models/player'

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  playerId: number = 1
  boards: Board[] = []
  constructor() { }

  createBoard(size: number = 5) {
    //create tiles for board
    let tiles = []
    for (let i = 0; i<size; i++) {
      tiles[i]= []
      for (let j = 0; j<size; j++) {
        tiles[i][j] = {
          used: false,
          value: 0,
          status: ''
        }
      }
    }

    //generate random ships for the board
    for (let i = 0; i<size*2; i++) {
      tiles = this.randomShips(tiles,size)
    }

    //create board
    let board = new Board({
      player: new Player({id: this.playerId++}),
      tiles: tiles
    })
    this.boards.push(board)
    return this
  }

  randomShips(tiles: Object[],length: number) {
    console.log(length)
    length = length - 1
    let ranRow = this.getRandomInt(0, length)
    let ranCol = this.getRandomInt(0, length)

    if (tiles[ranRow][ranCol].value == 1) {
      return this.randomShips(tiles,length)
    } else {
      tiles[ranRow][ranCol].value = 1
      return tiles
    }
  }

  getRandomInt(min,max) {
    return Math.floor(Math.random() * (max-min+1))+min
  }

  getBoards() {
    return this.boards
  }
}
