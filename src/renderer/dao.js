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
    return db.meta.promises.insert({
      path: path,
      title: title,
      author: author,
      desc: desc,
      cover: cover,
      tags: tags
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
      db.meta.find({}).skip((current - 1) * pageSize).limit(pageSize).exec((err, docs) => {
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
    return db.meta.promises.update({ _id: id }, comic, {})
  }
}
