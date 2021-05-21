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
      path: '/site-rules',
      name: 'site-rules',
      component: require('@/components/SiteRules').default
    },
    {
      path: '/site-rules-detail',
      name: 'site-rules-detail',
      component: require('@/components/SiteRulesDetail').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
