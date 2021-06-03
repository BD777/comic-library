// const axios = require('axios').default
const cheerio = require('cheerio')
const requests = require('../requests').default

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
  name: '',
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

const commonDetailConfig = {
  title: Object.assign({}, basicConfig),
  intro: Object.assign({}, basicConfig),
  cover: Object.assign({}, basicConfig),
  category: Object.assign({}, basicConfig),
  author: Object.assign({}, basicConfig),
  pubTime: Object.assign({}, basicConfig),
  updateTime: Object.assign({}, basicConfig),
  rating: Object.assign({}, basicConfig),
  likes: Object.assign({}, basicConfig),
  views: Object.assign({}, basicConfig),
  imageCount: Object.assign({}, basicConfig),
  imageConfig: {
    item: Object.assign({}, basicConfig),
    thumbnail: Object.assign({}, basicConfig),
    url: Object.assign({}, basicConfig) // ?
  },
  tagConfig: {
    item: Object.assign({}, basicConfig),
    name: Object.assign({}, basicConfig),
    url: Object.assign({}, basicConfig)
  },
  chapterConfig: {
    item: Object.assign({}, basicConfig),
    idCode: Object.assign({}, basicConfig),
    title: Object.assign({}, basicConfig),
    updateTime: Object.assign({}, basicConfig),
    url: Object.assign({}, basicConfig) // ?
  }
}

const commonBrowseConfig = {
  item: Object.assign({}, basicConfig),
  image: Object.assign({}, basicConfig),
  imageCount: Object.assign({}, basicConfig),
  pageCount: Object.assign({}, basicConfig)
}

