<template>
  <!-- 规则详情 -->
  <div>
    <a-page-header
      style="background: rgb(235, 237, 240);"
      title="页面规则"
      @back="() => $router.go(-1)"
    />

    <div class="card-container">
      <a-tabs type="card" v-model="activeTab">

        <a-tab-pane key="site-setting" tab="站点设置">
          <a-form-model :model="site" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
            <a-form-model-item label="站点名称" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
              <a-row :gutter="10">
                <a-col :span="20"><a-input v-model="site.name" class="simple-input" /></a-col>
                <a-col :span="4"><a-button type="link" @click="saveSiteConfig" icon="save">保存</a-button></a-col>
              </a-row>
            </a-form-model-item>

            <div class="form-item-card">
              <a-form-model-item label="搜索页 Url">
                <a-input v-model="site.search.url" class="simple-input" style="background: none;" />
              </a-form-model-item>
              <a-form-model-item label="对应列表页规则">
                <a-select v-model="site.search.rule" class="simple-select">
                  <div slot="dropdownRender" slot-scope="menu">
                    <v-nodes :vnodes="menu" />
                    <a-divider style="margin: 4px 0;" />
                    <div
                      style="padding: 4px 8px; cursor: pointer;"
                      @mousedown="e => e.preventDefault()"
                      @click="addRulesList"
                    >
                      <a-icon type="plus" /> Add item
                    </div>
                  </div>
                  <a-select-option v-for="item in site.rules.list" :key="item" :value="item.name">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </div>

            <div class="form-item-card">
              <a-form-model-item label="详情页 Url">
                <a-input v-model="site.detail.url" class="simple-input" style="background: none;" />
              </a-form-model-item>
            </div>

            <div class="form-item-card">
              <a-form-model-item label="浏览页 Url">
                <a-input v-model="site.browse.url" class="simple-input" style="background: none;" />
              </a-form-model-item>
            </div>

            <div style="margin-bottom: 20px;">
              <a-layout>
                <a-layout-sider style="background: none; padding: 20px 0; border-right: 1px solid rgb(221, 221, 221);">
                  <div style="text-align: center; margin-botton: 10px;">
                    <a-button type="link" icon="plus" @click="onAddListPageClick">新增列表页</a-button>
                  </div>
                  <a-list item-layout="horizontal" :data-source="site.list" :locale="{ emptyText: '暂无数据' }">
                    <a-list-item slot="renderItem" slot-scope="item">
                      {{ item.name }}
                    </a-list-item>
                  </a-list>
                </a-layout-sider>
                <a-layout-content class="form-item-card">
                  <a-form-model-item label="列表页名称">
                    <a-input v-model="currentSiteList.name" class="simple-input" style="background: none;" />
                  </a-form-model-item>
                  <a-form-model-item label="列表页 Url">
                    <a-input v-model="currentSiteList.url" class="simple-input" style="background: none;" />
                  </a-form-model-item>
                  <a-form-model-item label="对应列表页规则">
                    <a-select v-model="currentSiteList.rule" class="simple-select">
                      <div slot="dropdownRender" slot-scope="menu">
                        <v-nodes :vnodes="menu" />
                        <a-divider style="margin: 4px 0;" />
                        <div
                          style="padding: 4px 8px; cursor: pointer;"
                          @mousedown="e => e.preventDefault()"
                          @click="addRulesList"
                        >
                          <a-icon type="plus" /> Add item
                        </div>
                      </div>
                      <a-select-option v-for="item in site.rules.list" :key="item" :value="item.name">
                        {{ item.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-model-item>
                  <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }" style="margin-top: 10px;">
                    <a-button type="link" @click="saveSiteListPage" icon="save">保存</a-button>
                  </a-form-model-item>
                </a-layout-content>
              </a-layout>
            </div>

            <div class="form-item-card">
              <a-form-model-item label="Cookie">
                <a-input v-model="site.general.cookie" class="simple-input" style="background: none;" />
              </a-form-model-item>
            </div>
          </a-form-model>
        </a-tab-pane>

        <a-tab-pane key="list-page" tab="列表页">
          <a-layout>
            <a-layout-sider style="background: #fff;">
              <div style="text-align: center; margin-botton: 10px;">
                <a-button type="link" icon="plus" @click="onAddRuleClick">新增规则</a-button>
              </div>
              <a-list item-layout="horizontal" :data-source="site.rules.list" :locale="{ emptyText: '暂无数据' }">
                <a-list-item slot="renderItem" slot-scope="item">
                  {{ item.name }}
                </a-list-item>
              </a-list>
            </a-layout-sider>
            <a-layout-content>
              <div style="padding: 10px;">
                <a-row :gutter="20">
                  <a-col :span="20"><a-input class="simple-input" style="background: none;" placeholder="请输入规则名称" /></a-col>
                  <a-col :span="4"><a-button type="primary" ghost><a-icon type="save" />保存</a-button></a-col>
                </a-row>
                <site-rule-basic-form-card style="margin-top: 3px;" title="Item" :value="current.list.rule.item" background-color="#F0F2F5" />
                <a-divider style="margin: 3px 0;" />
                <site-rule-basic-form-card class="basic-form-card" title="ID Code" :value="current.list.rule.idCode" background-color="#F0F2F5" />
                <site-rule-basic-form-card class="basic-form-card" title="标题" :value="current.list.rule.title" background-color="#F0F2F5" />
                <site-rule-basic-form-card class="basic-form-card" title="封面" :value="current.list.rule.cover" background-color="#F0F2F5" />
                <site-rule-basic-form-card class="basic-form-card" title="作者" :value="current.list.rule.author" background-color="#F0F2F5" />
                <site-rule-basic-form-card class="basic-form-card" title="发布时间" :value="current.list.rule.pubTime" background-color="#F0F2F5" />
                <site-rule-basic-form-card class="basic-form-card" title="更新时间" :value="current.list.rule.updateTime" background-color="#F0F2F5" />
                <site-rule-basic-form-card class="basic-form-card" title="评分" :value="current.list.rule.rating" background-color="#F0F2F5" />
                <site-rule-basic-form-card class="basic-form-card" title="Likes" :value="current.list.rule.likes" background-color="#F0F2F5" />
                <site-rule-basic-form-card class="basic-form-card" title="Views" :value="current.list.rule.views" background-color="#F0F2F5" />
                <site-rule-basic-form-card class="basic-form-card" title="图片总数" :value="current.list.rule.imageCount" background-color="#F0F2F5" />
              </div>
            </a-layout-content>
          </a-layout>
        </a-tab-pane>

        <a-tab-pane key="detail-page" tab="详情页">
          <p>Content of Tab Pane 3</p>
          <p>Content of Tab Pane 3</p>
          <p>Content of Tab Pane 3</p>
        </a-tab-pane>

        <a-tab-pane key="browse-page" tab="浏览页">
        </a-tab-pane>

      </a-tabs>
    </div>
  </div>
</template>

<script>
import SiteRuleBasicFormCard from './SiteRuleBasicFormCard.vue'
import { commonListConfig } from '../parser/index'
const dao = require('../dao').default

export default {
  name: 'site-rules-detail',
  components: {
    SiteRuleBasicFormCard,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes
    }
  },
  data () {
    return {
      activeTab: 'site-setting',
      name: '',
      siteId: '', // 如有，则是更新；否则是新增

      site: {
        name: '',
        search: {
          url: '',
          rule: ''
        },
        detail: {
          url: ''
        },
        browse: {
          url: ''
        },
        list: [],
        general: {
          cookie: ''
        },

        rules: {
          list: [] // 列表页
          // 后面还有别的
        }
      },
      currentSiteList: {
        name: '',
        url: '',
        rule: '',
        id: null // 如果id为空，则是新增，否则是更新
      },

      current: { // 当前规则，可以是新增也可以是查看当前的
        list: {
          rule: Object.assign({}, commonListConfig),
          id: null // 如果id为空，则是新增，否则是更新
        },
        detail: {},
        browse: {}
      }
    }
  },
  methods: {
    onAddRuleClick () {
      // 列表页 新增规则
    },
    onAddListPageClick () {
      // 站点设置 -> 新增列表页
    },
    addRulesList () {
      this.activeTab = 'list-page'
    },
    saveSiteListPage () {
      // 保存 站点设置 -> 列表页
    },
    async saveSiteConfig () {
      // 保存 站点配置
      if (this.siteId.trim()) {
        // updateSite
        return this.updateSite()
      } else {
        return this.addSite()
      }
    },
    async updateSite () {
      this.site.name = this.site.name.trim()
      if (!this.site.name) {
        this.$message.error('请输入站点名称')
        return
      } else {
        const sites = await dao.getSiteRuleByName(this.site.name)
        let exists = false
        for (let i = 0; i < sites.length; ++i) {
          if (sites[i]._id !== this.site._id) {
            exists = true
            break
          }
        }
        if (exists) {
          this.$message.error(`站点名称 ${this.site.name} 已存在，请更换其他名称`)
          return
        }
      }

      const now = new Date()
      this.site.updateTime = now
      console.log('即将更新站点', this.site)
      try {
        const resp = await dao.updateSiteById(this.site._id, this.site)
        console.log('更新结果', resp)
        this.$message.success(`添更新站点 ${this.site.name} 成功`)
      } catch (e) {
        this.$message.error(`更新站点 ${this.site.name} 失败：${e}`)
      }
    },
    async addSite () {
      this.site.name = this.site.name.trim()
      if (!this.site.name) {
        this.$message.error('请输入站点名称')
        return
      } else {
        const site = await dao.getSiteRuleByName(this.site.name)
        if (site.length > 0) {
          this.$message.error(`站点名称 ${this.site.name} 已存在，请更换其他名称`)
          return
        }
      }

      const now = new Date()
      this.site.updateTime = now
      this.site.createTime = now
      console.log('即将添加站点', this.site)
      try {
        const resp = await dao.insertSiteRule(this.site)
        console.log('添加结果', resp)
        this.$message.success(`添加站点 ${this.site.name} 成功`)
      } catch (e) {
        this.$message.error(`添加站点 ${this.site.name} 失败：${e}`)
      }
    }
  },
  async mounted () {
    const query = this.$route.query
    console.log('SiteRulesDetail mounted', query)
    if (query.name) {
      this.name = query.name
      const siteList = await dao.getSiteRuleByName(this.name)
      console.log('mounted getSiteRuleByName', this.name, siteList)
      if (siteList.length > 0) {
        const site = siteList[0]
        this.siteId = site._id
        this.name = site.name
        // TODO 还要把其他表单填一下
        this.site = site
      }
    }
  }
}
</script>

