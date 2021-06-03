// const path = require('path')
const axios = require('axios').default
const { remote } = require('electron')
const { URL } = require('url')

export default {
  async getWithoutJs (kwargs) {
    let req = {
      method: 'get',
      url: kwargs.url
    }
    if (kwargs.headers) req.headers = kwargs.headers
    // const host = new URL(req.url).host
    // if (!req.headers) req.headers = {}
    // if (req.headers.referer && req.headers.referer.search('localhost') !== -1) req.headers.referer = host
    // req.headers.referer = host
    if (kwargs.responseType) req.responseType = kwargs.responseType
    // TODO add proxy
    return axios(req)
  },

  async getWithJs (kwargs) {
    console.log('getWithJs start', kwargs)
    const win = new remote.BrowserWindow({
      show: false,
      webPreferences: {
        // preload: path.resolve(path.join(__dirname, './fixJquery.js')),
        devTools: false,
        sandbox: true
      }
    })
    const contents = win.webContents
    // contents.session.setProxy({}) // TODO
    let options = {}
    if (kwargs.headers) {
      for (const ua of ['user-agent', 'userAgent', 'UserAgent']) {
        if (kwargs.headers[ua]) {
          options.userAgent = kwargs.headers[ua]
          delete kwargs.headers[ua]
          options.extraHeaders = kwargs.headers
          break
        }
      }
    }
    if (kwargs.localStorage) {
      let localStorage = kwargs.localStorage.split(';').map(s => s.split(':'))
      if (localStorage.length > 0) {
        let jsSnippet = localStorage.map(d => `localStorage.setItem('${d[0].replace('\'', '\\\'')}', '${d[1].replace('\'', '\\\'')}')`).join('\n')
        contents.on('will-attach-webview', (event) => {
          const js = `new Promise((resolve, reject) => {
            ${jsSnippet}
          })`
          console.log('will-attach-webview', event, js)
          contents.executeJavaScript(js).then(result => {
            console.log('executeJavaScript', js, result)
          })
        })
      }
    }
    contents.loadURL(kwargs.url, options)
    return new Promise((resolve, reject) => {
      contents.on('did-finish-load', (event) => {
        // console.log('did-finish-load', event)
        // console.log('webContents', contents)
        // console.log('title', contents.getTitle())
        // console.log('url', contents.getURL())

        // return html content
        const js = `new Promise((resolve, reject) => {
          // let cnt = 0
          // let interval = setInterval(() => {
          //   document.documentElement.scroll(0, document.documentElement.scrollHeight)
          //   if (cnt > 28) {
          //     clearInterval(interval)
          //   }
          //   ++cnt
          // }, 100)
          setTimeout(() => {
            resolve(document.querySelector('html').innerHTML)
          }, 3000)
        })`
        contents.executeJavaScript(js).then(result => {
          // console.log('executeJavaScript result', result)
          // win.close()
          resolve({
            data: result
          })
        })
      })
    })
  },

  async get (kwargs) {
    /**
     * kwargs: {
     *   url: 'https://xxxx',
     *   headers: {},
     *   reponseType: '',
     *   proxy: {
     *     enable: false,
     *     protocol: 'http', // socks5, https
     *     host: '',
     *     port: 1080
     *   },
     *   jsNeeded: false // 是否返回加载js后的结果
     * }
     */
    console.log('requests.get', kwargs)
    if (kwargs.jsNeeded) {
      return this.getWithJs(kwargs)
    } else {
      return this.getWithoutJs(kwargs)
    }
  },

  async head (kwargs) {
    let req = {
      method: 'head',
      url: kwargs.url
    }
    if (kwargs.headers) req.headers = kwargs.headers
    const host = new URL(req.url).host
    if (!req.headers) req.headers = {}
    if (req.headers.referer && req.headers.referer.search('localhost') !== -1) req.headers.referer = host
    req.headers.referer = host
    if (kwargs.responseType) req.responseType = kwargs.responseType
    // TODO add proxy
    return axios(req)
  }
}
