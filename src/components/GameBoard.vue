<template lang="pug">
	v-layout#gameBoard.elevation-6
		div.room-container
			h4(:v-if="room !== null && !isHost")
				span.connected You are now connected to {{ room }}
				div.green-glow
					label(
						:v-if="room === null && isHost"
						for="room"
						) Share Room ❯
					input(
						:v-if="room !== null && isHost"
						type="text"
						id="room"
						:value="room"
						)
		div#player
			h4
				div.avatar
				| Your Board
				i.connection-type {{ isHost ? '(You are the Host)' : '(You are not the Host)'}}
			div.sonar
				div.grid-col(
					v-for="col in columns"
					:data-column="col.col"
					)
					span(
						v-for="({x, hit}) in col.rows"
						:class="changeStyle({x: x, y: col.y, col: col.col}, null)"
						:id="'player-' + col.col + x"
						:data-row="x + 1"
						@mouseover="hoverShip({y: col.y, x: x, col: col.col}, $event)"
						@mouseleave="hoverShip({y: col.y, x: x, col: col.col}, $event)"
						@click="placeShip({y: col.y, x: x, col: col.col})"
						:data-column="col.col"
						)
						span.hover
						span.ship-container
							span.ship
				div.rotate(v-if="selectedShip !== null" @click="rotated = !rotated") Rotate Ship
			div.ships
				ul(
					v-model="ships"
					:v-if="ships && ships.length"
					)
					li(
						:v-if="ships && ships.length"
						v-for="(ship) in ships"
						:key="Math.random(2)"
						:class="ship.amount === 0 ? 'empty' : ''"
						@click="setSelectedShip(ship)"
						 )
						div.ship-icons(
							v-if="ship.type !== null"
							:class="ship.type.toLowerCase()"
							)
							i(v-for="n in ship.size")
						div.ship-title.metal-text {{ ship.amount }} {{ ship.type }}
						.arrow-holder
				#arrow.circle.bounce(
					data-target="#introText"
					:v-show="selectedShip"
					)
					h4 Pick a Ship
					i.fa.fa-angle-double-down.fa-4x.drop-arrow
		section#chat
			#statusMessage
				v-list-tile
					v-list-tile-avatar
						div(class="waiting")
					v-list-tile-content
						v-list-tile-title.metal-text() {{ statusMessage }}
						v-list-tile-sub-title(
							:v-if="players && players.length === 2") Start laying out your battleships!
			#chatBox
				v-list-tile.message(
					v-for="(message) in messages"
					:class="message.from.toLowerCase()"
					:key="Math.random()"
					)
					v-list-tile-avatar(
						:class="message.from.toLowerCase()"
						)
					v-list-tile-content
						v-list-tile-title() {{ `${message.from} at ${message.time}` }}
						v-list-tile-sub-title() {{ message.msg }}
			.newMessage
				v-text-field(
					name="newMessageText"
					v-model="message"
					label="Type new message to opponent..."
					)
				v-btn(
					:class="message !== '' ? 'success' : ''"
					 @click.native="sendMessage(message, null)") {{ message !== '' ? 'Send' : '...' }}
		div#opponent
			h4 {{ statusMessage }}
			div.sonar
				div.grid-col(
					v-for="col in enemyColumns"
					:data-column="col.col"
					)
					span(v-for="({x, hit}) in col.rows"
					:class="changeStyle({x: x, y: col.y, col: col.col}, true)"
					:id="'opponent-' + col.col + x"
					:data-row="x + 1"
					:data-column="col.y"
					@click="fire({x: x, y: col.y, col: col.col})"
					)
</template>

