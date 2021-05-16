import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

const root = path.join(remote.app.getPath('userData'), 'comic-library')

console.log(remote.app.getPath('userData'))

var db = {}
db.meta = new Datastore({ // 漫画信息
  autoload: true,
  filename: path.join(root, '/meta.db')
})

db.setting = new Datastore({ // 浏览方式、进度等
  autoload: true,
  filename: path.join(root, '/setting.db')
})

db.tags = new Datastore({ // 标签
  autoload: true,
  filename: path.join(root, '/tags.db')
})

// promisify
const funcs = ['find', 'ensureIndex', 'removeIndex', 'insert', 'count', 'remove', 'update']
for (let key in db) {
  db[key].promises = {}
  funcs.forEach(func => {
    db[key].promises[func] = (...args) => {
      return new Promise((resolve, reject) => {
        db[key][func](...args, (err, resp) => {
          if (err) reject(err)
          else resolve(resp)
        })
      })
    }
  })
}

export default db
