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
      if (query[word]) {
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

const commonPageConfig = {
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
      search: Object.assign({}, commonPageConfig), // 搜索页
      list: [], // 多种列表页
      detail: {}, // 详情页
      browse: {} // 浏览页
    }

    this.renderer = new PlaceholderRenderer()
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
}

let parser = new ComicParser()

export default parser