<script>
export default {
  name: 'GameBoard',
	props: ['isHost'],
  data () {
    return {
			connected: false,
      ships: [{
				type: null,
		    size: null,
		    location: [],
		    hits: null,
		    amount: null
			}],
      selectedShip: null,
			canPlaceShip: false,
			gridItemHovered: null,
      statusMessage: 'Waiting for opponent',
			message: '',
			messages: [],
      rotated: false, // vertical
      opponentReady: false,
			players: [],
      ready: false,
      playerState: null,
      canFire: false,
      room: null,
			enemyColumns: [
				{col: 'A', y: 0,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'B', y: 1,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'C', y: 2,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'D', y: 3,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'E', y: 4,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'F', y: 5,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'G', y: 6,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'H', y: 7,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]}
			],
			columns: [
				{col: 'A', y: 0,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'B', y: 1,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'C', y: 2,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'D', y: 3,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'E', y: 4,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'F', y: 5,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'G', y: 6,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]},
				{col: 'H', y: 7,	rows: [{x: 0, hit: false, hover: false, me: false, error: false, me: false}, {x: 1, hit: false, hover: false, me: false, error: false, me: false}, {x: 2, hit: false, hover: false, me: false, error: false, me: false}, {x: 3, hit: false, hover: false, me: false, error: false, me: false}, {x: 4, hit: false, hover: false, me: false, error: false, me: false}, {x: 5, hit: false, hover: false, me: false, error: false, me: false}, {x: 6, hit: false, hover: false, me: false, error: false, me: false}, {x: 7, hit: false, hover: false, me: false, error: false, me: false}]}
			]
    }
  },
  sockets: {
    connect() {
      console.log('socket connected')
			this.$socket.emit('init', window.location.pathname.substring(1, window.location.pathname.length))
    },
		init (res) {
			this.ships = res.ships
			this.room = window.location + res.room
			this.playerState = res
			this.players = res.players

			console.log('🚢 SHIPS:', this.ships)
			console.log('🏡 ROOMS:', this.rooms)
			console.log('🕹 PLAYER STATE:', this.playerState)
			console.log(res.players.length + ' 🎮 PLAYERS:', this.players)

			if(res.players.length === 2) {
				this.statusMessage = 'Place Your Ships!'
				this.sendMessage(this.statusMessage, true)
			}

			res.players.forEach((e,i) => {
				if (e.id !== res.id && e.ready) {
					this.opponentReady = true
					this.statusMessage = 'Players Ready!'
					this.sendMessage(this.statusMessage, true)
				}
			})
		},
		newMessage(message) {
			if (message.from === 'You') {
				message.from = 'Opponent'
			}
			this.messages.push(message)
			const chatBox = this.$el.querySelector("#chatBox")
			chatBox.scrollTop = chatBox.scrollHeight + 200
		},
		canFire(obj) {
			if (this.playerState.id === obj.id) {
		    this.canFire = true
				this.statusMessage = 'It is Your Turn to Fire'
		  }
			else {
		    this.canFire = false
				this.statusMessage = 'It is Opponent\'s Turn to Fire'
		  }
			this.sendMessage(this.statusMessage, true)
		},
		// fire(coords) {
		// 	if (!(this.ready && this.opponentReady && this.canFire)) {
		// 		return
		// 	}
		//
		// 	// if (this.columns[coords.y].rows[coords.x].hit === true) {
		//
		// 		socket.emit('fire', {
		// 			'playerState': this.playerState,
		// 			'coords': coords
		// 		})
		// 		// this.columns[coords.y].rows[coords.x].hit = true
		// 	// }
		// },
		playerJoined() {
			this.statusMessage = "Players Not Ready"
			this.sendMessage(this.statusMessage, true)
		},
		opponentLeft() {
			this.statusMessage = "Opponent Left"
			this.sendMessage(this.statusMessage, true)
		},
		opponentReady() {
			this.opponentReady = true
			this.statusMessage = 'Opponent Ready'
			this.sendMessage(this.statusMessage, true)
		},
		win() {
			this.sendMessage("YOU WIN", true)
		},
		takeFire(obj) {
			if (obj.opponent.takenHits === obj.opponent.locations.length) {
		    alert('YOU LOSE!')
		  }

			console.log(`taking fire...at ${obj.coords.col + obj.coords.x}`)

			if (this.columns[obj.coords.y].rows[obj.coords.x].me === true) {
				this.columns[obj.coords.y].rows[obj.coords.x].hit = true
		    this.statusMessage = `${obj.opponent.id} fires at ${obj.coords.col + obj.x} for a 🔥 hit! Opponent\'s turn.`
		  } else {
				this.columns[obj.coords.y].rows[obj.coords.x].hit = false
				this.statusMessage = `${obj.opponent.id} fires at ${obj.coords.col + obj.x} and misses! Your turn.`
		  }
			this.changeStyle(obj.coords, false)
			this.sendMessage(this.statusMessage, true)
		},
		hit(obj) {
			console.log('hit ' + obj.hit)

		  if (obj.hit) {
		    this.enemyColumns[obj.coords.y].rows[obj.coords.x].hit = true
		    this.enemyColumns[obj.coords.y].rows[obj.coords.x].me = true
		    this.statusMessage = 'Your turn'
		    this.canFire = true
		  }
			else {
				this.enemyColumns[obj.coords.y].rows[obj.coords.x].hit = true
				this.enemyColumns[obj.coords.y].rows[obj.coords.x].me = false
		    this.statusMessage = 'Opponent turn'
		    this.canFire = false
		  }

			this.changeStyle(obj.coords, true)
		},
		gameover(players) {
			let opponent

		  for (let i = 0; i < players.length; i++) {
		    if (players[i].id !== this.playerState.id)
		      opponent = players[i]
		    }

		  console.log(opponent)

		  for (let i = 0; i < opponent.ships.length; i++) {
		    for (let n = 0; n < opponent.ships[i].location.length; n++) {
					this.opponent.ships[i].location[n].show = true
				}
			}
		}
  },
	computed: {

	},
  methods: {
		readyStatus() {
			if (this.ships.length === 0) {
				return
			}

			let ready = true

			this.ships.forEach((ship,i) => {
				if (ship.amount > 0) {
					ready = false
				}
			})

			if (ready) {
				console.log('You Are Ready!')
				this.ready = true
				this.$socket.emit('ready', {
					'playerState': this.playerState,
					'locations': this.ships
				});
			}

			return ready
		},
		copySelect(value) {
			debugger
			this.$refs.text.select();
 			document.execCommand('copy');
		},
		fire(coords) {
			if (!(this.ready && this.opponentReady && this.canFire)) {
				return
			}

			this.enemyColumns[coords.x].rows[coords.y].me = true
			// if (this.opponentColumns[coords.y].rows[coords.x].me = true) {

				this.$socket.emit('fire', {
					'playerState': this.playerState,
					'coords': coords
				})

				// this.oponentColumns[coords.y].rows[coords.x].hit = true
			// }
		},
		setSelectedShip(selectedShip) {
			if (selectedShip.amount === 0) {
				return
			}
      this.selectedShip = selectedShip
			console.log(selectedShip)
    },
    sendMessage(message, battleBot) {
      // could use moment/moment-timezone here
			if (message === '') {
				return
			}

      const date = new Date()
      const hour = date.getHours()
      const minute = date.getMinutes()

      let time = hour + ":" + minute

			let msg = {
				from: battleBot === null ? "You" : "BattleBot",
				msg: message,
				time: time
			}

			this.messages.push(msg)

      if (message !== "") {
        this.$socket.emit('message', msg)
			}

 			this.message = ''

			const chatBox = this.$el.querySelector("#chatBox")
			chatBox.scrollTop = chatBox.scrollHeight
    },
		hoverShip (coords, e) {

			// No Ship Selected
			if (!this.selectedShip) {
				return
			}

 			const size = this.selectedShip.size
			let canPlace = []

			// Vertical
			if (!this.rotated) {
				for (let i = 0; i < size; i++) {
					if (e.type === 'mouseover') {
						if (coords.x + size <= this.columns.length) {
							// all tiles ARE valid to place
							if(this.columns[coords.y].rows[coords.x + i].me !== true) {
								this.columns[coords.y].rows[coords.x + i].hover = true
								this.columns[coords.y].rows[coords.x + i].error = false
								canPlace.push(true)
							}
							else {
								// all tiles ARE NOT valid to place
								// highlight and mark only the incorrect ones
								this.columns[coords.y].rows[coords.x + i].hover = true
								this.columns[coords.y].rows[coords.x + i].error = true
								canPlace.push(false)
							}
						}
						else {
							if (coords.x + i > this.columns.length - 1) {
								break
							}
							else {
								this.columns[coords.y].rows[coords.x + i].hover = true
								this.columns[coords.y].rows[coords.x + i].error = true
								canPlace.push(false)
							}
						}
					}
					else {
						if (coords.x + i < this.columns.length) {
							this.columns[coords.y].rows[coords.x + i].hover = false
							this.columns[coords.y].rows[coords.x + i].error = false
							canPlace.push(false)
						}
					}
				}
			}

			//  Horizontal
			else {
				for (let i = 0; i < size; i++) {
					if (e.type === 'mouseover') {
						if (coords.y + size <= this.columns.length) {
							// all tiles ARE valid to place
							if(this.columns[coords.y + i].rows[coords.x].me !== true) {
								this.columns[coords.y + i].rows[coords.x].hover = true
								this.columns[coords.y + i].rows[coords.x].error = false
								canPlace.push(true)
							}
							else {
								// all tiles ARE NOT valid to place
								// highlight and mark only the incorrect ones
								this.columns[coords.y + i].rows[coords.x].hover = true
								this.columns[coords.y + i].rows[coords.x].error = true
								canPlace.push(false)
							}
						}
						else {
							if (coords.y + i > this.columns.length - 1) {
								break
							}
							else {
								this.columns[coords.y + i].rows[coords.x].hover = true
								this.columns[coords.y + i].rows[coords.x].error = true
								canPlace.push(false)
							}
						}
					}
					else {
						if (coords.y < this.columns.length) {
							this.columns[coords.y + i].rows[coords.x].hover = false
							this.columns[coords.y + i].rows[coords.x].error = false
							canPlace.push(false)
						}
					}
				}
			}

			this.canPlaceShip = !canPlace.includes(false)
			this.changeStyle(coords)
		},
		changeStyle(coords, enemy) {
			const {
				hit,
				me,
				hover,
				error,
				position,
				direction
			} = enemy ? this.enemyColumns[coords.y].rows[coords.x] : this.columns[coords.y].rows[coords.x]

			let classList = [
				hit ? 'hit' : '',
				me	? 'me' : '',
				position ? position : '',
				direction ? direction : '',
				hover ? 'hover' : '',
				error ? 'isError' : ''
			]

			// console.log(classList)

			return classList.join(' ')
		},
    placeShip (coords) {

			// No Ship Selected & Guard Against No Ships Left
      if (this.selectedShip === null || this.selectedShip.amount === 0 || !this.canPlaceShip) {
        return
      }

      const size = this.selectedShip.size

			// Vertical
			if (!this.rotated) {
				for (let i = 0; i < size; i++) {
					if (i === 0) {
						this.columns[coords.y].rows[coords.x + i].position = 'back'
					}
 					if (i === size -1) {
						this.columns[coords.y].rows[coords.x + i].position = 'front'
					}
					this.columns[coords.y].rows[coords.x + i].me = true
					this.columns[coords.y].rows[coords.x + i].hover = false
					this.columns[coords.y].rows[coords.x + i].direction = 'vertical'
					this.selectedShip.location.push({x: coords.x + i, y: coords.y})
				}
			}

			// Horizontal
			else {
				for (let i = 0; i < size; i++) {
					if (i === 0) {
						this.columns[coords.y + i].rows[coords.x].position = 'back'
					}
					if (i === size -1) {
						this.columns[coords.y + i].rows[coords.x].position = 'front'
					}
					this.columns[coords.y + i].rows[coords.x].me = true
					this.columns[coords.y + i].rows[coords.x].hover = false
					this.columns[coords.y + i].rows[coords.x].direction = 'horizontal'
					this.selectedShip.location.push({x: coords.x, y: coords.y + i})
				}
			}
      this.$socket.emit('place', this.selectedShip)
			this.selectedShip.amount--
			this.selectedShip = null
			this.canPlaceShip = false
			this.readyStatus()
			this.changeStyle(coords)
    }
  }
}

</script>

<style lang="less">
@import "../styles/Index.less";
</style>
