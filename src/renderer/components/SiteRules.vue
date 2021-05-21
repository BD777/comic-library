<template>
  <div>
    <a-layout>
      <a-layout-content>
      </a-layout-content>
      <a-layout-sider style="background: #fff; height: 100vh;">
        <div style="margin: 20px 10px;">
          <div style="text-align: center;">
            <a-button type="link" icon="plus" @click="onAddSiteClick">新增站点</a-button>
          </div>
          <a-divider />
          <a-list item-layout="horizontal" :data-source="siteList" :locale="{ emptyText: '暂无数据' }">
            <a-list-item slot="renderItem" slot-scope="item" class="site-list-item">
              <span>{{ item.name }}</span>
              <span style="text-align: right">
                <a-dropdown :trigger="['click']">
                  <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                    <a-button type="link" icon="ellipsis" />
                  </a>
                  <div slot="overlay" style="padding: 5px; background: #FFF; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 4px;">
                    <a-button type="link" icon="edit" @click="onEditSite(item)" />
                    <a-divider type="vertical" style="margin: 0;" />
                    <a-popconfirm :title="`确定删除 ${item.name} ？`" ok-text="Yes" cancel-text="No">
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
import ComicParser from '../parser/index'
const dao = require('../dao').default

export default {
  name: 'site-rules',
  components: {},
  data () {
    return {
      siteList: []
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
    }
  },
  async mounted () {
    console.log('SiteRules mounted', ComicParser)
    this.siteList = await dao.getSiteList()
    console.log('SiteRules mounted', this.siteList)
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
</style>
