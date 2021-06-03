<template>
  <div id="app">
    <a-layout
      style="height: 100vh; width: 100vw;"
    >
      <a-layout-sider v-model="collapsed" collapsible>
        <a-menu theme="dark" v-model="current" :default-selected-keys="['/']" mode="inline" @click="onMenuClick">
          <a-menu-item key="/">
            <a-icon type="book" />
            <span>本地漫画</span>
          </a-menu-item>
          <a-menu-item key="/reading-local">
            <a-icon type="read" />
            <span>正在浏览</span>
          </a-menu-item>
          <a-divider style="background: #174169;" />
          <a-menu-item key="/site-rules">
            <a-icon type="cloud" />
            <span>在线漫画</span>
          </a-menu-item>
          <a-menu-item key="/reading-online">
            <a-icon type="read" />
            <span>在线浏览</span>
          </a-menu-item>
          <a-divider style="background: #174169;" />
          <a-menu-item key="/global-setting">
            <a-icon type="setting" />
            <span>设置</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content>
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script>
  export default {
    name: 'comic-library',
    data () {
      return {
        collapsed: true,
        current: ['/']
      }
    },
    methods: {
      toggleCollapsed () {
        this.collapsed = !this.collapsed
      },
      onMenuClick (e) {
        // console.log('onMenuClick', e)
        let path = e.key
        if (this.$route.path !== path) this.$router.push({ path: path })
      }
    },
    mounted () {
      console.log('App mounted', this.$route.path)
      this.current = [this.$route.path]
    },
    watch: {
      $route (to, from) {
        console.log(to.path)
        this.current = [to.path]
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
