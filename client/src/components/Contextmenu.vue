<script setup>
import { inject, computed, watchEffect, toRaw, getCurrentInstance } from 'vue'
import { MESSAGE } from '../../../server/constant'
import { setState as setFilePreviewer, downloadBlob } from './file-previewer'

defineProps({
  msg: {
    type: Object,
    default: () => ({})
  }
})

const instance = getCurrentInstance()
const show = inject('show')
const bubbleRect = inject('bubbleRect')
const position = inject('position')
const msg = computed(() => instance.parent.props.msg)
const isFile = computed(() => msg.value.type === MESSAGE.FILE)
const isText = computed(() => msg.value.type === MESSAGE.TEXT)
const style = computed(() => {
  if (show.value) {
    const box = document.querySelector('.chat-record')
    const { left, top } = bubbleRect.value
    const { x, y } = position.value
    return {
      left: x - left + 'px',
      top: y - top + box.scrollTop + 'px'
    }
  }
})

function openFile () {
  if (msg.value.blob) {
    setFilePreviewer(msg.value.blob, msg.value.data.type)
  }
}

function downloadFile () {
  if (msg.value.blob) {
    downloadBlob(msg.value.blob, msg.value.data.name)
  }
}

function copyText () {
  const text = msg.value.data
  const input = document.createElement('input')
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

function handleClick () {
  document.body.click()
}
</script>

<template>
  <div
    v-if="show"
    class="msg__contextmenu"
    :style="style"
    @click.stop="handleClick"
  >
    <div v-if="isText" class="msg__contextmenu-item" @click="copyText">
      <span>复制</span>
    </div>
    <template v-if="isFile">
      <div class="msg__contextmenu-item" @click="openFile">
        <span>查看</span>
      </div>
      <div class="msg__contextmenu-item" @click="downloadFile">
        <span>下载</span>
      </div>
    </template>
  </div>
</template>

<style>
.msg__contextmenu {
  position: absolute;
  left: 10px;
  top: 10px;
  width: 66px;
  background-color: var(--contextmenu-bg-color);
  border-radius: 6px;
  border: 1px solid #525154;
  padding: 7px 12px;
  font-size: 14px;
  z-index: 2;
}
.msg__contextmenu-item {
  cursor: pointer;
}
.msg__contextmenu-item:not(:last-child) {
  padding-bottom: 5px;
}
</style>
