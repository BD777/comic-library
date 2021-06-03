const fs = require('fs')
const path = require('path')
const requests = require('./requests').default

// promisify
fs.promises = {}
const funcs = [
  'lstat',
  'readdir',
  'readFile',
  'open',
  'write',
  'writeFile',
  'mkdir'
]
funcs.forEach(func => {
  fs.promises[func] = (...args) => {
    return new Promise((resolve, reject) => {
      fs[func](...args, (err, resp) => {
        if (err) reject(err)
        else resolve(resp)
      })
    })
  }
})

const ImageSuffix = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp']

export default {

  fs: fs,

  getImageSuffix (fileBuffer) {
    // 将上文提到的 文件标识头 按 字节 整理到数组中
    const imageBufferHeaders = [
      { bufBegin: [0xff, 0xd8], bufEnd: [0xff, 0xd9], suffix: '.jpg' },
      { bufBegin: [0x00, 0x00, 0x02, 0x00, 0x00], suffix: '.tga' },
      { bufBegin: [0x00, 0x00, 0x10, 0x00, 0x00], suffix: '.rle' },
      {
        bufBegin: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
        suffix: '.png'
      },
      { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], suffix: '.gif' },
      { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], suffix: '.gif' },
      { bufBegin: [0x42, 0x4d], suffix: '.bmp' },
      { bufBegin: [0x0a], suffix: '.pcx' },
      { bufBegin: [0x49, 0x49], suffix: '.tif' },
      { bufBegin: [0x4d, 0x4d], suffix: '.tif' },
      {
        bufBegin: [0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20],
        suffix: '.ico'
      },
      {
        bufBegin: [0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x20, 0x20],
        suffix: '.cur'
      },
      { bufBegin: [0x46, 0x4f, 0x52, 0x4d], suffix: '.iff' },
      { bufBegin: [0x52, 0x49, 0x46, 0x46], suffix: '.ani' }
    ]
    for (const imageBufferHeader of imageBufferHeaders) {
      let isEqual
      // 判断标识头前缀
      if (imageBufferHeader.bufBegin) {
        const buf = Buffer.from(imageBufferHeader.bufBegin)
        isEqual = buf.equals(
          // 使用 buffer.slice 方法 对 buffer 以字节为单位切割
          fileBuffer.slice(0, imageBufferHeader.bufBegin.length)
        )
      }
      // 判断标识头后缀
      if (isEqual && imageBufferHeader.bufEnd) {
        const buf = Buffer.from(imageBufferHeader.bufEnd)
        isEqual = buf.equals(fileBuffer.slice(-imageBufferHeader.bufEnd.length))
      }
      if (isEqual) {
        return imageBufferHeader.suffix
      }
    }
    // 未能识别到该文件类型
    return ''
  },

  isImageBySuffix (filename) {
    const suffix = filename.split('.').pop()
    return ImageSuffix.indexOf(suffix) !== -1
  },

  async getFirstImageInPath (p) { // 递归找
    const resp = await fs.promises.readdir(p)
    console.log(resp)
    for (let i = 0; i < resp.length; ++i) {
      const filename = resp[i]
      const filepath = path.join(p, filename)
      const stat = await fs.promises.lstat(filepath)
      if (stat.isFile()) {
        // 读出来判断是否图片
        // 为了性能，直接判后缀好了
        if (this.isImageBySuffix(filename)) return filepath
      } else {
        // 递归搞
        return this.getFirstImageInPath(path.join(p, filename))
      }
    }
  },

  async fileToBlob (filepath) {
    const buf = await fs.promises.readFile(filepath)
    return new Blob([buf])
  },

  async getImageListInPath (p) { // 只在当前目录找
    const resp = await fs.promises.readdir(p)
    let imageList = []
    for (let i = 0; i < resp.length; ++i) {
      const filename = resp[i]
      const filepath = path.join(p, filename)
      const stat = await fs.promises.lstat(filepath)
      if (stat.isFile()) {
        // 读出来判断是否图片
        // 为了性能，直接判后缀好了
        if (this.isImageBySuffix(filename)) imageList.push(filepath)
      }
    }
    return imageList
  },

  async getImageListInPathWithChapter (p) { // 读两层目录，第二层目录认为是分集
    let images = []
    images.push(['', await this.getImageListInPath(p)])
    const resp = await fs.promises.readdir(p)
    for (let i = 0; i < resp.length; ++i) {
      const filename = resp[i]
      const filepath = path.join(p, filename)
      const stat = await fs.promises.lstat(filepath)
      if (stat.isDirectory()) {
        images.push([filename, await this.getImageListInPath(filepath)])
      }
    }
    return images
  },

  async tryMkdir (pathList) {
    let resp = '.'
    for (const p of pathList) {
      resp = path.resolve(path.join(resp, p))
      try {
        await fs.promises.mkdir(resp)
      } catch (e) {
        // console.warn(`mkdir ${resp} fail with ${e}`)
      }
    }
    return resp
  },

  async downloadImage (url, savePath, filename) {
    console.log('downloadImage', url, savePath, filename)
    const resp = await requests.get({
      url: url,
      responseType: 'arraybuffer'
    })
    // console.log(resp, new Uint8Array(resp.data))
    const suffix = resp.headers['content-type'].split('/').pop()
    filename = filename + '.' + suffix
    const saveFilePath = path.join(savePath, filename)
    await fs.promises.writeFile(saveFilePath, new Uint8Array(resp.data), 'binary')
    return saveFilePath
    // const writer = fs.createWriteStream(saveFilePath)
    // resp.data.pipe(writer)
    // return new Promise((resolve, reject) => {
    //   writer.on('finish', resolve)
    //   writer.on('error', reject)
    // }).then(() => {
    //   return saveFilePath
    // })
  },

  genComicName (siteName, comicTitle) {
    const name = `[${siteName}] ${comicTitle}`
    const reg = new RegExp('[\\/\\\\:\\*\\?\\"<>\\|\\t]', 'g')
    return name.replace(reg, '_')
  },

  async getLocalComicImage (savePath, siteName, comicTitle, chapterTitle, url, index) {
    // if exists return path, else return null
    const reg = new RegExp('[\\/\\\\:\\*\\?\\"<>\\|\\t]', 'g')
    const comicName = this.genComicName(siteName, comicTitle)
    if (chapterTitle) chapterTitle = chapterTitle.replace(reg, '_')

    let p
    if (chapterTitle) {
      p = await this.tryMkdir([savePath, comicName, chapterTitle])
    } else {
      p = await this.tryMkdir([savePath, comicName])
    }
    const resp = await requests.head({ url: url })
    // console.log('head', resp)
    const suffix = resp.headers['content-type'].split('/').pop()
    const filename = this.paddingZero(index, 5) + '.' + suffix
    p = path.join(p, filename)

    try {
      const stat = await fs.promises.lstat(p)
      if (stat.isFile()) {
        // console.log('stat', p, stat)
        if (parseInt(stat.size) === parseInt(resp.headers['content-length'])) return p
      }
    } catch (e) {
      return null
    }
  },

  async downloadComicImage (savePath, siteName, comicTitle, chapterTitle, url, index) {
    const localPath = await this.getLocalComicImage(savePath, siteName, comicTitle, chapterTitle, url, index)
    if (localPath) {
      // console.log(`${url} read from local ${localPath}`)
      return localPath
    }
    const reg = new RegExp('[\\/\\\\:\\*\\?\\"<>\\|\\t]', 'g')
    const comicName = this.genComicName(siteName, comicTitle)
    if (chapterTitle) chapterTitle = chapterTitle.replace(reg, '_')
    let p
    if (chapterTitle) {
      p = await this.tryMkdir([savePath, comicName, chapterTitle])
    } else {
      p = await this.tryMkdir([savePath, comicName])
    }
    return this.downloadImage(
      url,
      path.resolve(p),
      this.paddingZero(index, 5)
    )
  },

  // TODO 这里应该要加proxy
  async getLocalComicCover (savePath, siteName, comicTitle, url) {
    // if exists return path, else return null
    const comicName = this.genComicName(siteName, comicTitle)

    let p = await this.tryMkdir([savePath, comicName])
    const resp = await requests.head({ url: url })
    // console.log('head', resp)
    const suffix = resp.headers['content-type'].split('/').pop()
    const filename = 'cover.' + suffix
    p = path.join(p, filename)

    try {
      const stat = await fs.promises.lstat(p)
      if (stat.isFile()) {
        // console.log('stat', p, stat)
        if (parseInt(stat.size) === parseInt(resp.headers['content-length'])) return p
      }
    } catch (e) {
      // pass
    }
    return null
  },

  async downloadComicCover (savePath, siteName, comicTitle, url) {
    const localPath = await this.getLocalComicCover(savePath, siteName, comicTitle, url)
    if (localPath) {
      // console.log(`${url} read from local ${localPath}`)
      return localPath
    }
    const comicName = this.genComicName(siteName, comicTitle)
    let p = await this.tryMkdir([savePath, comicName])
    return this.downloadImage(
      url,
      path.resolve(p),
      'cover'
    )
  },

  async isComicDownloaded (savePath, siteName, comicTitle, chapterTitle) {
    const reg = new RegExp('[\\/\\\\:\\*\\?\\"<>\\|\\t]', 'g')
    const comicName = this.genComicName(siteName, comicTitle)
    if (chapterTitle) chapterTitle = chapterTitle.replace(reg, '_')

    let p
    if (chapterTitle) {
      p = path.join(savePath, comicName, chapterTitle)
    } else {
      p = path.join(savePath, comicName)
    }

    try {
      const stat = await fs.promises.lstat(p)
      if (stat.isDirectory()) {
        // 简单判断
        return true
      }
    } catch (e) {
      return false
    }
  },

  paddingZero (num, length) {
    for (let len = (num + '').length; len < length; len = num.length) {
      num = '0' + num
    }
    return num
  }

}
