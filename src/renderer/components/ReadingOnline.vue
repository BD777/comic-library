<template>
  <div>
    <a-layout>
      <a-layout-content :style="{ background: '#262626', height: '100vh', 'text-align': 'center' }">
        <a-progress
         type="circle"
         :percent="progress.percent"
         class="loading-process"
         :width="70"
         :strokeWidth="9"
         :format="percent => `${progress.current} / ${progress.total}`"
         v-if="progress.show"
        />
        <!-- 这里要分不同的阅读方式：双页（左右/右左）、单页、滚动，以及双页情况下首页是否空白 -->
        <div ref="image-box" style="width: inherit; height: inherit;">
          <template v-if="comicSetting.readingMode === 'single'">
            <div style="display:flex;justify-content:center;align-items:center;height:inherit;">
              <img v-if="current.index < current.images.length" v-lazy="current.images[current.index]" class="image-single-mode" />
            </div>
          </template>
          <template v-else-if="comicSetting.readingMode === 'left-right'">
            <div style="display:flex;justify-content:center;align-items:center;height:inherit;">
              <template v-if="current.index === 0 && comicSetting.firstPageEmpty">
                <img v-if="current.index < current.images.length" v-lazy="current.images[current.index]" class="image-single-mode" />
              </template>
              <template v-else>
                <img v-if="current.index < current.images.length" v-lazy="current.images[current.index]" class="image-double-mode" />
                <img v-if="current.index + 1 < current.images.length" v-lazy="current.images[current.index + 1]" class="image-double-mode" />
              </template>
            </div>
          </template>
          <template v-else-if="comicSetting.readingMode === 'right-left'">
            <div style="display:flex;justify-content:center;align-items:center;height:inherit;">
              <template v-if="current.index === 0 && comicSetting.firstPageEmpty">
                <img v-if="current.index < current.images.length" v-lazy="current.images[current.index]" class="image-single-mode" />
              </template>
              <template v-else>
                <img v-if="current.index + 1 < current.images.length" v-lazy="current.images[current.index + 1]" class="image-double-mode" />
                <img v-if="current.index < current.images.length" v-lazy="current.images[current.index]" class="image-double-mode" />
              </template>
            </div>
          </template>
          <template v-else-if="comicSetting.readingMode === 'scroll'">
            <div style="text-align: center;">
              <img
                v-for="(src, i) in current.images"
                :key="src"
                v-lazy="src"
                width="80%"
                :ref="`scroll-image-${i}`"
              />
            </div>
          </template>
        </div>
      </a-layout-content>
      <a-layout-sider :style="{ overflow: 'auto', height: '100vh', background: '#535353' }">
        <div v-if="current.images.length > 0">
          <img
            v-for="(src, i) in current.images"
            :key="src"
            v-lazy="src"
            :ref="`preview-image-${i}`"
            width="100%"
            :class="`image-preview ${i === current.index ? 'active' : 'inactive'}`"
            @click="onPreviewClick(i)"
          />
        </div>
      </a-layout-sider>
    </a-layout>

    <div class="control-panel">
      <a-button type="dashed" @click='drawerVisible = true'>
        <a-icon type="align-right" />
        <span>章节</span>
      </a-button>
      <a-radio-group style="margin-left: 15px;" v-model="comicSetting.readingMode" button-style="solid" @change="onReadingModeChange">
        <a-radio-button value="single">
          单页
        </a-radio-button>
        <a-radio-button value="left-right">
          左右
        </a-radio-button>
        <a-radio-button value="right-left">
          右左
        </a-radio-button>
        <a-radio-button value="scroll">
          滑动
        </a-radio-button>
      </a-radio-group>

      <a-switch
       style="margin-left: 15px;"
       checked-children="有首页"
       un-checked-children="无首页"
       v-model="comicSetting.firstPageEmpty"
       @change="onFirstPageEmptyChange"
       :disabled="comicSetting.readingMode === 'single' || comicSetting.readingMode === 'scroll'"
      >
      </a-switch>
    </div>

    <a-drawer
      title="章节"
      placement="right"
      :closable="false"
      :visible="drawerVisible"
      @close="drawerVisible = false"
    >
      <p
       v-for="(d, i) in comicDetail.chapterConfig"
       :key="i"
       :class="`chapter-item ${d.title === current.chapterName ? 'chapter-active' : ''}`"
       @click="onChapterClick(d, i)"
      >
       {{ d.title }}
      </p>
    </a-drawer>
  </div>
</template>

<script>
const parser = require('../parser/index').default
const utils = require('../utils').default
const dao = require('../dao').default

