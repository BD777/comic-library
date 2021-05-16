const fs = require('fs')
const path = require('path')

// promisify
fs.promises = {}
const funcs = [
  'lstat',
  'readdir',
  'readFile'
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

const ImageSuffix = ['jpg', 'jpeg', 'png', 'bmp', 'gif']

export default {

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
  }

}
