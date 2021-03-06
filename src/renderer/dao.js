import db from './datastore'
import { remote } from 'electron'
import path from 'path'

// 增加索引
db.tags.promises.ensureIndex({ fieldName: 'tag', unique: true })
db.meta.promises.ensureIndex({ fieldName: 'path', unique: true })
db.siteRules.promises.ensureIndex({ fieldName: 'name', unique: true })

export default {
  // 这里统一做dao方法
  async getAllTags () {
    return db.tags.promises.find({})
  },

  async insertComic (path, title, author, intro, cover, tagConfig, imageConfig, siteId, idCode) {
    await this.insertTags(tagConfig.map(tag => tag.name))
    const now = new Date()
    return db.meta.promises.insert({
      path: path,
      title: title,
      author: author,
      intro: intro,
      cover: cover,
      tagConfig: tagConfig, // [{ name, url }, ...]
      imageConfig: imageConfig, // [{ thumbnail, url }, ...]
      siteId: siteId, // 在线漫画有此二项
      idCode: idCode,
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

  genSearchComicsQuery (searchType, searchText) {
    let query = {}
    if (searchType && searchText) {
      if (searchType === 'title') query.title = new RegExp(searchText)
      else if (searchType === 'author') query.author = new RegExp(searchText)
      else if (searchType === 'desc') query.desc = new RegExp(searchText)
      else if (searchType === 'tags') query['tags'] = searchText
    }
    return query
  },

  async searchComics (searchType, searchText, current, pageSize) {
    // start from 1
    current = current || 1
    pageSize = pageSize || 20
    let query = this.genSearchComicsQuery(searchType, searchText)
    return new Promise((resolve, reject) => {
      db.meta.find(query).sort({ updateTime: -1 }).skip((current - 1) * pageSize).limit(pageSize).exec((err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  },

  async getComicsCount (query) {
    query = query || {}
    return db.meta.promises.count(query)
  },

  async deleteComicById (id) {
    return db.meta.promises.remove({ _id: id }, {})
  },

  async updateComicById (id, comic) {
    let _comic = Object.assign({}, comic)
    delete _comic._id
    _comic.updateTime = new Date()
    return db.meta.promises.update({ _id: id }, { $set: _comic }, {})
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
  },

  async insertSiteRule (site) {
    return db.siteRules.promises.insert(site)
  },

  async updateSiteById (id, site) {
    let _site = Object.assign({}, site)
    delete _site._id
    return db.siteRules.update({ _id: id }, { $set: _site })
  },

  async getSiteRuleByName (name) {
    return db.siteRules.promises.find({ name: name })
  },

  async getSiteRuleById (siteId) {
    return db.siteRules.promises.find({ _id: siteId })
  },

  async getSiteList () {
    return new Promise((resolve, reject) => {
      db.siteRules.find({}).sort({ updateTime: -1 }).exec((err, docs) => {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  },

  async deleteSiteById (id) {
    return db.siteRules.promises.remove({ _id: id }, {})
  },

  async updateGlobalSetting (setting) {
    const key = 'global-setting'
    const data = {
      key: key,
      setting: setting
    }
    console.log('updateGlobalSetting', data)
    return db.globalSetting.promises.update({ key: key }, { $set: data }, { upsert: false })
  },

  async getGlobalSetting () {
    const key = 'global-setting'
    const resp = await db.globalSetting.promises.find({ key: key })
    if (resp.length > 0) {
      return resp[0].setting
    } else {
      return {
        savePath: path.join(remote.app.getPath('userData'), 'comic-library', 'comic-data')
      }
    }
  }

}
