# comic-library

> comic-library，管理本地漫画。当然，也可以拿来看别的图片。

## 简介
初衷：
1. 想在PC上也管理一下看过的或没看过的漫画
2. 想要一个简单舒服的图片浏览器
3. 希望comic-library能成熟一点，主动去下载好看的漫画回来

于是大概就往这个方向去做这个东西。

## 初步想法 / 20210516
0. 漫画阅读器：排版（左右、右左、单页、滚动）
1. 本地管理：导入，排序，排版方法
2. 通用规则：自定义规则来抓网站的内容，规定一些概念如 搜索页、列表页、详情页、图片，css selector放进去然后收录。
3. 缓存：下载上述规则能拿到的数据


## Update
### 20210517
周日肝了一天，搞出第一个版本。简单自测能用。说不定有bug，issue见。
1. 漫画阅读器：排版（左右、右左、单页、滚动）
2. 本地管理：导入，排序，排版方法

 - windows安装包：[release 0.0.1](https://github.com/BD777/comic-library/releases/tag/0.0.1)
 - mac安装包：~~我没设备编不了...~~


## 感谢前人的技术
 - 脚手架 [electron-vue](https://github.com/SimulatedGREG/electron-vue)
 - UI库 [Ant Design of Vue](https://antdv.com/docs/vue/introduce-cn/)
 - The JavaScript Database [nedb](https://github.com/louischatriot/nedb)
