const axios = require('axios').default

class PlaceholderRenderer {
  constructor () {
    this.keywords = ['page', 'idCode', 'cidCode', 'keyword']
  }

  render (template, query) {
    /**
     * template: String   template with reserve keyword in this.keywords
     * query: dict        values
     */
    let s = template
    for (let i = 0; i < this.keywords.length; ++i) {
      const word = this.keywords[i]
      if (query[word] !== undefined) {
        if (word === 'page') {
          s = s.replace(new RegExp(`{${word}:[\\d:]*}`, 'g'), query[word])
        } else {
          s = s.replace(new RegExp(`{${word}:}`, 'g'), query[word])
        }
      }
    }
    return s
  }

  parse (template) {
    let resp = {}
    for (let i = 0; i < this.keywords.length; ++i) {
      let word = this.keywords[i]
      let s = template
      if (word === 'page') {
        let regex = new RegExp(`{(${word}):(\\d*)[:]?(\\d*)}`)
        while (true) {
          const match = regex.exec(s)
          // console.log(s, match)
          if (!match) break
          resp[match[1]] = resp[match[1]] || {}
          if (!isNaN(parseInt(match[2]))) Object.assign(resp[match[1]], { start: parseInt(match[2]) })
          if (!isNaN(parseInt(match[3]))) Object.assign(resp[match[1]], { step: parseInt(match[3]) })
          s = s.substr(match.index + match[0].length)
          // console.log('!', resp)
        }
      } else {
        let regex = new RegExp(`{(${word}):}`)
        while (true) {
          const match = regex.exec(s)
          if (!match) break
          resp[match[1]] = true
          s = s.substr(match.index + match[0].length)
        }
      }
    }
    return resp
  }
}

// function testPlaceholderRenderer () {
//   let renderer = new PlaceholderRenderer()
//   const resp = renderer.parse('1213{page:}1{page:1:2}{keyword:}{idCode:}{cidCode:}')
//   console.log('TEST parse', resp)
//   const resp = renderer.render('1213{page:}1{page:1:2}{keyword:}{idCode:}{cidCode:}', {
//     page: 888,
//     keyword: '搜索词'
//   })
//   console.log('TEST render', resp)
// }

// testPlaceholderRenderer()

const basicConfig = {
  selector: '',
  function: '',
  param: '',
  regex: '',
  replace: ''
}

const commonListConfig = {
  url: '',
  item: Object.assign({}, basicConfig),
  idCode: Object.assign({}, basicConfig),
  title: Object.assign({}, basicConfig),
  cover: Object.assign({}, basicConfig),
  author: Object.assign({}, basicConfig),
  pubTime: Object.assign({}, basicConfig),
  updateTime: Object.assign({}, basicConfig),
  rating: Object.assign({}, basicConfig),
  likes: Object.assign({}, basicConfig),
  views: Object.assign({}, basicConfig),
  imageCount: Object.assign({}, basicConfig)
}

class ComicParser {
  constructor () {
    this.config = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36'
      },
      search: Object.assign({}, commonListConfig), // 搜索页
      list: [], // 多种列表页
      detail: {}, // 详情页
      browse: {} // 浏览页
    }

    this.renderer = new PlaceholderRenderer()
  }

  setHeaders (headers) {
    Object.assign(this.config.headers, headers)
  }

  setSearchConfig (config) {
    this.config.search = config
  }

  addOrUpdateListConfig (name, config) {
    config.name = name
    for (let i = 0; i < this.list.length; ++i) {
      if (this.list[i].name === name) {
        this.list[i] = config
        return
      }
    }
    this.list.push(config)
  }

  removeListConfig (name) {
    for (let i = 0; i < this.list.length; ++i) {
      if (this.list[i].name === name) {
        this.list.splice(i, 1)
        return
      }
    }
  }

  setDetailConfig (config) {
    this.config.detail = config
  }

  setBrowseConfig (config) {
    this.config.browse = config
  }

  genPage (url, page) {
    const args = this.renderer.parse(url)
    let pageStart = 1
    let pageStep = 1
    if (args.page !== undefined && args.page.start !== undefined) pageStart = args.page.start
    if (args.page !== undefined && args.page.step !== undefined) pageStep = args.page.step
    return (page - 1) * pageStep + pageStart
  }

  parseBasicConfig (data, config) { // 解析basicConfig的东西
    if (typeof (data) === 'object') { // 期望selector是$.xx.xx...的形式
      let resp = Function('data', 'return ' + config.selector.replace(/\$/g, 'data'))(data)
      // TODO 处理下面的几个参数
      return resp
    } else {
      // TODO
    }
  }

  parsePageConfig (data, config) { // 解析形如commonListConfig的东西
    let items = this.parseBasicConfig(data, config.item)
    if (items instanceof Array) {
      let resp = []
      for (let i = 0; i < items.length; ++i) {
        const item = items[i]
        let d = {}
        for (let key in config) {
          if (key === 'item') continue
          if (typeof (config[key]) !== 'object') continue
          d[key] = this.parseBasicConfig(item, config[key])
        }
        resp.push(d)
      }
      return resp
    } else {
      return items
    }
  }

  search (keyword, page) {
    page = page || 1
    let url = this.renderer.render(this.config.search.url, {
      keyword: keyword,
      page: this.genPage(this.config.search.url, page)
    })
    axios({
      method: 'get',
      url: url,
      header: this.config.headers
    }).then(res => {
      console.log(res)
      const parsedResp = this.parsePageConfig(res.data, this.config.search)
      console.log('parsedResp', parsedResp)
      return parsedResp
    }).catch(err => {
      console.error(err)
    })
  }
}

let parser = new ComicParser()

// test
parser.setSearchConfig({
  url: 'https://copymanga.com/api/kb/web/search/comics?offset={page:0:12}&platform=2&limit=12&q={keyword:}&q_type=',
  item: { selector: '$.results.list' },
  idCode: { selector: '$.path_word' },
  title: { selector: '$.name' },
  cover: { selector: '$.cover' },
  author: { selector: '$.author[0].name' }
})
parser.search('勇者')

export default parser
