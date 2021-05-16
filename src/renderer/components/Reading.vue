<template>
  <div>
    <a-layout>
      <a-layout-content :style="{ background: '#262626', height: '100vh', 'text-align': 'center' }">
        <!-- 这里要分不同的阅读方式：双页（左右/右左）、单页、滚动，以及双页情况下首页是否空白 -->
        <div ref="image-box" style="width: inherit; height: inherit;">
          <template v-if="comicSetting.readingMode === 'single'">
            <div style="display:flex;justify-content:center;align-items:center;height:inherit;">
              <img v-if="current.index < current.images.length" :src="current.images[current.index]" class="image-single-mode" />
            </div>
          </template>
          <template v-else-if="comicSetting.readingMode === 'left-right'">
            <div style="display:flex;justify-content:center;align-items:center;height:inherit;">
              <template v-if="current.index === 0 && comicSetting.firstPageEmpty">
                <img v-if="current.index < current.images.length" :src="current.images[current.index]" class="image-single-mode" />
              </template>
              <template v-else>
                <img v-if="current.index < current.images.length" :src="current.images[current.index]" class="image-double-mode" />
                <img v-if="current.index + 1 < current.images.length" :src="current.images[current.index + 1]" class="image-double-mode" />
              </template>
            </div>
          </template>
          <template v-else-if="comicSetting.readingMode === 'right-left'">
            <div style="display:flex;justify-content:center;align-items:center;height:inherit;">
              <template v-if="current.index === 0 && comicSetting.firstPageEmpty">
                <img v-if="current.index < current.images.length" :src="current.images[current.index]" class="image-single-mode" />
              </template>
              <template v-else>
                <img v-if="current.index + 1 < current.images.length" :src="current.images[current.index + 1]" class="image-double-mode" />
                <img v-if="current.index < current.images.length" :src="current.images[current.index]" class="image-double-mode" />
              </template>
            </div>
          </template>
          <template v-else-if="comicSetting.readingMode === 'scroll'">
            <div style="text-align: center;">
              <img
                v-for="(src, i) in current.images"
                :key="src"
                :src="src"
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
            :src="src"
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
       v-for="(d, i) in fullImages"
       :key="d[0]"
       :class="`chapter-item ${d[0] === current.chapterName ? 'chapter-active' : ''}`"
       @click="onChapterClick(d, i)"
      >
       {{ d[0] === '' ? '[默认]' : d[0] }}
      </p>
    </a-drawer>
  </div>
</template>

<script>
const utils = require('../utils').default
const dao = require('../dao').default

export default {
  name: 'reading',
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
      fullImages: [],

      current: {
        chapterName: '',
        images: [],
        index: 0 // 当前浏览到的下标
      },

      drawerVisible: false
    }
  },
  methods: {
    async getImageListInPathWithChapter () {
      this.fullImages = await utils.getImageListInPathWithChapter(this.comic.path)
      console.log('images', this.fullImages)
      if (this.fullImages.length > 0 && !this.current.chapterName) {
        this.current.chapterName = this.fullImages[0][0]
        this.current.images = this.fullImages[0][1]
      }
    },
    async getComicSetting () {
      this.comicSetting = await dao.getComicSetting(this.comic._id)
      console.log('comicSetting', this.comicSetting)
      if (this.comicSetting.chapterName) {
        this.current.chapterName = this.comicSetting.chapterName
        this.fullImages.forEach(d => {
          if (d[0] === this.current.chapterName) {
            this.current.images = d[1]
          }
        })
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
      dao.updateComicReadingMode(this.comic._id, this.comicSetting.readingMode, this.comicSetting.firstPageEmpty)
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
      dao.updateComicReadingMode(this.comic._id, this.comicSetting.readingMode, this.comicSetting.firstPageEmpty)
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
      this.current.images = d[1]
      this.current.chapterName = d[0]
      this.current.index = 0
      this.drawerVisible = false
    }
  },
  async mounted () {
    console.log('Reading mounted', this.$route)
    if (this.$route.query._id) {
      localStorage.setItem('readingComic', JSON.stringify(this.$route.query))
      this.comic = this.$route.query
    } else {
      this.comic = JSON.parse(localStorage.getItem('readingComic')) // 时间类好像会挂掉
    }
    console.log('Reading Comic', this.comic)

    await this.getImageListInPathWithChapter()
    await this.getComicSetting()
    this.bindEvents()
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
      this.fullImages.forEach(d => {
        if (d[0] === this.current.chapterName) {
          this.current.images = d[1]
        }
      })
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
</style>
