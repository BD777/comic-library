<template>
  <a-card
    hoverable
    class="comic-card"
    ref="comic-card"
  >
    <img
      referrerpolicy="no-referrer"
      slot="cover"
      :alt="comic.title"
      :src="parseImageUrl(comic.cover)"
      @click="toRead(comic)"
      class="cover"
      :height="coverHeight"
    />
    <a-card-meta>
      <template slot="title">
        <span class="text-line-2" style="white-space: normal;" @click="toRead(comic)">
          {{ comic.title }}
        </span>
      </template>
      <template slot="description">
        <span @click="toRead(comic)" class="text-line-3">{{ comic.intro }}</span>
      </template>
    </a-card-meta>
    <template v-if="editable || deletable" slot="actions" class="ant-card-actions">
      <a-icon v-if="editable" type="edit" @click="editComic(comic)" />
      <a-popconfirm v-if="deletable" placement="top" ok-text="Yes" cancel-text="No" @confirm="deleteComic(comic)">
        <template slot="title">
          <p>确认删除？<span style="font-size: 0.9em; color: #888">（不会删除本地文件）</span></p>
        </template>
        <a-icon type="delete" />
      </a-popconfirm>
    </template>

    <div v-if="comic.author" style="margin-top: 10px">
      <span>作者：{{ comic.author }}</span>
    </div>
    <div v-if="comic.tags && comic.tags.length > 0" style="margin-top: 10px;">
      <a-tag color="green" v-for="tag in comic.tags" :key="tag">
        {{ tag }}
      </a-tag>
    </div>
  </a-card>
</template>

<script>
export default {
  name: 'comic-card',
  props: {
    comic: Object,
    editable: {
      type: Boolean,
      default: false
    },
    deletable: {
      type: Boolean,
      default: false
    },
    coverRatio: {
      type: Number,
      default: 3 / 4 // = width / height
    }
  },
  data () {
    return {
      coverHeight: ''
    }
  },
  methods: {
    editComic (comic) {
      console.log('editComic', comic)
      this.$emit('edit', comic)
    },
    toRead (comic) {
      this.$emit('click', comic)
    },
    deleteComic (comic) {
      this.$emit('delete', comic)
    },
    parseImageUrl (url) {
      if (url.search('http') === 0) return url
      else return 'file://' + url
    }
  },
  mounted () {
    // console.log('ComicCard mounted', this.$refs['comic-card'].$el.clientWidth)
    this.coverHeight = this.$refs['comic-card'].$el.clientWidth / this.coverRatio
  }
}
</script>

<style scoped>
.text-line-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.text-line-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.text-line-3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.cover {
  width: 100%;
  object-fit: cover;
}
.comic-card {

}
</style>
