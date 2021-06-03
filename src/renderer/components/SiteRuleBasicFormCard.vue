<template>
  <a-card
   :title="title"
   :bordered="false"
   :style="`width: 300px; background-color: ${backgroundColor};`"
   :bodyStyle="{ padding: '10px 20px 15px' }"
   :headStyle="{}"
  >
    <a slot="extra" @click="clear">clear</a>
    <a-row class="input-row" type="flex" justify="space-around" align="middle" :gutter="20">
      <a-col :span="5">
        <span>Selector</span>
      </a-col>
      <a-col :span="19">
        <a-input v-model="value.selector" size="small" class="simple-input" :style="`background-color: ${backgroundColor};`" @change="onAnyChange" />
      </a-col>
    </a-row>

    <a-row class="input-row" type="flex" justify="space-around" align="middle" :gutter="20">
      <a-col :span="5">
        <span>Function</span>
      </a-col>
      <a-col :span="19">
        <a-input v-model="value.function" size="small" class="simple-input" :style="`background-color: ${backgroundColor};`" @change="onAnyChange" />
      </a-col>
    </a-row>

    <a-row class="input-row" type="flex" justify="space-around" align="middle" :gutter="20">
      <a-col :span="5">
        <span>Param</span>
      </a-col>
      <a-col :span="19">
        <a-input v-model="value.param" size="small" class="simple-input" :style="`background-color: ${backgroundColor};`" @change="onAnyChange" />
      </a-col>
    </a-row>

    <a-row class="input-row" type="flex" justify="space-around" align="middle" :gutter="20">
      <a-col :span="5">
        <span>Regex</span>
      </a-col>
      <a-col :span="19">
        <a-input v-model="value.regex" size="small" class="simple-input" :style="`background-color: ${backgroundColor};`" @change="onAnyChange" />
      </a-col>
    </a-row>

    <a-row class="input-row" type="flex" justify="space-around" align="middle" :gutter="20">
      <a-col :span="5">
        <span>Replace</span>
      </a-col>
      <a-col :span="19">
        <a-input v-model="value.replace" size="small" class="simple-input" :style="`background-color: ${backgroundColor};`" @change="onAnyChange" />
      </a-col>
    </a-row>

  </a-card>
</template>

<script>
export default {
  name: 'site-rule-basic-form-card',
  components: {},
  props: {
    title: String,
    value: {
      type: Object,
      default: function () {
        return {
          selector: '',
          function: '',
          param: '',
          regex: '',
          replace: ''
        }
      }
    },
    backgroundColor: {
      type: String,
      default: '#FFF'
    }
  },
  data () {
    return {}
  },
  methods: {
    clear () {
      this.value.selector = ''
      this.value.function = ''
      this.value.param = ''
      this.value.regex = ''
      this.value.replace = ''
      this.onAnyChange()
    },
    onAnyChange () {
      this.$emit('change', this.value)
    }
  },
  mounted () {

  },
  watch: {
    value (to, from) {
      // console.log('SiteRuleBasicFormCard watch value', to, from)
    }
  }
}
</script>

<style scoped>
.input-row {
  margin-bottom: 7px;
}
.simple-input {
  border: 0;
  border-bottom: solid 1px #ddd;
  border-radius: 0;
}
.simple-input:focus {
  box-shadow: none;
  border-bottom: solid 1px #40a9ff;
}
</style>
