<template>
  <div>
    <a-page-header
      style="background: rgb(235, 237, 240);"
      :title="title"
      @back="() => $router.go(-1)"
    />
    <a-spin :spinning="loading">
      <div class="container">
        <a-card style="margin: 15px;" class="comic-meta" hoverable >
          <div style="display: flex" v-if="comicDetail.title">
            <div style="flex-basis: auto;">
              <img :src="comicDetail.cover" class="comic-cover" :alt="comicDetail.title" />
            </div>
            <div style="flex: auto;">
              <div style="padding: 15px;">
                <h1 class="comic-title">{{ comicDetail.title }}</h1>
                <div class="comic-intro">{{ comicDetail.intro }}</div>
                <div class="comic-update-time" v-if="comicDetail.updateTime">更新时间：{{ comicDetail.updateTime }}</div>
                <div class="comic-tags">
                  <a-tag v-for="tag in comicDetail.tagConfig" :key="tag.name" color="blue">
                    {{ tag.name }}
                  </a-tag>
                </div>
                <div style="margin-top: 20px;">
                  <a-button type="primary" @click="startReading">开始阅读</a-button>
                </div>
              </div>
            </div>
          </div>
        </a-card>
        <a-divider />
        <a-card style="margin: 15px;" class="comic-chapter" v-if="comicDetail.chapterConfig && comicDetail.chapterConfig.length > 0">
          <div>
            <h3 style="text-align: center; display: inline-block;">章节</h3>
            <div style="float: right;">
              <span style="vertical-align: middle; padding-right: 15px;">下载</span><a-switch style="vertical-align: middle;" v-model="downloadMode" />
            </div>
          </div>
          <template v-if="downloadMode">
            <div class="comic-chapter-item" v-for="chapter in comicDetail.chapterConfig" :key="chapter.idCode">
              <a-badge :offset="[-10, 10]">
                <a-icon v-if="chapter.downloadStatus === 'downloaded'" slot="count" type="check-circle" style="font-size: 0.8em; color: #87d068;" />
                <a-icon v-else-if="chapter.downloadStatus === 'not-download'" slot="count" type="clock-circle" style="font-size: 0.8em; color: #2db7f5;" />
                <a-icon v-else-if="chapter.downloadStatus === 'downloading'" slot="count" type="loading" style="font-size: 0.8em; color: #FAAD14;" />
                <a-button
                 type="link"
                 @click="onDownloadChapterClick(chapter)"
                 :disabled="chapter.downloadStatus === 'downloading'"
                 :style="`${chapter.downloadStatus === 'downloaded' ? 'color: #87d068;' : ''}`"
                >
                  {{ chapter.title }}
                </a-button>
              </a-badge>
              <a-divider type="vertical" />
            </div>
          </template>
          <template v-else>
            <div class="comic-chapter-item" v-for="chapter in comicDetail.chapterConfig" :key="chapter.idCode">
              <a-button type="link" @click="onChapterClick(chapter)" :style="`${chapter.downloadStatus === 'downloaded' ? 'color: #87d068;' : ''}`">{{ chapter.title }}</a-button>
              <a-divider type="vertical" />
            </div>
          </template>
        </a-card>
        <a-divider />
        <a-card style="margin: 15px" class="comic-image-preview" v-if="comicDetail.imageConfig && comicDetail.imageConfig.length > 0">
        </a-card>
      </div>
    </a-spin>
  </div>
</template>

<script>
const parser = require('../parser/index').default
const dao = require('../dao').default
const utils = require('../utils').default
const downloader = require('../comicDownloader').default