<style>
.card-container {
  /* background: #f5f5f5; */
  overflow: hidden;
  padding: 24px;
}

.card-container > .ant-tabs-card > .ant-tabs-content {
  /* height: 120px; */
  margin-top: -16px;
}

.card-container > .ant-tabs-card > .ant-tabs-content > .ant-tabs-tabpane {
  background: #fff;
  padding: 16px;
}

.card-container > .ant-tabs-card > .ant-tabs-bar {
  border-color: #fff;
}

.card-container > .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  border-color: transparent;
  background: transparent;
}

.card-container > .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
  border-color: #fff;
  background: #fff;
}

.simple-input {
  border: 0;
  border-bottom: solid 1px #ddd;
  border-radius: 0;
}

.simple-input:focus {
  box-shadow: none;
  border-bottom: solid 1px #40a9ff;
}

.basic-form-card {
  display: inline-block;
}

.simple-select > .ant-select-selection {
  border: 0;
  border-bottom: solid 1px #ddd;
  border-radius: 0;
  background: none;
}

.simple-select.ant-select-open > .ant-select-selection {
  box-shadow: none;
  border-bottom: solid 1px #40a9ff;
}

.simple-select.ant-select-focused .ant-select-selection, .simple-select .ant-select-selection:focus, .simple-select .ant-select-selection:active {
  box-shadow: none;
  border-bottom: solid 1px #40a9ff;
}

.form-item-card {
  background-color: #F0F2F5;
  border: none;
  padding: 20px 0 25px 0;
  margin-bottom: 20px;
}

.form-item-card > .ant-form-item {
  margin-bottom: 0;
}
</style>
