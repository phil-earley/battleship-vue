<template lang="pug">
v-app(dark)
	v-layout#root
		section#header
			h1#logo(alt="Phil's Vue Battleship")
			div#carrier
		section#game
			game-board(:isHost="isHost")
</template>

<script>
import Vue from 'vue'
import VueSocketio from 'vue-socket.io'
import GameBoard from '@/components/GameBoard.vue'

Vue.use(VueSocketio, 'http://localhost:3000')
export default {
  name: 'Battleship',
	components: {
		'game-board': GameBoard
	},
  data () {
    return {
      room: null
    }
  },
  sockets: {
    connect () {
      console.log('socket connected')
			this.$socket.emit('init', window.location.pathname.substring(1, window.location.pathname.length));
    },
		init (res) {
			console.log(res)
			if (res.players.length == 2) {
				this.statusMessage = 'Placing Ships...'
			}
		}
  },
  methods: {
    setSelectedShip (ship) {
      this.selectedShip = ship
    },
		clickButton (val) {
      // $socket is socket.io-client instance
      this.$socket.emit('newMessage', val)
    },
		newMessage () {

		},
    sendMessage () {
      const tbox = document.querySelector('#messages')
      const mes = document.querySelector('.chatmessage')
      const li = document.createElement('li')

      const date = new Date()
      const hour = date.getHours()
      const minute = date.getMinutes()
      const time = `[${hour}:${minute}]`

      if (mes.value !== '') {
        li.innerText = `${time} You said: ${mes.value}`
        tbox.appendChild(li)
        this.$socket.emit('message', mes.value)
      }

      mes.value = ''
      tbox.scrollTop = tbox.scrollHeight
    }
  },
	computed: {
		isHost () {
			return window.location.pathname === '/' ? true : false
		}
	}
}
</script>

<style lang="less" >
@import '../styles/Index.less';
</style>
