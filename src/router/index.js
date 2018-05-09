import Vue from 'vue'
import Router from 'vue-router'
import Battleship from '@/pages/Index'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '*',
      name: 'PhilVueBattleship',
      component: Battleship,
    }
  ]
})
