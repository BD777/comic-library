<template>
  <div style="padding: 15px;">
    <h1><a-icon type="setting" /> 设置</h1>
    <a-card hoverable style="cursor: initial;">
      <a-form-model :model="setting" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
        <a-form-model-item label="存储目录">
          <span>{{ setting.savePath }}</span>
          <a-button style="margin-left: 10px;" icon="folder" @click="selectSavePath" size="small">选择</a-button>
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button type="primary" @click="onSave" icon="save">
            保存
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
  </div>
</template>

<script>
const dao = require('../dao').default
const { remote } = require('electron')

export default {
  name: 'global-setting',
  components: {},
  data () {
    return {
      setting: {}
    }
  },
  methods: {
    async selectSavePath () {
      const result = await remote.dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (!result) return
      this.setting.savePath = result[0]
    },
    async onSave () {
      try {
        const resp = await dao.updateGlobalSetting(this.setting)
        console.log('onSave', resp)
        this.$message.success(`更新成功`)
      } catch (e) {
        this.$message.error(`更新失败：${e}`)
        console.error(e)
      }
    }
  },
  async mounted () {
    this.setting = await dao.getGlobalSetting()
    console.log('GlobalSetting mounted', this.setting)
  }
}
</script>

<style scoped>
</style>
