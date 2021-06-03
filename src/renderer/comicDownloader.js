// 下载漫画
const utils = require('./utils').default
const dao = require('./dao').default

class ComicDownloader {
  constructor () {
    if (!ComicDownloader.instance) { // singleton
      dao.getGlobalSetting().then((setting) => {
        this.globalSetting = setting
        this.savePath = this.globalSetting.savePath
        this.maxDownloadConcurrences = this.globalSetting.maxDownloadConcurrences || 5

        this.running = 0 // 正在运行的数量
        this.tasks = []
        this.runningTasks = []
        this.runInterval = setInterval(() => {
          this.run()
        }, 500)
        this.isRunning = false

        ComicDownloader.instance = this
      })
    } else {
      return ComicDownloader.instance
    }
  }

  addTask (site, comicDetail, chapterTitle, chapterIdCode, progressCallback) {
    this.tasks.push({
      parser: require('./parser/index').default,
      site: Object.assign({}, site),
      comicDetail: Object.assign({}, comicDetail),
      chapterTitle: chapterTitle,
      chapterIdCode: chapterIdCode,
      progressCallback: progressCallback,
      images: []
    })
  }

  getPendingTasks () {
    return this.tasks.map(task => {
      return {
        siteName: task.site.name,
        comicTitle: task.comicDetail.title,
        chapterTitle: task.chapterTitle,
        chapterIdCode: task.chapterIdCode
      }
    })
  }

  getRunningTasks () {
    return this.runningTasks.map(task => {
      return {
        siteName: task.site.name,
        comicTitle: task.comicDetail.title,
        chapterTitle: task.chapterTitle,
        chapterIdCode: task.chapterIdCode
      }
    })
  }

  run () {
    // do sth.
    // console.log('run start', this.running, this.isRunning)
    if (this.isRunning) return
    this.isRunning = true
    while (this.running < this.maxDownloadConcurrences && this.tasks.length > 0) {
      const task = this.tasks.shift()
      console.log('before process task', task, this.running)
      ++this.running
      this.runningTasks.push(task)
      this.download(task).then(() => {
        --this.running
        for (let i = 0; i < this.runningTasks.length; ++i) {
          if (this.runningTasks[i].site.name === task.site.name &&
            this.runningTasks[i].comicDetail.title === task.comicDetail.title &&
            (this.runningTasks[i].chapterIdCode || this.runningTasks[i].chapterIdCode === task.chapterIdCode)) {
            this.runningTasks.splice(i, 1)
            break
          }
        }
      })
    }
    this.isRunning = false
  }

  async download (task, noRetry) {
    noRetry = !!noRetry
    console.log('start download', task, noRetry)
    let { parser, site, comicDetail, chapterTitle, chapterIdCode, progressCallback, images } = task
    let current = 0
    let total = 0
    let done = false

    let page = 1
    while (true) {
      const resp = await parser.getBrowse(chapterIdCode, page)
      console.log('getOnlineBrowse resp', resp, page)
      if (resp.length === 0) break
      const currentLength = images.length
      total = currentLength + resp.length
      if (progressCallback) {
        progressCallback(images, current, total, done)
      }
      for (let i = 0; i < resp.length; ++i) {
        console.log('before downloadComicImage', i, task)
        images[currentLength + i] = await utils.downloadComicImage(
          this.savePath,
          site.name,
          comicDetail.title,
          chapterTitle,
          resp[i].image,
          currentLength + i
        )
        ++current
        if (progressCallback) {
          progressCallback(images, current, total, done)
        }
      }
      // this.comicBrowse = this.comicBrowse.concat(resp)
      ++page
    }

    // 检查是不是第一页都拿不到，若是，重试一发
    if (!noRetry && page === 1 && images.length === 0) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.download(task, true))
        }, 3000)
      })
    }

    done = true
    if (progressCallback) {
      progressCallback(images, current, total, done)
    }
    console.log('comicBrowse load done', images)
  }
}

const downloader = new ComicDownloader()

export default downloader
