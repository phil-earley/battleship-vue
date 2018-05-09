import socketio from 'socket.io';
import uniqid from 'uniqid';

export function listen(http, rooms) {
  const ships = [{
    type: 'Carrier',
    size: 6,
    location: [],
    hits: 0,
    amount: 1
  }, {
    type: 'Battleship',
    size: 5,
    location: [],
    hits: 0,
    amount: 1
  }, {
    type: 'Submarine',
    size: 4,
    location: [],
    hits: 0,
    amount: 1
  }, {
    type: 'Cruiser',
    size: 4,
    location: [],
    hits: 0,
    amount: 1
  }, {
    type: 'Destroyer',
    size: 3,
    location: [],
    hits: 0,
    amount: 1
  }];

  const shipTiles = () => {
    let tiles = 0;
    for (let i = 0; i < ships.length; i++) {
      if (ships[i].amount > 0) {
        tiles += ships[i].amount * ships[i].size
      }
    }
    return tiles
  }

  const updateShip = (id, ship, callback) => {
    rooms.findOne({'players.id': id}, (err, res) => {
      const players = [];

      let player;

      for (let i = 0; i < res.players.length; i++) {
        if (res.players[i].id === id) player = res.players[i]
        else players.push(res.players[i])
      }

      for (let i = 0; i < player.ships.length; i++) {
        if (player.ships[i].type === ship.type) {
          player.ships[i] = ship
        }
      }

      players.push(player)

      rooms.update({room: res.room}, { $set: {players} }, (err, numReplaced) => {
        rooms.findOne({}, (err, res) => {
          console.log('⚡️ Sockets Says:', res.players[0].ships)
        })
      })
    })
  };

  const setCanFire = (id, callback) => {
    rooms.findOne({'players.id': id}, (err, res) => {
      if (res !== null) {
        const players = res.players;

        for (let i = 0; i < players.length; i++) {
          if (players[i].id === id) players[i].canFire = true
          else players[i].canFire = false
        }

        rooms.update({room: res.room}, { $set: { players } }, (err, numReplaced) => {
          callback(players)
        })
      }
    })
  };

  const updatePlayer = (id, obj, callback) => {
    const updatedPlayers = [];

    rooms.findOne({'players.id': id}, (err, res) => {
      for (let i = 0; i < res.players.length; i++) {
        if (res.players[i].id === id) { updatedPlayers.push(obj) } // if the player we are looking for matches, push the updated player to the array
        else { updatedPlayers.push(res.players[i]) } // not the player we are looking for, keep that player intact
      }

      callback(updatedPlayers)
    })
  };

  const playersReady = (id, callback) => {
    rooms.findOne({'players.id': id }, (err, res) => {
      // players can only be ready when there are 2 player in the room
      if (res.players.length !== 2) {
        callback(false)
        return
      }

      let ready = true;

      // if there are 2 players and one of them is not ready set ready to false
      for (let i = 0; i < res.players.length; i++) {
        if (!res.players[i].ready) { ready = false }
      }

      callback(ready)
    })
  };

  const io = socketio.listen(http)

  io.on('connection', socket => {
    socket.on('message', message => {
      rooms.findOne({'players.id': socket.id }, (err, res) => {
        if (err === null) { socket.broadcast.to(res.room).emit('newMessage', message) }
      })
    })

    socket.on('init', roomName => {
      // find the room that the client sent to us
      rooms.findOne({room: roomName}, (err, room) => {
        let playerState;

        // check if the room exists
        if (room !== null) {
          // set the initial playerState
          playerState = { 'players': room.players, 'ships': ships, 'id': socket.id, 'room': roomName }

          if (room.players.length === 1) {
            // add the current player to the playerstate's players
            playerState.players.push({'id': socket.id, 'canFire': false, 'ready': false, 'takenHits': 0, 'ships': ships })

            // add the current player to players
            rooms.update({room: roomName}, {$addToSet: { players: {'id': socket.id, 'canFire': false, 'ready': false, 'takenHits': 0, 'ships': ships } } }, {}, (obj, nch) => {})
          }
          // if the room is full, prevent another player from joining the room
          else if (room.players.length === 2) {
            return
          }
        } else { // room does not exist
          // generate an unique roomname
          roomName = uniqid()

          // create a new player state
          playerState = { 'players': [ {'id': socket.id, 'ready': false, 'canFire': false, 'takenHits': 0, 'ships': ships } ], 'ships': ships, 'id': socket.id, 'room': roomName }

          // create the room and insert the first player (host)
          rooms.insert({'room': roomName, 'players': [ {'id': socket.id, 'ready': false, 'canFire': false, 'takenHits': 0, 'ships': ships } ] }, (err, result) => {

          })
        }

        socket.join(roomName)
        socket.broadcast.to(roomName).emit('playerJoined')
        socket.emit('init', playerState)
      })
    })

    socket.on('ready', obj => {
      rooms.findOne({room: obj.playerState.room}, (err, res) => {
        const updatedPlayers = [];
        let bothReady = true;

        for (const p of res.players) {
          if (p.id === obj.playerState.id) {
            p.ready = true
            p.locations = obj.locations
          }

          if (!p.ready || res.players.length !== 2) { bothReady = false }

          updatedPlayers.push(p)
        }

        rooms.update({ room: obj.playerState.room}, { $set: { players: updatedPlayers } }, (err, numReplaced) => {
          rooms.findOne({room: obj.playerState.room}, (err, res) => {
            console.log(res.players);
          })
        })

        socket.broadcast.to(obj.playerState.room).emit('opponentReady', obj.playerState)

        // Randomly select a player to fire first
        if (bothReady) {
          const chooseRandomPlayer = res.players[~~(Math.random() * 2)];
          setCanFire(chooseRandomPlayer.id, () => {
            io.sockets.in(res.room).emit('canFire', chooseRandomPlayer)
          })
        }
      })
    })

    socket.on('fire', obj => {
      playersReady(socket.id, ready => {
        if (ready) {
          rooms.findOne({'players.id': socket.id}, (err, res) => {
            let hit = false;
            let cleanCoords = obj.coords
            let opponent;

            delete cleanCoords.col

            for (let i = 0; i < res.players.length; i++) {
              if (res.players[i].id !== socket.id) {
                opponent = res.players[i]

                for (let n = 0; n < res.players[i].ships.length; n++) {
                  // console.log(res.players[i].ships[n]);
                  for (let x = 0; x < res.players[i].ships[n].location.length; x++) {
                  // console.log(res.players[i].ships[n].location[x]);
                  // if (res.players[i].ships[n].location[x] === obj.cords)
                    console.log(res.players[i].ships[n].location[x], cleanCoords)
                    if (res.players[i].ships[n].location[x].x === cleanCoords.x && res.players[i].ships[n].location[x].y === cleanCoords.y && !opponent.canFire) {
                      hit = true
                      console.log('hit')
                    }
                  }
                }
              }
            }
            console.log('is hit?: ' + hit)

            if (hit) {
              opponent.takenHits++

              if (opponent.takenHits === shipTiles()) {
                socket.emit('win')
                io.sockets.in(res.room).emit('gameover', res.players)
              }

              updatePlayer(opponent.id, opponent, updatedPlayers => {
                rooms.update({ 'players.id': socket.id}, { $set: { players: updatedPlayers } }, (err, numReplaced) => {
                })
              })
            } else {
              setCanFire(opponent.id, () => {
                io.sockets.in(res.room).emit('canFire', opponent)
              })
            }

            socket.broadcast.to(res.room).emit('takeFire', { 'coords': obj.coords, 'opponent': opponent})
            socket.emit('hit', {'coords': obj.coords, 'hit': hit})
          })
        }
      })
    })

    socket.on('place', ship => {
      // console.log(ship);
      /*
          when a user places a ship, check if the ship has already been placed.
          update the ship in the db.
      */
      updateShip(socket.id, ship, () => {

      })
    })

    socket.on('disconnect', () => {
      rooms.findOne({'players.id': socket.id}, (err, res) => {
        if (res !== null) {
          const room = res.room;

          socket.leave(res.room)

          socket.broadcast.to(res.room).emit('opponentLeft')

          if (res.players.length === 1) {
            rooms.remove({'players.id': socket.id}, (err, nr) => {

            })
          } else {
            rooms.update({'players.id': socket.id}, {$pull: {'players': {id: socket.id}}}, (err, nchanged) => {
              if (err) { console.log(`Couldn't remove player ${socket.id} from room ${res.room}`) }
            })
          }
        }
      })
    })
  })

  return io
}
