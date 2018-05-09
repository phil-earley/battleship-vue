// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
// import VueSocketio from 'vue-socket.io'
import App from './App'
import router from './router'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false
Vue.use(Vuetify)

if (module.hot) {
 module.hot.accept();
}

// Vue.use(Vuetify, VueSocketio, 'http://localhost:3000')
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
