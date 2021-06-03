<template>
  <div style="margin: 10px 0;">
    <!-- 普通平铺的漫画列表页 -->
    <!-- TODO 不知道总数的改成下拉分页，pagination就不放这里了，放外面 -->
    <a-list
     :loading="loading"
    >
      <comic-card
      v-for="comic in comics"
      :key="comic[comicKey]"
      :comic="comic"
      :coverRatio="coverRatio"
      :style="`width: ${cardWidth}`"
      class="comic-card"
      :editable="editable"
      :deletable="deletable"
      @edit="editComic(comic)"
      @click="clickComic(comic)"
      @delete="deleteComic(comic)"
      />
      <div
        v-if="showLoadingMore && comics.length > 0"
        slot="loadMore"
        :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }"
      >
        <a-button type="link" @click="loadMore" :disabled="loading">
          <span>加载更多</span>
          <div style="margin-top: 2px;"><a-icon type="down" /></div>
        </a-button>
      </div>
    </a-list>
  </div>
</template>

<script>
import ComicCard from './ComicCard.vue'

export default {
  name: 'comic-card-list',
  components: {
    ComicCard
  },
  props: {
    comics: Array,
    comicKey: String, // 表明comics中的object哪个key可以作为列表的key
    cardWidth: {
      type: String,
      default: '240px'
    },
    coverRatio: {
      type: Number,
      default: 3 / 4 // = width / height
    },
    editable: {
      type: Boolean,
      default: false
    },
    deletable: {
      type: Boolean,
      default: false
    },
    showLoadingMore: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
    }
  },
  methods: {
    editComic (comic) {
      console.log('editComic', comic)
      this.$emit('edit', comic)
    },
    clickComic (comic) {
      this.$emit('click', comic)
    },
    deleteComic (comic) {
      this.$emit('delete', comic)
    },
    loadMore () {
      this.$emit('loadMore')
    }
  },
  mounted () {

  }
}
</script>

<style scoped>
.comic-card {
  display: inline-block;
  vertical-align: top;
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
