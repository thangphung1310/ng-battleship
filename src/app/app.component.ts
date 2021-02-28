import { Component, ViewContainerRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BoardService } from './services/board.service'
import { Board } from './models/board'
import { SocketService } from './services/socket.service';

const NUM_PLAYERS = 2;
const BOARD_SIZE = 6;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [BoardService]
})

export class AppComponent {
  canPlay: boolean = true;
  player: number = 0;
  players: number = 0;
  gameId: string;
  gameUrl: string = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port: '');

  constructor(
    private toastr: ToastrService,
    private _vcr: ViewContainerRef,
    private boardService: BoardService,
    private socketService: SocketService
  ) {
    this.createBoards();
    this.initSocket();
    this.listenForChanges();
  }

  initSocket() : AppComponent {
    // findOrCreate unique channel ID
    let id = this.getQueryParam('id');
    if (!id) {
      id = this.getUniqueId();
      location.search = location.search ? '&id=' + id : 'id=' + id;
    }
    this.gameId = id;
    
    this.socketService.initConnection()

    this.socketService.socket.emit('reqToJoinGame',this.gameId)

    this.socketService.socket.on('subscription_succeeded', data => {
      this.players = data.members;
      this.setPlayer(this.players);
      this.toastr.success("Success", 'Connected!');
    })

    this.socketService.socket.on('player_order', (data) => {
      this.player = data
    })

    return this;
  }

  listenForChanges() : AppComponent {
    this.socketService.socket.on('client-fired', (obj) => {
      this.canPlay = !this.canPlay;
      this.boards[obj.boardId] = obj.board;
      this.boards[obj.player].player.score = obj.score;
    });

    console.log(this.socketService.socket.id + ' received fire event')
    return this;
  }

  setPlayer(players:number = 0) : AppComponent {
    // this.player = players - 1;
    if (this.player == 0) {
      this.canPlay = true;
    } else if (this.player == 1) {
      this.canPlay = false;
    }
    return this;
  }

  fireTorpedo(e:any) : AppComponent {
    let id = e.target.id,
      boardId = id.substring(1,2),
      row = id.substring(2,3), col = id.substring(3,4),
      tile = this.boards[boardId].tiles[row][col];
    if (!this.checkValidHit(boardId, tile)) {
      return;
    }

    if (tile.value == 1) {
      this.toastr.success("You got this.", "HURRAAA! YOU SANK A SHIP!");
      this.boards[boardId].tiles[row][col].status = 'win';
      this.boards[this.player].player.score++;
    } else {
      this.toastr.info("Keep trying fam.", "OOPS! YOU MISSED THIS TIME");
      this.boards[boardId].tiles[row][col].status = 'fail'
    }
    this.canPlay = false;
    this.boards[boardId].tiles[row][col].used = true;
    this.boards[boardId].tiles[row][col].value = "X";
    this.socketService.socket.emit('client-firing', {
      gameId: this.gameId,
      player: this.player,
      score: this.boards[this.player].player.score,
      boardId: boardId,
      board: this.boards[boardId]
    });
    return this;
  }

  createBoards() : AppComponent {
    for (let i = 0; i < NUM_PLAYERS; i++)
      this.boardService.createBoard(BOARD_SIZE);
    return this;
  }

  checkValidHit(boardId: number, tile: any) : boolean {
    if (boardId == this.player) {
      this.toastr.error("Don't commit suicide.", "You can't hit your own board.")
      return false;
    }
    if (this.winner) {
      this.toastr.error("Game is over");
      return false;
    }
    if (!this.canPlay) {
      this.toastr.error("A bit too eager.", "It's not your turn to play.");
      return false;
    }
    if(tile.value == "X") {
      this.toastr.error("Don't waste your torpedos.", "You already shot here.");
      return false;
    }
    return true;
  }

  getQueryParam(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }

  getUniqueId () {
    return 'battleship-' + Math.random().toString(36).substr(2, 8);
  }

  get boards () : Board[] {
    return this.boardService.getBoards()
  }

  get winner () : Board {
    return this.boards.find(board => board.player.score >= BOARD_SIZE);
  }

  get validPlayer(): boolean {
    return (this.players >= NUM_PLAYERS) && (this.player < NUM_PLAYERS);
  }
}
