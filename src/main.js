import Vue from 'vue'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSignInAlt} from '@fortawesome/free-solid-svg-icons'
import { faUser} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import store from './store'
import {router} from './routes'
import babelPolyfill from 'babel-polyfill'
import './registerServiceWorker'



library.add(faSignInAlt,faUser);

Vue.component('font-awesome-icon', FontAwesomeIcon);




new Vue({
  el: '#app',
  router,
  store,
  babelPolyfill,
  render: h => h(App)
})
