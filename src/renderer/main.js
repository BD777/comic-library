import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
// import { VueMasonryPlugin } from 'vue-masonry'
// import db from './datastore'
import VueLazyload from 'vue-lazyload'
// import waterfall from 'vue-waterfall2'

import { InputNumber, Badge, Progress, Spin, Empty, Dropdown, Divider, List, Tabs, PageHeader, Switch, Button, Menu, Icon, Layout, Row, Col, Input, Modal, FormModel, Select, Message, Alert, Pagination, Card, Tag, Popconfirm, Drawer, Radio, Checkbox } from 'ant-design-vue'

[InputNumber, Badge, Progress, Spin, Empty, Dropdown, Divider, List, Tabs, PageHeader, Switch, Button, Menu, Icon, Layout, Row, Col, Input, Modal, FormModel, Select, Message, Alert, Pagination, Card, Tag, Popconfirm, Drawer, Radio, Checkbox].forEach(e => {
  Vue.use(e)
})

Vue.use(VueLazyload, {
  preLoad: 1.3,
  loading: require('@/assets/Spinner-1s-800px.gif'),
  attempt: 2
})

// Vue.use(waterfall)

// const VueMasonryPlugin = require('vue-masonry').VueMasonryPlugin
// console.log('???', VueMasonryPlugin)

Vue.prototype.$message = Message

// Vue.use(VueMasonryPlugin)

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
