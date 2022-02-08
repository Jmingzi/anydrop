<script setup>
import { useFilePreviewer, closePreview } from './file-previewer'
import { computed } from 'vue'

const { content, show, type } = useFilePreviewer()
const isImage = computed(() => content.value.startsWith('data:image'))
const isText = computed(() => type.value.includes('text') || type.value.includes('json'))
</script>

<template>
  <div v-if="show" class="file-previewer">
    <div class="file-previewer__title">
      <div class="file-previewer__close" @click="closePreview">
        <svg t="1644297954520" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5085" width="15" height="15"><path d="M512 505.06752m-431.83616 0a431.83616 431.83616 0 1 0 863.67232 0 431.83616 431.83616 0 1 0-863.67232 0Z" fill="#A7A6A6" p-id="5086" data-spm-anchor-id="a313x.7781069.0.i19" class="selected"></path><path d="M720.6912 661.5552l-52.20352 52.20352L512 557.27104l-156.48768 156.48768L303.3088 661.5552l156.4928-156.48768L303.3088 348.57984l52.16256-52.1984 156.5184 156.49792 156.49792-156.49792 52.20352 52.1984-156.50304 156.4928z" fill="#171717" p-id="5087" data-spm-anchor-id="a313x.7781069.0.i18" class=""></path></svg>
      </div>
    </div>
    <div class="file-previewer__box">
      <div v-if="isImage" class="file-previewer__img">
        <img :src="content" alt="">
      </div>
      <div v-else-if="isText" class="file-previewer__text">
        <pre>{{ content }}</pre>
      </div>
      <span v-else style="color: #fff">
        暂不支持预览，请下载
      </span>
    </div>
  </div>
</template>

<style>
.file-previewer {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 446px;
  height: 484px;
  background-color: #2C2C2C;
  border: 1px #666 solid;
  border-radius: 10px;
  overflow: hidden;
}
.file-previewer__title {
  display: flex;
  align-items: center;
  height: 38px;
  background-color: var(--chat-bg-color);
  padding: 0 10px;
}
.file-previewer__box {
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 38px);
}
.file-previewer__close {
}
.file-previewer__text {
  width: 100%;
  padding: 20px;
  height: 100%;
  overflow: auto;
}
.file-previewer__text pre {
  font-size: 13px;
  color: #fff;
  /*white-space: nowrap;*/
}
</style>
