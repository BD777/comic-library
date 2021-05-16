import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
// import db from './datastore'

import { Button, Menu, Icon, Layout, Row, Col, Input, Modal, FormModel, Select, Message, Alert, Pagination, Card, Tag, Popconfirm } from 'ant-design-vue'

[Button, Menu, Icon, Layout, Row, Col, Input, Modal, FormModel, Select, Message, Alert, Pagination, Card, Tag, Popconfirm].forEach(e => {
  Vue.use(e)
})

Vue.prototype.$message = Message

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// Vue.prototype.$db = db

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
