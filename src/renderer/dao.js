import db from './datastore'

// 增加索引
db.tags.promises.ensureIndex({ fieldName: 'tag', unique: true })
db.meta.promises.ensureIndex({ fieldName: 'path', unique: true })

export default {
  // 这里统一做dao方法
  async getAllTags () {
    return db.tags.promises.find({})
  },

  async insertComic (path, title, author, desc, cover, tags) {
    await this.insertTags(tags)
    const now = new Date()
    return db.meta.promises.insert({
      path: path,
      title: title,
      author: author,
      desc: desc,
      cover: cover,
      tags: tags,
      insertTime: now,
      updateTime: now
    })
  },

  async insertTags (tags) {
    tags.forEach(async (tag) => {
      try {
        await db.tags.promises.insert({ tag: tag })
      } catch (e) {
        if (e.errorType === 'uniqueViolated') {
          console.warn(`insertTags ${tag} 已存在`)
        } else {
          console.error('insertTags error', tag, e)
        }
      }
    })
  },

  async getComicByPath (path) {
    return db.meta.promises.find({ path: path })
  },

  async getAllComics (current, pageSize) {
    // start from 1
    current = current || 1
    pageSize = pageSize || 20
    return new Promise((resolve, reject) => {
      db.meta.find({}).sort({ updateTime: -1 }).skip((current - 1) * pageSize).limit(pageSize).exec((err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  },

  async getAllComicsCount () {
    return db.meta.promises.count({})
  },

  async deleteComicById (id) {
    return db.meta.promises.remove({ _id: id }, {})
  },

  async updateComicById (id, comic) {
    comic.updateTime = new Date()
    return db.meta.promises.update({ _id: id }, { $set: comic }, {})
  },

  async getComicSetting (comicId) { // 阅读方式：双页（左右/右左）、单页、滚动，以及双页情况下首页是否空白
    let resp = await db.setting.promises.find({ comicId: comicId })
    console.log('getComicSetting', comicId, resp)
    let defaultResp = {
      comicId: comicId,
      readingMode: 'single', // left-right, right-left, single, scroll
      firstPageEmpty: false, // 首页是否空白

      chapterName: '', // 阅读进度：章节名
      index: 0 // 阅读进度：页码
      // 后续有追加就放到这里来
    }
    if (resp.length > 0) return Object.assign(defaultResp, resp[0])
    else {
      return defaultResp
    }
  },

  async updateComicReadingMode (comicId, readingMode, firstPageEmpty) {
    let data = {
      comicId: comicId,
      readingMode: readingMode, // left-right, right-left, single, scroll
      firstPageEmpty: firstPageEmpty // 首页是否空白
    }
    return db.setting.update({ comicId: comicId }, { $set: data }, { upsert: true })
  },

  async updateComicReadingProccess (comicId, chapterName, index) {
    let data = {
      comicId: comicId,
      chapterName: chapterName,
      index: index
    }
    return db.setting.update({ comicId: comicId }, { $set: data }, { upsert: true })
  }
}