export default {
  name: 'comic-detail',
  components: {},
  data () {
    return {
      globalSetting: {},

      loading: false,
      downloadMode: false,

      title: '',
      // 如果是在线的则有这两项
      siteId: '',
      onlineComic: {},
      site: {}, // 根据siteId读出来的
      // 本地的则是这一项
      localComic: {},

      comicDetail: {} // 在线读的，或者本地的，应该保持相同结构
    }
  },
  methods: {
    async init () {
      if (this.siteId) { // 按在线的处理
        this.initOnlineComic()
      } else { // 按本地的处理
        this.initLocalComic()
      }
    },
    async initOnlineComic () {
      this.loading = true
      this.comicDetail = await parser.getDetail(this.onlineComic.idCode)
      let i = 0
      let interval = setInterval(() => {
        if (i >= this.comicDetail.chapterConfig.length) {
          clearInterval(interval)
        } else {
          const _i = i
          let d = this.comicDetail.chapterConfig[_i]
          utils.isComicDownloaded(this.globalSetting.savePath, this.site.name, this.comicDetail.title, d.title).then(isDownload => {
            this.$set(this.comicDetail.chapterConfig[_i], 'downloadStatus', isDownload ? 'downloaded' : 'not-download')
          })
          ++i
        }
      }, 50)
      // this.comicDetail.chapterConfig.forEach((d, i) => {
      //   const _i = i
      //   utils.isComicDownloaded(this.globalSetting.savePath, this.site.name, this.comicDetail.title, d.title).then(isDownload => {
      //     this.$set(this.comicDetail.chapterConfig[_i], 'downloadStatus', isDownload ? 'downloaded' : 'not-download')
      //   })
      //   // d.downloadStatus = isDownload ? 'downloaded' : 'not-download'
      // })
      console.log('comicDetail', this.comicDetail)
      this.loading = false
    },
    initLocalComic () {

    },
    onChapterClick (chapter) {
      // jump to chapter
      this.$router.push({
        path: '/reading-online',
        query: {
          siteId: this.siteId, // if online comic
          comicDetail: JSON.stringify(this.comicDetail),
          chapter: JSON.stringify(chapter),
          idCode: this.onlineComic.idCode
        }
      })
    },
    onDownloadChapterClick (chapter) {
      for (let i = 0; i < this.comicDetail.chapterConfig.length; ++i) {
        if (this.comicDetail.chapterConfig[i].idCode === chapter.idCode) {
          const _i = i
          chapter.downloadStatus = 'downloading'
          this.$set(this.comicDetail.chapterConfig, _i, chapter)
          downloader.addTask(this.site, this.comicDetail, chapter.title, chapter.idCode, (images, current, total, done) => {
            if (done) {
              chapter.downloadStatus = 'downloaded'
              this.$set(this.comicDetail.chapterConfig, _i, chapter)
            }
          })
        }
      }
    },
    startReading () {
      // pass
      if (this.comicDetail.chapterConfig && this.comicDetail.chapterConfig.length > 0) {
        return this.onChapterClick(this.comicDetail.chapterConfig[0])
      }
      this.$router.push({
        path: '/reading-online',
        query: {
          siteId: this.siteId, // if online comic
          comicDetail: JSON.stringify(this.comicDetail),
          idCode: this.onlineComic.idCode
        }
      })
    }
  },
  async mounted () {
    console.log('ComicDetail mounted', downloader, this.$route.query, this, this.$store)
    this.globalSetting = await dao.getGlobalSetting()
    if (this.$route.query.siteId) {
      this.siteId = this.$route.query.siteId
      const resp = await dao.getSiteRuleById(this.siteId)
      if (resp.length > 0) {
        this.site = resp[0]
        parser.setSite(this.site)
      }
    }
    if (this.$route.query.onlineComic) {
      this.onlineComic = JSON.parse(this.$route.query.onlineComic)
      this.title = `[${this.site.name}] ${this.onlineComic.title}`
    }
    if (this.$route.query.localComic) {
      this.localComic = JSON.parse(this.$route.query.localComic)
      this.title = this.localComic.title
    }
    console.log('ComicDetail mounted done', this.siteId, this.onlineComic, this.site, this.localComic)

    return this.init()
  }
}
</script>

<style>
.container {
}
.comic-cover {
  width: 320px;
  object-fit: scale-down;
}
.comic-title {
  font-weight: 900;
  color: #3f3f3f;
}
.comic-intro {
  text-align: justify;
}
.comic-update-time {
  margin-top: 15px;
  color: #333;
}
.comic-tags {
  margin-top: 15px;
}
.comic-meta > .ant-card-body {
  padding: 0;
  cursor: initial;
}
.comic-chapter {

}
.comic-chapter-item {
  display: inline-block;
}
</style>