export default {
  name: 'reading-online',
  components: {},
  data () {
    return {
      comic: {},
      comicSetting: {
        comicId: '',
        readingMode: 'single',
        firstPageEmpty: false,

        chapterName: '',
        index: 0 // 当前浏览到的下标
      },

      current: {
        chapterName: '',
        images: [],
        index: 0 // 当前浏览到的下标
      },

      drawerVisible: false,

      // 这里做本地和在线相统一，默认本地，可以切换为在线
      siteId: '', // 在线，如有
      site: {}, // 根据上面siteId拿到的，如有
      idCode: '', // 当前在线漫画的idCode
      localId: '', // 本地

      chapter: {}, // 所选章节
      comicDetail: {}, // 漫画详情
      // comicBrowse: [], // 漫画内容，图片之类的 // 直接设置到current.images里
      progress: {
        show: true,
        total: 0,
        current: 0,
        percent: 0
      },

      globalSetting: {}
    }
  },
  methods: {
    async getComicSetting () {
      this.comicSetting = await dao.getComicSetting(this.comic._id)
      console.log('comicSetting', this.comicSetting)
      if (this.comicSetting.chapterName && !this.current.chapterName) {
        this.current.chapterName = this.comicSetting.chapterName
      }
      if (this.comicSetting.index) this.current.index = this.comicSetting.index
    },
    onPreviewClick (index) {
      this.current.index = index
      if (this.comicSetting.readingMode === 'left-right' || this.comicSetting.readingMode === 'right-left') {
        if (this.comicSetting.firstPageEmpty && ((this.current.index & 1) === 0) && this.current.index !== 0) --this.current.index
        else if (!this.comicSetting.firstPageEmpty && (this.current.index & 1)) --this.current.index
      } else if (this.comicSetting.readingMode === 'scroll') {
        let elem = this.$refs[`scroll-image-${index}`]
        if (elem && elem.length > 0) elem[0].scrollIntoView()
      }
    },
    bindEvents () {
      // document.getElementById('image-box')
      // console.log('image-box element', this.$refs['image-box'])

      let nextPage = () => {
        if (this.comicSetting.readingMode === 'single' && this.current.index + 1 < this.current.images.length) ++this.current.index
        else if (this.comicSetting.readingMode === 'left-right' && this.current.index + 1 < this.current.images.length) {
          if (this.current.index + 2 < this.current.images.length) this.current.index += 2
          else this.current.index += 1
          // console.log('?', this.current.index, this.comicSetting.readingMode.firstPageEmpty)
          if (this.comicSetting.firstPageEmpty && ((this.current.index & 1) === 0) && this.current.index !== 0) --this.current.index
        } else if (this.comicSetting.readingMode === 'right-left' && this.current.index + 1 < this.current.images.length) {
          if (this.current.index + 2 < this.current.images.length) this.current.index += 2
          else this.current.index += 1
          // console.log('?', this.current.index, this.comicSetting.readingMode.firstPageEmpty)
          if (this.comicSetting.firstPageEmpty && ((this.current.index & 1) === 0) && this.current.index !== 0) --this.current.index
        } else if (this.comicSetting.readingMode === 'scroll') {
          for (let i = Math.max(this.current.index - 2, 0); i < Math.min(this.current.index + 2, this.current.images.length - 1); ++i) {
            let elem = this.$refs[`scroll-image-${i}`]
            if (elem && elem.length > 0) {
              if (this.scrollHandle(elem[0])) {
                this.current.index = i
                break
              }
            }
          }
        }
      }
      let prePage = () => {
        if (this.comicSetting.readingMode === 'single' && this.current.index > 0) --this.current.index
        else if (this.comicSetting.readingMode === 'left-right' && this.current.index > 0) {
          if (this.current.index > 1) this.current.index -= 2
          else this.current.index -= 1
        } else if (this.comicSetting.readingMode === 'right-left' && this.current.index > 0) {
          if (this.current.index > 1) this.current.index -= 2
          else this.current.index -= 1
        } else if (this.comicSetting.readingMode === 'scroll') {
          for (let i = Math.max(this.current.index - 2, 0); i < Math.min(this.current.index + 2, this.current.images.length - 1); ++i) {
            let elem = this.$refs[`scroll-image-${i}`]
            if (elem && elem.length > 0) {
              if (this.scrollHandle(elem[0])) {
                this.current.index = i
                break
              }
            }
          }
        }
      }

      this.$refs['image-box'].onmousewheel = (e) => {
        // console.log('onmousewheel', e)
        if (e.deltaY > 0) {
          nextPage()
        } else if (e.deltaY < 0) {
          prePage()
        }
      }

      document.body.addEventListener('keydown', (e) => {
        // console.log('keydown', e)
        if (e.keyCode === 39 || e.keyCode === 40) { // → ↓
          nextPage()
        } else if (e.keyCode === 37 || e.keyCode === 38) { // ← ↑
          prePage()
        }
      })
    },
    onReadingModeChange () {
      // dao.updateComicReadingMode(this.comic._id, this.comicSetting.readingMode, this.comicSetting.firstPageEmpty)
      if (this.comicSetting.readingMode === 'scroll') {
        setTimeout(() => {
          let elem = this.$refs[`scroll-image-${this.current.index}`]
          // console.log('?', elem, this.current.index)
          if (elem && elem.length > 0) elem[0].scrollIntoView()
        }, 10)
      }
    },
    onFirstPageEmptyChange () {
      if (this.comicSetting.firstPageEmpty && ((this.current.index & 1) === 0) && this.current.index !== 0) --this.current.index
      else if (!this.comicSetting.firstPageEmpty && (this.current.index & 1) && this.current.index + 1 < this.current.images.length) ++this.current.index
      // dao.updateComicReadingMode(this.comic._id, this.comicSetting.readingMode, this.comicSetting.firstPageEmpty)
    },
    scrollHandle (elem) {
      const offset = elem.getBoundingClientRect() // vue中，使用this.$el获取当前组件的根元素
      const offsetTop = offset.top
      const offsetBottom = offset.bottom
      // const offsetHeight = offset.height
      // 进入可视区域
      if (offsetTop <= window.innerHeight && offsetBottom >= 0) {
        // console.log('进入可视区域', elem)
        // do something...
        return true
      } else {
        // console.log('移出可视区域', elem)
        // do something...
        return false
      }
    },
    onChapterClick (d, index) {
      console.log('onChapterClick', d, index)
      this.chapter = d
      this.current.images = []
      if (this.chapter) {
        this.current.chapterName = this.chapter.title
      }
      if (!this.current.images || this.current.images.length === 0) {
        this.getOnlineBrowse()
      }

      this.current.index = 0
      this.drawerVisible = false

      // this.$router.replace({
      //   path: '/reading-online',
      //   query: {
      //     siteId: this.siteId, // if online comic
      //     comicDetail: JSON.stringify(this.comicDetail),
      //     chapter: JSON.stringify(d)
      //   }
      // })
    },
    // new things
    async getOnlineBrowse () {
      console.log('now getOnlineBrowse', this.chapter.idCode)
      this.current.images = []
      this.progress.show = true
      this.progress.current = 0
      this.progress.total = 0
      this.progress.percent = 0
      let page = 1
      while (true) {
        const resp = await parser.getBrowse(this.chapter.idCode, page)
        console.log('getOnlineBrowse resp', resp, page)
        if (resp.length === 0) break
        const currentLength = this.current.images.length
        this.progress.total = currentLength + resp.length
        for (let i = 0; i < resp.length; ++i) {
          this.current.images[currentLength + i] = await utils.downloadComicImage(
            this.globalSetting.savePath,
            this.site.name,
            this.comicDetail.title,
            this.chapter.title,
            resp[i].image,
            currentLength + i
          )
          ++this.progress.current
          this.progress.percent = parseInt(this.progress.current / this.progress.total * 100)
        }
        // this.comicBrowse = this.comicBrowse.concat(resp)
        ++page
      }
      this.progress.percent = 100
      localStorage.setItem('onlineReadingComicBrowse', JSON.stringify(this.current.images))
      console.log('comicBrowse load done', this.current.images)
      setTimeout(() => {
        this.progress.show = false
      }, 1000)
    },
    async initFromQueryOrCache () {
      const keys = ['localId', 'siteId', 'chapter', 'comicDetail', 'idCode']
      const keysShouldParse = { 'chapter': 1, 'comicDetail': 1, 'comicBrowse': 1 }
      const query = this.$route.query
      if (!query.localId && !query.siteId) {
        // read from cache
        const cache = JSON.parse(localStorage.getItem('onlineReadingComic') || '{}')
        const comicBrowseCache = JSON.parse(localStorage.getItem('onlineReadingComicBrowse') || '[]')
        for (let key of keys) {
          if (cache[key]) this[key] = cache[key]
        }
        if (comicBrowseCache.length > 0) this.current.images = comicBrowseCache
      } else {
        for (let key of keys) {
          if (query[key]) this[key] = key in keysShouldParse ? JSON.parse(query[key]) : query[key]
        }
        if (this.siteId) {
          const resp = await dao.getSiteRuleById(this.siteId)
          if (resp.length > 0) {
            this.site = resp[0]
            parser.setSite(this.site)
          }
        }
        if (!this.current.images || this.current.images.length === 0) {
          this.getOnlineBrowse()
        }
        let data = {}
        for (let key of keys) {
          if (this[key]) data[key] = this[key]
        }
        localStorage.setItem('onlineReadingComic', JSON.stringify(data))
      }
    },
    async insertComicAsLocal () {
      if (!this.site || !this.site.name) return
      const title = utils.genComicName(this.site.name, this.comicDetail.title)
      let p = await utils.tryMkdir([this.globalSetting.savePath, title])
      const comics = await dao.getComicByPath(p)
      if (!comics || comics.length === 0) {
        const resp = await dao.insertComic(
          p,
          title,
          this.comicDetail.author,
          this.comicDetail.intro,
          this.comicDetail.cover,
          this.comicDetail.tagConfig,
          this.comicDetail.imageConfig,
          this.siteId,
          this.idCode
        )
        const comics = await dao.getComicByPath(p)
        this.comic = comics[0]
        return resp
      } else {
        this.comic = comics[0]
        // this.comic.title = this.comicDetail.title
        // this.comic.author = this.comicDetail.author
        // this.comic.intro = this.comicDetail.intro
        // this.comic.cover = this.comicDetail.cover
        // this.comic.tagConfig = this.comicDetail.tagConfig
        // this.comic.imageConfig = this.comicDetail.imageConfig
        // this.comic.siteId = this.siteId
        // this.comic.idCode = this.idCode
        // return dao.updateComicById(this.comic._id, this.comic)
      }
    },
    async init () {
      this.globalSetting = await dao.getGlobalSetting()
      await this.initFromQueryOrCache()
      if (this.comicDetail.cover && this.comicDetail.cover.search('http') === 0) {
        // 下载到本地
        this.comicDetail.cover = await utils.downloadComicCover(this.globalSetting.savePath, this.site.name, this.comicDetail.title, this.comicDetail.cover)
      }
      if (this.chapter) {
        this.current.chapterName = this.chapter.title
      }
      console.log('siteId', this.siteId)
      console.log('chapter', this.chapter)
      console.log('comicDetail', this.comicDetail)
      console.log('comicBrowse', this.current.images)
      await this.insertComicAsLocal()
      await this.getComicSetting()
      this.bindEvents()
    }
  },
  async mounted () {
    console.log('Reading mounted', this.$route)
    await this.init()
  },
  watch: {
    'current.index' (to, from) {
      // console.log('watch current.index', to, from)
      let elem = this.$refs[`preview-image-${to}`]
      if (elem && elem.length > 0) elem[0].scrollIntoView()
      else {
        setTimeout(() => {
          let elem = this.$refs[`scroll-image-${this.current.index}`]
          // console.log('?', elem, this.current.index)
          if (elem && elem.length > 0) elem[0].scrollIntoView()

          elem = this.$refs[`preview-image-${to}`]
          if (elem && elem.length > 0) elem[0].scrollIntoView()
        }, 100)
      }

      dao.updateComicReadingProccess(this.comic._id, this.current.chapterName, this.current.index)
    },
    'current.chapterName' (to, from) {
      dao.updateComicReadingProccess(this.comic._id, this.current.chapterName, this.current.index)
    },
    async $route () {
      await this.init()
    }
  }
}
</script>

<style scoped>
.image-preview {
  padding: 5px 10px;
}
.image-preview:hover {
  cursor: pointer;
}
.image-single-mode {
  max-width: 100%;
  max-height: 100vh;
}
.image-double-mode {
  max-width: 50%;
  max-height: 100vh;
}
.inactive {
  opacity: 0.7;
}
.active {
  background: sandybrown;
}
.control-panel {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  height: 64px;
  opacity: 0;
  /* background: rgba(255, 255, 255, 0.3); */
  transition: opacity .5s;

  display: flex;
  justify-content: center;
  align-items: center;
}
.control-panel:hover {
  opacity: 1;
}
.chapter-item {
  cursor: pointer;
  padding-bottom: 5px;
}
.chapter-item:hover {
  border-bottom: solid 1px #888;
  padding-bottom: 4px;
}
.chapter-active {
  color:steelblue;
}
.loading-process {
  position: fixed;
  top: 20px;
  right: 50px;
  z-index: 3;
  /* background-color: rgba(255, 255, 255, 0.3); */
}
</style>
