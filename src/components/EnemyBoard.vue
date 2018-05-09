<template lang="pug">
  div.fluid.fill-height
    header
      h1#logo Battleship
      span# phil-battleship-sockets
    div#landing
</template>

<script>
export default {
  name: 'Battleship',
  data () {
    return {
      ships: [],
      selectedShip: null,
      statusMessage: 'Waiting for opponent',
      rotated: false, // vertical
      opponentReady: false,
      ready: false,
      playerState: null,
      canFire: false,
      room: null
    }
  },
  sockets: {
    connect () {
      console.log('socket connected')
    }
  },
  methods: {
    setSelectedShip (ship) {
      this.selectedShip = ship
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
  }
}
Vue.component('board', {
    template: "#board-template",
    props: ['cols', 'rows'],

    computed: {
        chr(n) { return String.fromCharCode(65); }
    },

    methods: {

        placeShip(el) {

            if(this.$root.selectedShip === null || this.$root.selectedShip.amount === 0)
                return;

            const setCords = el.currentTarget.getAttribute('data-cords');
            const size = this.$root.selectedShip.size;

            const hoveredTile = document.querySelectorAll('.tile-hover');

            let overlap = false;

            for (var i = 0; i < size; i++) {

                if(this.$root.rotated) {
                    if (parseInt(setCords.split("").reverse().join("")[0]) + size <= this.cols) {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) + i}"]`);
                        if (e.className === 'placed-tile') overlap = true;
                    }
                    else {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) - i}"]`);
                        if (e.className === 'placed-tile') overlap = true;
                    }
                } else if (!this.$root.rotated) {
                    if (document.querySelector(`[data-cords="${parseInt(setCords) + (i * this.cols)}"]`) !== null) {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) + (i * this.cols)}"]`);
                        if (e.className === 'placed-tile') overlap = true;
                    }
                    else {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) - ((size - i) * this.cols)}"]`);
                        if (e.className === 'placed-tile') overlap = true;
                    }
                }

            }

            if (!overlap) {
                this.$root.selectedShip.amount--;

                for (var i = 0; i < hoveredTile.length; i++) {
                    hoveredTile[i].className = 'placed-tile';
                    this.$root.selectedShip.location.push(hoveredTile[i].getAttribute('data-cords'));
                }
                socket.emit('place', this.$root.selectedShip);
            }
        },

        changeStyle(el) {

            if(this.$root.selectedShip === null || this.$root.selectedShip.amount === 0)
                return;

            const setCords = el.currentTarget.getAttribute('data-cords');

            const size = this.$root.selectedShip.size;

            for (let i = 0; i < size; i++) {

                if(this.$root.rotated) {
                    if (parseInt(setCords.split("").reverse().join("")[0]) + size <= this.cols) {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) + i}"]`);
                        e.className = e.className === 'placed-tile' ? 'placed-tile' : 'tile-hover';
                    }
                    else {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) - i}"]`);
                        e.className = e.className === 'placed-tile' ? 'placed-tile' : 'tile-hover';
                    }
                } else if (!this.$root.rotated) {
                    if (document.querySelector(`[data-cords="${parseInt(setCords) + (i * this.cols)}"]`) !== null) {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) + (i * this.cols)}"]`);
                        e.className = e.className === 'placed-tile' ? 'placed-tile' : 'tile-hover';
                    }
                    else {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) - ((size - i) * this.cols)}"]`);
                        e.className = e.className === 'placed-tile' ? 'placed-tile' : 'tile-hover';
                    }
                }

            }

        },

        setDef(el) {
            if(this.$root.selectedShip === null)
                return;
            const setCords = el.currentTarget.getAttribute('data-cords');

            const size = this.$root.selectedShip.size;

            for (let i = 0; i < size; i++)
                if(this.$root.rotated) {
                    if (parseInt(setCords.split("").reverse().join("")[0]) + size <= this.cols) {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) + i}"]`);
                        e.className  = e.className === 'placed-tile' ? 'placed-tile' : 'tile';
                    }
                    else {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) - i}"]`);
                        e.className  = e.className === 'placed-tile' ? 'placed-tile' : 'tile';
                    }
                } else if (!this.$root.rotated) {
                    if (document.querySelector(`[data-cords="${parseInt(setCords) + (i * this.cols)}"]`) !== null) {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) + (i * this.cols)}"]`);
                        e.className  = e.className === 'placed-tile' ? 'placed-tile' : 'tile';
                    }
                    else {
                        var e = document.querySelector(`[data-cords="${parseInt(setCords) - ((size - i) * this.cols)}"]`);
                        e.className  = e.className === 'placed-tile' ? 'placed-tile' : 'tile';
                    }
                }
        }
    }
});

Vue.component('enemy-board', {
  template: "#enemy-board-template",
  props: ['cols', 'rows'],
  methods: {
    fire(el) {
      if(!(this.$root.ready && this.$root.opponentReady && this.$root.canFire)) return;

      // if(el.currentTarget.getAttribute('data-hittable') === 'true') {
      //
      //     socket.emit('fire', {'playerState': this.playerState, 'cords' : parseInt(el.currentTarget.getAttribute('data-opcords')) } );
      //
      //     el.currentTarget.setAttribute('data-hittable', 'false');
      // }
    }
  }
});
</script>

<style lang="less">
@import '../styles/vue-battleship.less';
</style>
