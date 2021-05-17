<template>
  <a-card
    hoverable
  >
    <img
      slot="cover"
      :alt="comic.title"
      :src="`file://${comic.cover}`"
      @click="toRead(comic)"
    />
    <a-card-meta>
      <template slot="title">
        <span class="text-line-2" style="white-space: normal;" @click="toRead(comic)">
          {{ comic.title }}
        </span>
      </template>
      <template slot="description">
        <span @click="toRead(comic)">{{ comic.desc }}</span>
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

    <div style="margin-top: 10px;">
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
    }
  },
  data () {
    return {}
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
    }
  },
  mounted () {

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
</style>