class ComicParser {
  constructor () {
    this.basicConfig = basicConfig
    this.commonListConfig = commonListConfig
    this.commonDetailConfig = commonDetailConfig
    this.commonBrowseConfig = commonBrowseConfig

    this.config = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36'
      }
    }

    this.site = {
      name: '',
      search: {
        url: '',
        rule: ''
      },
      detail: {
        url: ''
      },
      browse: {
        url: ''
      },
      list: [],
      general: {
        cookie: '',
        localStorage: ''
      },

      rules: {
        list: [], // 列表页 { rule: {}, id: 1 }
        // 下面就先简单搞只有一种页面形态的吧（偷懒）
        detail: Object.assign({}, this.commonDetailConfig),
        browse: Object.assign({}, this.commonBrowseConfig)
      }
    }

    this.renderer = new PlaceholderRenderer()
  }

  setHeaders (headers) {
    Object.assign(this.config.headers, headers)
  }

  setSite (site) {
    this.site = Object.assign({}, site)
    console.log('ComicParser setSite', this.site)
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
    // console.log('parseBasicConfig', typeof (data), config)

    let handleRegexAndReplace = (resp) => {
      if (config.regex) {
        const reg = new RegExp(config.regex)
        const matches = resp.match(reg)
        if (config.replace) {
          if (config.replace.search('\\|{source:}') === -1) { // 不考虑替换为原文
            return resp.replace(reg, config.replace)
          } else {
            if (!matches) return resp
            const replace = config.replace.replace('\\|{source:}', '')
            return resp.replace(reg, replace)
          }
        } else {
          if (matches) {
            return matches[1]
          } else return ''
        }
      }

      return resp
    }

    let isNode = (e) => {
      return e.constructor.toString().search('class Node') !== -1
    }

    let isCheerioObject = (e) => {
      return e instanceof cheerio.load('').constructor
    }

    let isCheerioSelector = (e) => {
      return e.constructor.toString().search('selector') !== -1
    }

    let isString = (e) => {
      return typeof (e) === 'string'
    }

    let isNormalObject = (e) => { // 普通字典
      return typeof (e) === 'object' && (!isNode(e)) && (!isCheerioObject(e)) && (!isCheerioSelector(e))
    }

    let getElem = (e, selector) => { // 总之获得一个cheerio的选择器
      if (isString(e)) {
        let $ = cheerio.load(e)
        if (selector !== 'this') return $(selector)
      } else if (isCheerioObject(e)) {
        if (selector !== 'this') return e(selector)
      } else if (isCheerioSelector(e)) {
        return e
      } else if (isNode(e)) {
        if (selector !== 'this') {
          return cheerio.load(e)(selector)
        } else {
          return cheerio.load('')(e)
        }
      }
      // not expect here
    }

    if (isNormalObject(data)) { // 期望selector是$.xx.xx...的形式
      let resp = Function('data', 'return ' + config.selector.replace(/\$/g, 'data'))(data)
      if (isString(resp)) resp = handleRegexAndReplace(resp)
      return resp
    } else {
      // get the element
      let elem = getElem(data, config.selector)

      // handle function
      const functions = config.function.split(',').map(s => s.trim())
      let resp
      for (let i = 0; i < functions.length; ++i) {
        let func = functions[i]
        if (func === 'html') {
          resp = elem.html()
        } else if (func === 'text') {
          resp = elem.text()
        } else if (func === 'attr') {
          // do with param
          const params = config.param.split(',').map(s => s.trim())
          for (let j = 0; j < params.length; ++j) {
            let param = params[j]
            resp = elem.attr(param)
            if (resp) break // first valid result
          }
        } else {
          return elem // in this case, ignore the former process and just return the element.
        }
        if (resp) break // first valid result
      }

      if (!resp) return ''

      // handle regex and replacement
      resp = handleRegexAndReplace(resp)
      return resp.split(/\s/g).map(s => s.trim()).filter(s => s.trim().length > 0).join(' ')
    }
  }

  isBaseConfig (config) {
    const keys = Object.keys(basicConfig)
    for (let i = 0; i < keys.length; ++i) {
      if (!(keys[i] in config)) return false
    }
    return true
  }

  isConfigEmpty (config) {
    for (let key in config) {
      if (config[key].trim()) return false
    }
    return true
  }

  parseConfig (data, config) {
    if ('item' in config) {
      if (this.isConfigEmpty(config.item)) return []
      let resp = []
      let items = this.parseBasicConfig(data, config.item)
      if (typeof (items) === 'string') { // try JSON.parse for some case
        try {
          let tmp = JSON.parse(items)
          items = tmp
        } catch (e) {
          // pass
        }
      }
      if (items.length === undefined) {
        console.log('??', config.item, items, typeof (items), (items instanceof Array))
        items = [items]
      }
      for (let i = 0; i < items.length; ++i) {
        let item = items[i]
        let d = {}
        for (let key in config) {
          if (key === 'item') continue
          if (typeof (config[key]) !== 'object') continue
          if (this.isBaseConfig(config[key])) {
            if (!this.isConfigEmpty(config[key])) d[key] = this.parseBasicConfig(item, config[key])
          } else d[key] = this.parseConfig(item, config[key])
        }
        resp.push(d)
      }
      return resp
    } else {
      let d = {}
      for (let key in config) {
        if (typeof (config[key]) !== 'object') continue
        if (this.isBaseConfig(config[key])) {
          if (!this.isConfigEmpty(config[key])) d[key] = this.parseBasicConfig(data, config[key])
        } else d[key] = this.parseConfig(data, config[key])
      }
      return d
    }
  }

  parseListPageConfig (data, config) { // 解析形如commonListConfig的东西
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

  parseDetailPageConfig (data, config) { // 解析形如commonDetailConfig的东西
    let d = {}
    for (let key in config) {
      if (typeof (config[key]) !== 'object') continue
      if (key.search('Config') === key.length - 6) { // endswith
        d[key] = {}
        for (let subKey in config[key]) {
          d[key][subKey] = this.parseBasicConfig()
        }
      }
      d[key] = this.parseBasicConfig(data, config[key])
    }
    return d
  }

  getListRuleById (id) {
    for (let i = 0; i < this.site.rules.list.length; ++i) {
      if (this.site.rules.list[i].id === id) return this.site.rules.list[i]
    }
  }

  search (keyword, page) {
    page = page || 1
    let url = this.renderer.render(this.site.search.url, {
      keyword: keyword,
      page: this.genPage(this.site.search.url, page)
    })
    return requests.get({
      url: url,
      headers: this.config.headers,
      jsNeeded: this.site.search.jsNeeded,
      proxy: this.site.general.proxy
    }).then(res => {
      console.log(res)
      const listPageConfig = this.getListRuleById(this.site.search.ruleId)
      console.log('getListRuleById', listPageConfig, this.site.search)
      // const parsedResp = this.parseListPageConfig(res.data, listPageConfig.rule)
      const parsedResp = this.parseConfig(res.data, listPageConfig.rule)
      console.log('parsedResp', parsedResp)
      return parsedResp
    }).catch(err => {
      console.error(err)
    })
  }

  getDetail (idCode) {
    let url = this.renderer.render(this.site.detail.url, {
      idCode: idCode
    })
    return requests.get({
      url: url,
      headers: this.config.headers,
      jsNeeded: this.site.detail.jsNeeded,
      proxy: this.site.general.proxy
    }).then(res => {
      console.log(res)
      const detailPageConfig = this.site.rules.detail
      // console.log('detailPageConfig', detailPageConfig)
      // parse
      const parsedResp = this.parseConfig(res.data, detailPageConfig)
      console.log('parsedResp', parsedResp)
      return parsedResp
    })
  }

  async getBrowse (idCode, page) {
    // page start from 1, if not exists, return []
    page = page || 1
    const args = this.renderer.parse(this.site.browse.url)
    if (!args.page && page > 1) return []

    let url = this.renderer.render(this.site.browse.url, {
      idCode: idCode,
      page: page
    })
    console.log('getBrowse', idCode, page, this.site.browse.url, url)
    return requests.get({
      url: url,
      headers: this.config.headers,
      jsNeeded: this.site.browse.jsNeeded,
      cookie: this.site.general.cookie,
      localStorage: this.site.general.localStorage,
      proxy: this.site.general.proxy
    }).then(res => {
      // console.log('getBrowse resp', url, res.data)
      const browsePageConfig = this.site.rules.browse
      const parsedResp = this.parseConfig(res.data, browsePageConfig)
      console.log('parsedResp', parsedResp)
      return parsedResp
    })
  }

  async getList (listId, page) {
    page = page || 1
    let listItem = this.site.list.filter(d => d.id === listId)[0]
    if (!listItem) return []

    const args = this.renderer.parse(listItem.url)
    if (!args.page && page > 1) return []

    let url = this.renderer.render(listItem.url, {
      page: this.genPage(listItem.url, page)
    })
    return requests.get({
      url: url,
      header: this.config.headers,
      jsNeeded: listItem.jsNeeded,
      proxy: this.site.general.proxy
    }).then(res => {
      console.log(res)
      const listPageConfig = this.getListRuleById(listItem.ruleId)
      console.log('getListRuleById', listPageConfig, listItem)
      // const parsedResp = this.parseListPageConfig(res.data, listPageConfig.rule)
      const parsedResp = this.parseConfig(res.data, listPageConfig.rule)
      console.log('parsedResp', parsedResp)
      return parsedResp
    }).catch(err => {
      console.error(err)
    })
  }
}

let parser = new ComicParser()

// test
// parser.setSearchConfig({
//   url: 'https://copymanga.com/api/kb/web/search/comics?offset={page:0:12}&platform=2&limit=12&q={keyword:}&q_type=',
//   item: { selector: '$.results.list' },
//   idCode: { selector: '$.path_word' },
//   title: { selector: '$.name' },
//   cover: { selector: '$.cover' },
//   author: { selector: '$.author[0].name' }
// })
// parser.search('勇者')

export default parser
