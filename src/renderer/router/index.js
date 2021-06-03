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
      path: '/reading-local',
      name: 'reading-local',
      component: require('@/components/ReadingLocal').default
    },
    {
      path: '/reading-online',
      name: 'reading-online',
      component: require('@/components/ReadingOnline').default
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
      path: '/comic-detail',
      name: 'comic-detail',
      component: require('@/components/ComicDetail').default
    },
    {
      path: '/global-setting',
      name: 'global-setting',
      component: require('@/components/GlobalSetting').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
