import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'my-library',
      component: require('@/components/MyLibrary').default
    },
    {
      path: '/reading',
      name: 'reading',
      component: require('@/components/Reading').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
