<template>
  <div>
    <a-layout>
      <a-layout-content>
        <div style="margin: 20px;" v-if="activeSiteId">
          <a-input-search v-if="canSearch()" v-model="search.text" enter-button @search="onSearch" placeholder="搜索" />

          <a-tabs type="line" v-model="activeTab" @change="onTabChange">
            <a-tab-pane :key="`list-${item.id}`" v-for="item in getSiteById(this.activeSiteId).list" :tab="item.name">
              <div>
                <comic-card-list
                  comic-key="idCode"
                  :comics="comics[item.id] ? comics[item.id].list : []"
                  :cover-ratio="3/4"
                  cardWidth="240px;"
                  @click="toDetail"
                  :show-loading-more="true"
                  @loadMore="onListLoadMore(item.id)"
                  :loading="loading"
                />
              </div>
            </a-tab-pane>
            <a-tab-pane key="search" tab="搜索结果">
              <div>
                <comic-card-list
                  comic-key="idCode"
                  :comics="comics.search.list"
                  :cover-ratio="3/4"
                  cardWidth="240px;"
                  @click="toDetail"
                  :show-loading-more="true"
                  @loadMore="onSearchLoadMore"
                  :loading="loading"
                />
              </div>
            </a-tab-pane>
          </a-tabs>

        </div>
        <div v-else>
          <a-empty description="请选择或创建站点" />
        </div>
      </a-layout-content>
      <a-layout-sider style="background: #fff; min-height: 100vh;">
        <div style="margin: 20px 10px;">
          <div style="text-align: center;">
            <a-button type="link" icon="plus" @click="onAddSiteClick">新增站点</a-button>
          </div>
          <a-divider />
          <a-list item-layout="horizontal" :data-source="siteList" :locale="{ emptyText: '暂无数据' }">
            <a-list-item slot="renderItem" slot-scope="item" :class="`site-list-item ${item._id === activeSiteId ? 'site-list-item-active' : ''}`" @click="onSiteClick(item)">
              <span>{{ item.name }} {{item.active}}</span>
              <span style="text-align: right">
                <a-dropdown :trigger="['click']">
                  <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                    <a-button type="link" icon="ellipsis" />
                  </a>
                  <div slot="overlay" style="padding: 5px; background: #FFF; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 4px;">
                    <a-button type="link" icon="edit" @click="onEditSite(item)" />
                    <a-divider type="vertical" style="margin: 0;" />
                    <a-popconfirm :title="`确定删除 ${item.name} ？`" ok-text="Yes" cancel-text="No" @confirm="onDeleteSite(item)">
                      <a-button type="link" icon="delete" style="color: red;" />
                    </a-popconfirm>
                  </div>
                </a-dropdown>
              </span>
            </a-list-item>
          </a-list>
        </div>
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script>
import ComicCardList from './ComicCardList.vue'

import parser from '../parser/index'
const dao = require('../dao').default

export default {
  name: 'site-rules',
  components: {
    ComicCardList
  },
  data () {
    return {
      loading: false,
      siteList: [],
      activeSiteId: '',

      activeTab: 'search',

      search: {
        text: ''
      },

      comics: {
        search: {
          list: [],
          pagination: {
            current: 1
          }
        }
      }
    }
  },
  methods: {
    onAddSiteClick () {
      this.$router.push({ path: '/site-rules-detail' })
    },
    onEditSite (site) {
      this.$router.push({
        path: '/site-rules-detail',
        query: {
          name: site.name
        }
      })
    },
    async onDeleteSite (site) {
      console.log('onDeleteSite', site)
      if (this.activeSiteId === site._id) this.activeSiteId = ''
      await dao.deleteSiteById(site._id)
      this.$message.success(`删除站点 ${site.name} 成功`)
      this.siteList = await dao.getSiteList()
      if (this.activeSiteId === '' && this.siteList.length > 0) this.activeSiteId = this.siteList[0]._id
    },
    onSiteClick (site) {
      console.log('onSiteClick', site)
      this.activeSiteId = site._id
    },
    async onSearch () {
      if (!this.search.text.trim()) {
        this.$message.error('请输入搜索内容')
        return
      }
      this.loading = true
      this.activeTab = 'search'
      const resp = await parser.search(this.search.text)
      console.log('parser.search', this.search.text, resp)
      this.comics.search.list = resp
      this.comics.search.pagination.current = 1
      this.loading = false
    },
    async onSearchLoadMore () {
      this.loading = true
      const resp = await parser.search(this.search.text, this.comics.search.pagination.current + 1)
      console.log('parser.search', this.search.text, this.comics.search.pagination.current, resp)
      if (resp.length > 0) ++this.comics.search.pagination.current
      this.comics.search.list = this.comics.search.list.concat(resp)
      this.loading = false
    },
    getSiteById (siteId) {
      for (let i = 0; i < this.siteList.length; ++i) {
        if (this.siteList[i]._id === siteId) return this.siteList[i]
      }
    },
    canSearch () {
      if (!this.activeSiteId) return
      const site = this.getSiteById(this.activeSiteId)
      return site.search.url.trim() && site.search.ruleId
    },
    toDetail (comic) {
      console.log('toDetail', comic)
      this.$router.push({
        path: '/comic-detail',
        query: {
          siteId: this.activeSiteId,
          onlineComic: JSON.stringify(comic)
          // 还可以加个localComic
        }
      })
    },
    async getList (listId) {
      if (!this.comics[listId] || this.comics[listId].list.length === 0) {
        this.loading = true
        const resp = await parser.getList(listId)
        console.log('parser.getList', listId, resp)
        this.$set(this.comics, listId, {
          list: resp,
          pagination: {
            current: 1
          }
        })
        this.loading = false
      }
    },
    async onListLoadMore (listId) {
      this.loading = true
      const resp = await parser.getList(listId, this.comics[listId].pagination.current + 1)
      if (resp.length > 0) ++this.comics[listId].pagination.current
      this.comics[listId].list = this.comics[listId].list.concat(resp)
      this.loading = false
    },
    async onTabChange (e) {
      console.log('onTabChange', e)
      if (e === 'search') return
      const listId = parseInt(e.split('-').pop())
      return this.getList(listId)
    }
  },
  async mounted () {
    console.log('SiteRules mounted', parser)
    this.siteList = await dao.getSiteList()
    if (this.siteList.length > 0) {
      this.activeSiteId = this.siteList[0]._id
      parser.setSite(this.siteList[0])
      const site = this.getSiteById(this.activeSiteId)
      if (site && site.list.length > 0) {
        this.activeTab = `list-${site.list[0].id}`
        await this.onTabChange(this.activeTab)
      }
    }
    console.log('SiteRules mounted', this.siteList)
  },
  watch: {
    async activeSiteId (to, from) {
      this.comics = { // init this.comics
        search: {
          list: [],
          pagination: {
            current: 1
          }
        }
      }
      const site = this.getSiteById(to)
      parser.setSite(site)
      if (site && site.list.length > 0) {
        this.activeTab = `list-${site.list[0].id}`
        await this.onTabChange(this.activeTab)
      } else {
        this.activeTab = 'search'
      }
    }
  }
}
</script>

<style scoped>
.background-none {
  background: none;
}
.site-list-item {
  cursor: pointer;
  padding: 5px 10px;
}
.site-list-item:hover {
  background: #F0F2F5;
}
.site-list-item:active {
  background-color: #EAECEF;
}
.site-list-item-active {
  background: #F0F2F5;
}
</style>
