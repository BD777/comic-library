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
                <a-col :span="14"><a-input v-model="site.name" class="simple-input" /></a-col>
                <a-col :span="8">
                  <a-button type="link" @click="saveSiteConfig" icon="save">保存</a-button>
                  <a-button type="link" @click="exportSiteConfig" icon="export">导出</a-button>
                </a-col>
              </a-row>
            </a-form-model-item>

            <div class="form-item-card">
              <a-form-model-item label="搜索页 Url">
                <a-input v-model="site.search.url" class="simple-input" style="background: none;" />
              </a-form-model-item>
              <a-form-model-item label="对应列表页规则">
                <a-select v-model="site.search.ruleId" class="simple-select">
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
                  <a-select-option v-for="item in site.rules.list" :key="item.id" :value="item.id">
                    {{ item.rule.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
              <a-form-model-item label="是否执行js">
                <a-switch v-model="site.search.jsNeeded" />
              </a-form-model-item>
            </div>

            <div class="form-item-card">
              <a-form-model-item label="详情页 Url">
                <a-input v-model="site.detail.url" class="simple-input" style="background: none;" />
              </a-form-model-item>
              <a-form-model-item label="是否执行js">
                <a-switch v-model="site.detail.jsNeeded" />
              </a-form-model-item>
            </div>

            <div class="form-item-card">
              <a-form-model-item label="浏览页 Url">
                <a-input v-model="site.browse.url" class="simple-input" style="background: none;" />
              </a-form-model-item>
              <a-form-model-item label="是否执行js">
                <a-switch v-model="site.browse.jsNeeded" />
              </a-form-model-item>
            </div>

            <div style="margin-bottom: 20px;">
              <a-layout>
                <a-layout-sider style="background: none; padding: 20px 0; border-right: 1px solid rgb(221, 221, 221);">
                  <div style="text-align: center; margin-botton: 10px;">
                    <a-button type="link" icon="plus" @click="onAddListPageClick">新增列表页</a-button>
                  </div>
                  <a-list item-layout="horizontal" :data-source="site.list" :locale="{ emptyText: '暂无数据' }">
                    <a-list-item slot="renderItem" slot-scope="item" class="list-item hover-white" @click="onListPageClick(item)">
                      <span>{{ item.name }}</span>
                      <a-button type="link" icon="arrow-up" style="font-size: 0.9em;" @click="onListPageItemTop(item)" />
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
                    <a-select v-model="currentSiteList.ruleId" class="simple-select">
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
                      <a-select-option v-for="item in site.rules.list" :key="item.id" :value="item.id">
                        {{ item.rule.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-model-item>
                  <a-form-model-item label="是否执行js">
                    <a-switch v-model="currentSiteList.jsNeeded" />
                  </a-form-model-item>
                  <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }" style="margin-top: 10px;">
                    <a-button type="link" @click="saveSiteListPage" icon="save">保存</a-button>
                    <a-popconfirm :title="`确定删除 ${currentSiteList.name} ？`" ok-text="Yes" cancel-text="No" @confirm="onDeleteSiteListPage">
                      <a-button v-if="currentSiteList.id !== null" type="link" style="color: red;" ghost><a-icon type="delete" />删除</a-button>
                    </a-popconfirm>
                  </a-form-model-item>
                </a-layout-content>
              </a-layout>
            </div>

            <div class="form-item-card">
              <a-form-model-item label="Cookie">
                <a-input v-model="site.general.cookie" class="simple-input" style="background: none;" />
              </a-form-model-item>
              <a-form-model-item label="LocalStorage">
                <a-input v-model="site.general.localStorage" class="simple-input" style="background: none;" placeholder="key1:value1;key2:value2;..." />
              </a-form-model-item>
              <a-form-model-item label="Proxy">
                <a-switch v-model="site.general.proxy.enable" />
                <a-select :disabled="!site.general.proxy.enable" class="simple-select" v-if="site.general.proxy" v-model="site.general.proxy.protocol" style="margin-left: 10px; width: 120px; vertical-align: middle;" placeholder="协议">
                  <a-select-option value="http">
                    http
                  </a-select-option>
                  <a-select-option value="https">
                    https
                  </a-select-option>
                  <a-select-option value="socks5">
                    socks5
                  </a-select-option>
                </a-select>
                <a-input :disabled="!site.general.proxy.enable" v-model="site.general.proxy.host" placeholder="host" class="simple-input"  style="background: none; width: 200px; vertical-align: middle; margin-left: 10px;"/>
                <span> : </span>
                <a-input-number :disabled="!site.general.proxy.enable" :min="0" :max="65535" v-model="site.general.proxy.port" placeholder="port" class="simple-input"  style="background: none; width: 60; vertical-align: middle;" />
              </a-form-model-item>
            </div>
          </a-form-model>
        </a-tab-pane>

        <a-tab-pane key="list-page" tab="列表页">
          <a-layout>
            <a-layout-sider style="background: #fff;">
              <div style="text-align: center; margin-bottom: 10px; margin-right: 10px;">
                <a-button type="link" icon="plus" @click="onAddListRuleClick">新增规则</a-button>
              </div>
              <a-list item-layout="horizontal" :data-source="site.rules.list" :locale="{ emptyText: '暂无数据' }" :split="false">
                <a-list-item slot="renderItem" slot-scope="item" class="list-item" @click="onListRuleClick(item)">
                  <span>{{ item.rule.name }}</span>
                </a-list-item>
              </a-list>
            </a-layout-sider>
            <a-layout-content>
              <div style="padding: 10px;">
                <a-row :gutter="20">
                  <a-col :span="14"><a-input v-model="current.list.rule.name" class="simple-input" style="background: none;" placeholder="请输入规则名称" /></a-col>
                  <a-col :span="8">
                    <a-button type="primary" ghost @click="onSaveListRule"><a-icon type="save" />保存</a-button>
                    <a-popconfirm :title="`确定删除 ${current.list.rule.name} ？`" ok-text="Yes" cancel-text="No" @confirm="onDeleteListRule">
                      <a-button v-if="current.list.id !== null" type="danger" ghost><a-icon type="delete" />删除</a-button>
                    </a-popconfirm>
                  </a-col>
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
          <a-button type="link" icon="save" style="margin-bottom: 10px;" @click="onSaveDetailConfig">保存</a-button>
          <div style="background: #F0F2F5;">
            <site-rule-basic-form-card class="basic-form-card" title="标题" :value="current.detail.title" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="简介" :value="current.detail.intro" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="封面" :value="current.detail.cover" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="分类" :value="current.detail.category" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="作者" :value="current.detail.author" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="发布时间" :value="current.detail.pubTime" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="更新时间" :value="current.detail.updateTime" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="评分" :value="current.detail.rating" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="Likes" :value="current.detail.likes" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="Views" :value="current.detail.views" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="图片总数" :value="current.detail.imageCount" background-color="#F0F2F5" />
          </div>
          <a-divider>图片规则</a-divider>
          <div style="background: #F0F2F5;">
            <site-rule-basic-form-card style="margin-top: 3px;" title="Item" :value="current.detail.imageConfig.item" background-color="#F0F2F5" />
            <a-divider style="margin: 3px 0;" />
            <site-rule-basic-form-card class="basic-form-card" title="缩略图" :value="current.detail.imageConfig.thumbnail" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="URL" :value="current.detail.imageConfig.url" background-color="#F0F2F5" />
          </div>
          <a-divider>标签规则</a-divider>
          <div style="background: #F0F2F5;">
            <site-rule-basic-form-card style="margin-top: 3px;" title="Item" :value="current.detail.tagConfig.item" background-color="#F0F2F5" />
            <a-divider style="margin: 3px 0;" />
            <site-rule-basic-form-card class="basic-form-card" title="名称" :value="current.detail.tagConfig.name" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="URL" :value="current.detail.tagConfig.url" background-color="#F0F2F5" />
          </div>
          <a-divider>章节规则</a-divider>
          <div style="background: #F0F2F5;">
            <site-rule-basic-form-card style="margin-top: 3px;" title="Item" :value="current.detail.chapterConfig.item" background-color="#F0F2F5" />
            <a-divider style="margin: 3px 0;" />
            <site-rule-basic-form-card class="basic-form-card" title="ID Code" :value="current.detail.chapterConfig.idCode" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="标题" :value="current.detail.chapterConfig.title" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="更新日期" :value="current.detail.chapterConfig.updateTime" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="URL" :value="current.detail.chapterConfig.url" background-color="#F0F2F5" />
          </div>
        </a-tab-pane>

        <a-tab-pane key="browse-page" tab="浏览页">
          <a-button type="link" icon="save" style="margin-bottom: 10px;" @click="onSaveBrowseConfig">保存</a-button>
          <div style="background: #F0F2F5;">
            <site-rule-basic-form-card style="margin-top: 3px;" title="Item" :value="current.browse.item" background-color="#F0F2F5" />
            <a-divider style="margin: 3px 0;" />
            <site-rule-basic-form-card class="basic-form-card" title="图片" :value="current.browse.image" background-color="#F0F2F5" />
            <!-- <site-rule-basic-form-card class="basic-form-card" title="图片总数" :value="current.browse.imageCount" background-color="#F0F2F5" />
            <site-rule-basic-form-card class="basic-form-card" title="总页数" :value="current.browse.pageCount" background-color="#F0F2F5" /> -->
          </div>
        </a-tab-pane>

      </a-tabs>
    </div>
  </div>
</template>

<script>
import SiteRuleBasicFormCard from './SiteRuleBasicFormCard.vue'
const parser = require('../parser/index').default
const dao = require('../dao').default
const utils = require('../utils').default
const path = require('path')
const { remote } = require('electron')

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

      // 当前站点的所有信息，也是存在数据库里的结构
      site: {
        name: '',
        search: {
          url: '',
          ruleId: null,
          jsNeeded: false
        },
        detail: {
          url: '',
          jsNeeded: false
        },
        browse: {
          url: '',
          jsNeeded: false
        },
        list: [],
        general: {
          cookie: '',
          localStorage: '',
          proxy: {
            enable: false,
            protocol: 'http', // socks5, https
            host: '',
            port: 1080
          }
        },

        rules: {
          list: [], // 列表页 { rule: {}, id: 1 }
          // 下面就先简单搞只有一种页面形态的吧（偷懒）
          detail: Object.assign({}, parser.commonDetailConfig),
          browse: Object.assign({}, parser.commonBrowseConfig)
        }
      },

      // 站点设置 - 列表页
      currentSiteList: {
        id: null,
        name: '',
        url: '',
        ruleId: null,
        jsNeeded: false
      },

      // 后面三个规则相关的tab
      current: { // 当前规则，可以是新增也可以是查看当前的
        list: {
          rule: Object.assign({}, parser.commonListConfig),
          id: null // 如有，则是更新；否则是新增
        },
        detail: Object.assign({}, parser.commonDetailConfig),
        browse: Object.assign({}, parser.commonBrowseConfig)
      }
    }
  },
  methods: {
    onListPageItemTop (item) {
      // 站点设置 - 新增列表页 - 置顶
      for (let i = 0; i < this.site.list.length; ++i) {
        if (this.site.list[i].id === item.id) {
          this.site.list.splice(i, 1)
          this.site.list.splice(0, 0, item)
          this.saveSiteConfig()
          break
        }
      }
    },
    onListPageClick (item) {
      // 站点设置 - 新增列表页下的列表点击
      this.currentSiteList = Object.assign({}, item)
      console.log('onListPageClick', this.currentSiteList)
    },
    onDeleteSiteListPage () {
      // 站点设置 - 新增列表页 - 删除
      console.log('onDeleteSiteListPage')
      for (let i = 0; i < this.site.list.length; ++i) {
        if (this.site.list[i].id === this.currentSiteList.id) {
          this.site.list.splice(i, 1)
          break
        }
      }
      this.saveSiteConfig()
      this.currentSiteList = {
        id: null,
        name: '',
        url: '',
        ruleId: null,
        jsNeeded: false
      }
      this.site.list = [...this.site.list]
    },
    onAddListRuleClick () {
      // 列表页 新增规则
      this.current.list = {
        rule: Object.assign({}, parser.commonListConfig),
        id: null
      }
      console.log('onAddListRuleClick', this.current.list)
    },
    async onSaveListRule () {
      // 列表页 保存规则
      // 新增的话，手动分配site内唯一id，随手自增就好
      console.log('onSaveListRule', this.current.list)
      if (this.current.list.id !== null) {
        return this.updateListRule()
      } else {
        await this.addListRule()
        this.current.list = {
          rule: Object.assign({}, parser.commonListConfig),
          id: null
        }
      }
    },
    async onDeleteListRule () {
      console.log('onDeleteListRule', this.current.list)
      for (let i = 0; i < this.site.rules.list.length; ++i) {
        if (this.site.rules.list[i].id === this.current.list.id) {
          this.site.rules.list.splice(i, 1)
          break
        }
      }

      try {
        const resp = await dao.updateSiteById(this.site._id, this.site)
        console.log('更新结果', resp)
        // this.$message.success(`更新列表页规则 ${this.current.list.rule.name} 成功`)
        this.current.list = {
          rule: Object.assign({}, parser.commonListConfig),
          id: null
        }
      } catch (e) {
        // this.$message.error(`更新列表页规则 ${this.current.list.rule.name} 失败：${e}`)
      }
    },
    onAddListPageClick () {
      // 站点设置 -> 新增列表页
      this.currentSiteList = {
        id: null,
        name: '',
        url: '',
        ruleId: null,
        jsNeeded: false
      }
    },
    addRulesList () {
      // 跳转到列表页tab，并准备新增
      this.activeTab = 'list-page'
      this.current.list = {
        rule: Object.assign({}, parser.commonListConfig),
        id: null
      }
    },
    async saveSiteListPage () {
      // 保存 站点设置 -> 列表页
      if (!this.currentSiteList.name.trim()) {
        this.$message.error('请输入列表页名称')
        return
      }
      if (this.currentSiteList.id) {
        // update
        for (let i = 0; i < this.site.list.length; ++i) {
          if (this.site.list[i].id === this.currentSiteList.id) {
            this.site.list[i] = Object.assign({}, this.currentSiteList)
          }
        }
      } else {
        // add
        let id = 0
        this.site.list.forEach(d => {
          id = id > d.id ? id : d.id
        })
        ++id
        this.currentSiteList.id = id
        this.site.list.push(Object.assign({}, this.currentSiteList))
      }
      this.saveSiteConfig()
      this.currentSiteList = {
        id: null,
        name: '',
        url: '',
        ruleId: null,
        jsNeeded: false
      }
      this.site.list = [...this.site.list]
    },
    async updateListRule () {
      // 检验名称是否唯一
      console.log('updateListRule', this.current.list)
      this.current.list.rule.name = this.current.list.rule.name.trim()
      if (!this.current.list.rule.name) {
        this.$message.error('请输入规则名称')
        return
      }
      for (let i = 0; i < this.site.rules.list.length; ++i) {
        const rule = this.site.rules.list[i]
        if (rule.id !== this.current.list.id && rule.rule.name === this.current.list.rule.name) {
          this.$message.error(`列表页规则名称 ${this.current.list.rule.name} 已存在，请更换其他名称`)
          return
        }
      }

      for (let i = 0; i < this.site.rules.list.length; ++i) {
        const rule = this.site.rules.list[i]
        if (rule.id === this.current.list.id) {
          this.site.rules.list[i] = Object.assign({}, this.current.list)
        }
      }

      const now = new Date()
      this.site.updateTime = now
      console.log('即将更新列表页规则', this.site)
      try {
        const resp = await dao.updateSiteById(this.site._id, this.site)
        console.log('更新结果', resp)
        this.$message.success(`更新列表页规则 ${this.current.list.rule.name} 成功`)
      } catch (e) {
        this.$message.error(`更新列表页规则 ${this.current.list.rule.name} 失败：${e}`)
      }
    },
    async addListRule () {
      console.log('addListRule', this.current.list, this.current.list.rule.name)
      this.current.list.rule.name = this.current.list.rule.name.trim()
      if (!this.current.list.rule.name) {
        this.$message.error('请输入规则名称')
        return
      }
      for (let i = 0; i < this.site.rules.list.length; ++i) {
        const rule = this.site.rules.list[i]
        if (rule.rule.name === this.current.list.rule.name) {
          this.$message.error(`列表页规则名称 ${this.current.list.rule.name} 已存在，请更换其他名称`)
          return
        }
      }

      let id = 0
      this.site.rules.list.forEach(d => {
        id = id > d.id ? id : d.id
      })
      ++id
      console.log('addListRule 新id', this.site.rules.list, id)
      this.current.list.id = id

      this.site.rules.list.push(Object.assign({}, this.current.list))

      const now = new Date()
      this.site.updateTime = now
      console.log('即将添加列表页规则', this.site)
      try {
        const resp = await dao.updateSiteById(this.site._id, this.site)
        console.log('添加结果', resp)
        this.$message.success(`添加列表页规则 ${this.current.list.rule.name} 成功`)
      } catch (e) {
        this.$message.error(`添加列表页规则 ${this.current.list.rule.name} 失败：${e}`)
      }
    },
    async saveSiteConfig () {
      // 保存 站点配置
      if (this.siteId.trim()) {
        // updateSite
        return this.updateSite()
      } else {
        await this.addSite()
        // 这样返回的时候会多一层，不妥
        // this.$router.push({
        //   query: {
        //     name: this.site.name
        //   }
        // })
        await this.initByName(this.site.name)
      }
    },
    async updateSite () {
      this.site.name = this.site.name.trim()
      if (!this.site.name) {
        this.$message.error('请输入站点名称')
        return
      } else {
        const sites = await dao.getSiteRuleByName(this.site.name)
        console.log('updateSite getSiteRuleByName', this.site.name, sites)
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
        this.$message.success(`更新站点 ${this.site.name} 成功`)
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
    },
    onListRuleClick (rule) {
      // 列表页 - 左边规则列表点击
      console.log('onListRuleClick', rule, this.site.rules.list)
      this.current.list = rule
    },
    async initByName (name) {
      this.name = name
      const siteList = await dao.getSiteRuleByName(this.name)
      console.log('initByName getSiteRuleByName', this.name, siteList)
      if (siteList.length > 0) {
        const site = siteList[0]
        this.siteId = site._id
        this.name = site.name
        // TODO 还要把其他表单填一下
        if (!site.general.proxy) {
          site.general.proxy = {
            enable: false,
            protocol: 'http', // socks5, https
            host: '',
            port: 1080
          }
        }
        // this.site = site
        Object.assign(this.site, site)

        this.current.detail = Object.assign(this.current.detail, this.site.rules.detail)
        this.current.browse = Object.assign(this.current.browse, this.site.rules.browse)
      }
    },
    async onSaveDetailConfig () {
      this.site.rules.detail = Object.assign({}, this.current.detail)

      const now = new Date()
      this.site.updateTime = now
      console.log('即将更新详情页规则', this.site)
      try {
        const resp = await dao.updateSiteById(this.site._id, this.site)
        console.log('更新结果', resp)
        this.$message.success(`更新详情页规则成功`)
      } catch (e) {
        this.$message.error(`更新详情页规则失败：${e}`)
      }
    },
    async onSaveBrowseConfig () {
      this.site.rules.browse = Object.assign({}, this.current.browse)

      const now = new Date()
      this.site.updateTime = now
      console.log('即将更新浏览页规则', this.site)
      try {
        const resp = await dao.updateSiteById(this.site._id, this.site)
        console.log('更新结果', resp)
        this.$message.success(`更新浏览页规则成功`)
      } catch (e) {
        this.$message.error(`更新浏览页规则失败：${e}`)
      }
    },
    async exportSiteConfig () {
      const result = await await remote.dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (!result) return
      const savePath = result[0]
      console.log('savePath', savePath)
      return utils.fs.promises.writeFile(
        path.join(savePath, `[ComicLibrarySite]${this.site.name}.json`),
        JSON.stringify(this.site, null, 2)
      )
    }
  },
  async mounted () {
    const query = this.$route.query
    console.log('SiteRulesDetail mounted', query)
    if (query.name) {
      this.initByName(query.name)
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

.ant-input-number-focused {
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

.list-item {
  cursor: pointer;
  padding: 5px 10px;
  margin-right: 10px;
}

.list-item > span {
  margin: auto;
}

.list-item:hover {
  background-color: #F0F2F5;
}

.list-item:active {
  background-color: #EAECEF;
}

</style>
