<template>
  <div>
    <a-layout>
      <a-layout-header class="header">
        <a-row type="flex" justify="space-around" align="middle">
          <a-col :span="4">
            <a-button type="primary" ghost @click="onAddComicClick">
              <a-icon type="plus" />
              <span>添加</span>
            </a-button>
          </a-col>
          <a-col :span="20">
            <div style="display:flex;justify-content:center;align-items:center">
              <a-input-group compact>
                <a-select v-model="search.type">
                  <a-select-option value="title">
                    标题
                  </a-select-option>
                  <a-select-option value="author">
                    作者
                  </a-select-option>
                  <a-select-option value="desc">
                    简介
                  </a-select-option>
                  <a-select-option value="tags">
                    标签
                  </a-select-option>
                </a-select>
                <a-input-search style="width: 50%" v-model="search.text" enter-button @search="onSearch" placeholder="搜索" />
              </a-input-group>
            </div>
          </a-col>
        </a-row>
      </a-layout-header>
      <a-layout-content class="content">
        <Waterfall
         :list="comics"
         :gutter="10"
         :width="240"
         :breakpoints="{
            4000: { //当屏幕宽度小于等于1200
              rowPerView: 10,
            },
            2200: { //当屏幕宽度小于等于1200
              rowPerView: 8,
            },
            1600: { //当屏幕宽度小于等于1200
              rowPerView: 6,
            },
            1200: { //当屏幕宽度小于等于1200
              rowPerView: 4,
            },
            800: { //当屏幕宽度小于等于800
              rowPerView: 3,
            },
            500: { //当屏幕宽度小于等于500
              rowPerView: 2,
            },
            300: { //当屏幕宽度小于等于500
              rowPerView: 1,
            }
          }"
          backgroundColor="none"
          ref="waterfall"
        >
          <template slot="item" slot-scope="comic">
            <ComicCard
             :comic="comic.data"
             editable
             deletable
             @edit="editComic"
             @click="toRead"
             @delete="deleteComic"
            />
          </template>
        </Waterfall>

        <a-pagination
          style="margin: 10px; float: right;"
          v-model="pagination.current"
          :total="pagination.total"
          :show-total="(total, range) => `${range[0]}-${range[1]} of ${total} items`"
          @change="getComicList"
        />
      </a-layout-content>
    </a-layout>

    <a-modal
      title="添加本地目录"
      :visible="showAddModal"
      :confirm-loading="confirmLoading"
      @ok="onAddOk"
      @cancel="onAddCancel"
      width="80%"
      :ok-button-props="okButtonProps"
    >
      <a-row align="top" :gutter="10">
        <a-col :span="18">
          <div style="display: flex; align-items: center;">
            <div style="">
              <a-button type="primary" @click="selectPath">
                <a-icon type="folder-open" />
                <span>选择目录</span>
              </a-button>
            </div>
            <div style="padding-left: 10px;"><span class="text-line-2">{{ addForm.path }}</span></div>
          </div>
          <a-alert style="margin-top: 10px;" v-if="hadExistedMessage" :message="hadExistedMessage" type="error" show-icon />

          <a-form-model style="margin-top: 30px;" :model="addForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" label-align="left" layout="vertical">
            <a-form-model-item class="form-item" label="标题">
              <a-input v-model="addForm.title" />
            </a-form-model-item>
            <a-form-model-item class="form-item" label="作者">
              <a-input v-model="addForm.author" />
            </a-form-model-item>
            <a-form-model-item class="form-item" label="简介">
              <a-textarea  v-model="addForm.desc" />
            </a-form-model-item>
            <a-form-model-item class="form-item" label="标签">
              <a-select v-model="addForm.tags" mode="tags" style="width: 100%">
                <a-select-option v-for="tag in allTags" :key="tag">
                  {{ tag }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-form-model>

        </a-col>
        <a-col :span="6" style="text-align: center;">
          <img v-if="addForm.cover" :src="addForm.coverBlobUrl" class="cover" />
          <a-button v-if="addForm.cover" style="margin-top: 10px" type="primary" ghost @click="selectCover">
            <a-icon type="picture" />
            <span>选择封面</span>
          </a-button>
        </a-col>
      </a-row>
      
    </a-modal>
  </div>
</template>

<script>
import Waterfall from '../thirdparty-lib/vue-waterfall-plugin/Waterfall'
import ComicCard from './ComicCard.vue'

const path = require('path')
const { remote } = require('electron')
const utils = require('../utils').default
const dao = require('../dao').default

export default {
  name: 'my-library',
  components: {
    Waterfall,
    ComicCard
  },
  data () {
    return {
      showAddModal: false,
      confirmLoading: false,

      addForm: {
        path: '',
        cover: '',
        coverBlobUrl: '',

        title: '',
        author: '',
        desc: '',
        tags: [],

        id: '' // 编辑的话有这一项
      },
      isEdit: false,
      okButtonProps: {
        props: {
          disabled: false
        }
      },

      allTags: [],
      hadExistedMessage: '',

      search: {
        text: '',
        type: 'title'
      },
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      comics: [],

      itemWidth: 240,
      gutterWidth: 10,
      waterfallCol: 4
    }
  },
  computed: {
  },
  methods: {
    calcWaterfallCol () {
      // console.log('waterfallCol computer', document.documentElement.clientWidth)
      const maxCol = 10
      for (let i = 1; i <= maxCol; ++i) {
        let width = i * this.itemWidth + (i - 1) * this.gutterWidth + 20 + 17 + 70 // 滚动条？再留点buffer好了
        if (width > document.documentElement.clientWidth) {
          if (i === 1) return i
          else return i - 1
        }
      }
      return maxCol
    },
    async getAllTags () {
      const tags = await dao.getAllTags()
      console.log(tags)
      this.allTags = tags.map(d => d.tag)
    },
    async getComicList () {
      const comics = await dao.searchComics(this.search.type, this.search.text, this.pagination.current, this.pagination.pageSize)
      console.log(comics)
      this.comics = comics
      let query = dao.genSearchComicsQuery(this.search.type, this.search.text)
      console.log(query)
      this.pagination.total = await dao.getComicsCount(query)
    },
    onAddComicClick () {
      this.isEdit = false
      this.showAddModal = true
    },
    onSearch (e) {
      console.log('onSearch', this.search)
      this.search.text = this.search.text || this.search.text.trim()
      // this.$message.info('未实现')
      this.pagination.current = 1
      this.getComicList()
    },
    async onAddOk (e) {
      console.log('onAddOk', e, this.addForm)
      this.confirmLoading = true
      const form = this.addForm

      var onSuccess = () => {
        this.addForm.title = ''
        this.addForm.author = ''
        this.addForm.desc = ''
        this.addForm.tags = []
        this.getComicList()
        this.getAllTags()
      }

      if (!this.isEdit) { // 更新和添加复用同一个modal
        try {
          const resp = await dao.insertComic(form.path, form.title, form.author, form.desc, form.cover, form.tags)
          console.log(resp)
          this.$message.success(`添加成功：${form.title}`)
          onSuccess()
          this.showAddModal = false
        } catch (e) {
          if (e.errorType === 'uniqueViolated') {
            this.$message.error(`添加失败：该目录已存在`)
          } else {
            console.error(e)
            this.$message.error(`添加失败：${e}`)
          }
        }
      } else {
        try {
          const comic = {
            path: form.path,
            title: form.title,
            author: form.author,
            desc: form.desc,
            cover: form.cover,
            tags: form.tags
          }
          const numReplaced = await dao.updateComicById(form.id, comic)
          if (numReplaced > 0) {
            this.$message.success(`更新成功：${comic.title}`)
            onSuccess()
            this.showAddModal = false
          } else {
            this.$message.error(`更新失败：找不到ID ${form.id}`)
          }
        } catch (e) {
          this.$message.error(`更新失败：${e}`)
          console.error(e)
        }
      }
      this.confirmLoading = false
    },
    onAddCancel () {
      this.showAddModal = false
    },
    async selectPath () {
      console.log('selectPath')

      const result = await await remote.dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (!result) return
      this.addForm.path = result[0]

      const existComics = await dao.getComicByPath(this.addForm.path)
      if (existComics.length > 0) {
        this.hadExistedMessage = `该路径已被添加过，不能重复添加`
        this.okButtonProps.props.disabled = true
      } else {
        this.hadExistedMessage = false
        this.okButtonProps.props.disabled = false
      }

      const imagePath = await utils.getFirstImageInPath(this.addForm.path)
      if (imagePath) {
        this.addForm.cover = imagePath
        // this.addForm.coverBlobUrl = window.URL.createObjectURL(await utils.fileToBlob(this.addForm.cover))
        this.addForm.coverBlobUrl = `file://${this.addForm.cover}`
        this.addForm.title = path.basename(this.addForm.path)
      } else {
        this.addForm.cover = ''
        this.addForm.coverBlobUrl = ''
      }

      return result
    },
    async selectCover () {
      const result = await await remote.dialog.showOpenDialog({
        defaultPath: this.addForm.path,
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'bmp'] }
        ]
      })
      console.log(result)
      this.addForm.cover = result[0]
      this.addForm.coverBlobUrl = window.URL.createObjectURL(await utils.fileToBlob(this.addForm.cover))
    },
    async deleteComic (comic) {
      console.log('deleteComic', comic)
      const numRemoved = await dao.deleteComicById(comic._id)
      if (numRemoved > 0) {
        this.$message.success(`成功删除 ${numRemoved} 个`)
        this.getComicList()
      } else {
        this.$message.error(`删除失败`)
      }
    },
    editComic (comic) {
      console.log('editComic', comic)
      this.isEdit = true
      this.addForm.path = comic.path
      this.addForm.cover = comic.cover
      this.addForm.coverBlobUrl = 'file://' + comic.cover
      this.addForm.title = comic.title
      this.addForm.author = comic.author
      this.addForm.desc = comic.desc
      this.addForm.tags = comic.tags
      this.addForm.id = comic._id
      this.showAddModal = true
    },
    toRead (comic) {
      this.$router.push({
        path: '/reading',
        query: comic
      })
    }
  },
  async mounted () {
    console.log('MyLibrary mounted', process.versions, utils)
    await this.getAllTags()
    await this.getComicList()

    // window.onresize = () => {
    //   this.waterfallCol = this.calcWaterfallCol()
    // }
    // this.waterfallCol = this.calcWaterfallCol()
  },
  watch: {
    // waterfallCol (to, from) {
    //   this.$waterfall.forceUpdate()
    // }
  }
}
</script>

<style scoped>
.header {
  background: none;
}
.content {
  background: none;
}
.cover {
  width: 100%;
}
.text-line-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.text-line-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.form-item {
  margin-bottom: 10px;
}
.card-box {
  display: flex;
  align-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  flex-direction: row;
}
</style>
