const express = require('express')
const app = express()
const server = require('http').createServer(app);
const path = require('path');

const io = require('socket.io')(server, {
    cors: { 
        origins: ['http://localhost:4200'],
        credentials: true
     }
});

server.listen(process.env.PORT || 3000);

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(express.static('./dist/ng-battleship'));

io.on("connection", socket => {
    console.log(socket.id + ' connected')

    var previousId
    const joinGame = (gameId) => {
        if (previousId) {
            socket.leave(previousId)
        }
        socket.join(gameId)

        previousId = gameId
    }

    socket.on('reqToJoinGame', (gameId) => {
        joinGame(gameId)

        let size
        if (io.sockets.adapter.rooms.get(gameId)) {
            size = io.sockets.adapter.rooms.get(gameId).size;
        }

        console.log(size)
        if (size) {
            if (size == 1) {
                socket.emit('player_order',0)
            }
            if (size == 2) {
                socket.emit('player_order',1)
                io.in(gameId).emit('subscription_succeeded', {
                    'members': size
                })
            }
        }
    })

    socket.on('client-firing', (data) => {
        socket.to(data.gameId).emit('client-fired', data)
    })

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected')
    })
})