<script setup>
import Avatar from './Avatar.vue'
import dayjs from 'dayjs'
import { DEFAULT_MESSAGE, MESSAGE_STATUS } from '../../../server/constant'
import { computed, provide, ref, onMounted, onBeforeUnmount, watchEffect, toRaw } from 'vue'
import prettyBytes from 'pretty-bytes'
import Contextmenu from './Contextmenu.vue'
import { setState as setFilePreviewer } from './file-previewer'
import { iconMap } from '../assets/fileicon'

const props = defineProps({
  self: {
    type: Boolean,
    default: false
  },
  msg: {
    type: Object,
    default: () => JSON.parse(JSON.stringify(DEFAULT_MESSAGE))
  }
})

const bubbleRef = ref(null)
const bubbleRect = ref({})
const contextPosition = ref({})
const showContextmenu = ref(false)

provide('show', showContextmenu)
provide('bubbleRect', bubbleRect)
provide('position', contextPosition)

const statusText = {
  [MESSAGE_STATUS.SENDING]: '发送中',
  [MESSAGE_STATUS.SENT]: '已发送',
  [MESSAGE_STATUS.ERROR]: '发送失败',
  [MESSAGE_STATUS.ERROR_NO_USER]: '没有找到用户'
}

const isText = computed(() => props.msg.type === 'text')
const isFile = computed(() => props.msg.type === 'file')

function formatDate (date) {
  const f = dayjs(date).isBefore(dayjs(), 'day') ? 'YYYY年MM月DD日 HH:mm' : 'HH:mm'
  return dayjs(date).format(f)
}

function handleContextmenu (e) {
  contextPosition.value = {
    x: e.pageX,
    y: e.pageY
  }
  showContextmenu.value = true
}

function hideContextmenu () {
  showContextmenu.value = false
}

function handleClick () {
  if (props.msg.blob) {
    setFilePreviewer(props.msg.blob, props.msg.data.type, props.msg.data.name)
  }
}

function getIcon () {
  const type = props.msg.data.name.split('.').pop()
  // console.log('type', type, iconMap[type])
  return iconMap[type] || iconMap.none
}

onMounted(() => {
  bubbleRect.value = bubbleRef.value.getBoundingClientRect()
  document.addEventListener('click', hideContextmenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', hideContextmenu)
})
</script>

<template>
  <div
    class="msg"
    :class="{ self }"
  >
    <p class="msg__system">{{ formatDate(msg.time) }}</p>
    <div class="msg__content">
      <Avatar :id="msg.sender.id" :name="msg.sender.name" />
      <div class="msg__text">
        <p v-if="!self" class="msg__nick">{{ msg.sender.name }}</p>
        <div
          v-if="isText"
          class="msg__bubble"
          ref="bubbleRef"
          @contextmenu.prevent.stop="handleContextmenu"
        >
          {{ msg.data }}
          <span v-if="self" class="msg__status">{{ statusText[msg.status] }}</span>
          <Contextmenu />
        </div>
        <div
          v-else-if="isFile"
          class="msg__bubble msg__file"
          ref="bubbleRef"
          @click="handleClick"
          @contextmenu.prevent.stop="handleContextmenu"
        >
          <div class="msg__file-content">
            <div class="msg__file-name">{{ msg.data.name }}</div>
            <div class="msg__file-size">{{ prettyBytes(msg.data.size) }}</div>
          </div>
          <div class="msg__file-icon">
            <img :src="getIcon()" alt="" style="width:100%;height:100%">
            <span v-if="msg.progress < 1" class="msg__file-progress">
              <span
                class="msg__file-progress-circle"
                :style="{
                  backgroundImage: `conic-gradient(#fff ${msg.progress * 360}deg, transparent ${msg.progress * 360}deg 360deg)`
                }">
<!--                {{ (msg.progress * 100).toFixed(0) }}%-->
              </span>
            </span>
          </div>
          <span v-if="self" class="msg__status">{{ statusText[msg.status] }}</span>
          <Contextmenu />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.msg {
  position: relative;
  padding: 0 15px;
  font-size: 12px;
}
.msg__system {
  color: var(--text-system-color);
  text-align: center;
  font-size: 12px;
  padding: 35px 0;
}
.self .msg__content {
  flex-direction: row-reverse;
}
.self .msg__text {
  display: flex;
  flex-direction: row-reverse;
}
.self .msg__bubble:not(.self .msg__file) {
  background-color: var(--msg-self-bg-color);
  color: #1D1D1D;
}
.self .msg__contextmenu {
  color: var(--text-color);
}
.self .msg__bubble::before {
  left: initial;
  right: -10px;
  border-right-color: transparent;
  border-left-color: var(--msg-self-bg-color);
}
.self .msg__file::before {
  border-left-color: var(--msg-bg-color);
}
.self .msg__status {
  right: initial;
  left: 0;
}

.msg__content {
  display: flex;
}
.msg__text {
  padding: 0 10px;
  flex-grow: 1;
}
.msg__nick {
  color: var(--text-system-color);
  margin-bottom: 5px;
}
.msg__bubble {
  position: relative;
  background-color: var(--msg-bg-color);
  padding: 10px;
  border-radius: 4px;
  color: var(--text-color);
  font-size: 14px;
  max-width: 65%;
  width: fit-content;
}
.msg__bubble::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 12px;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-right-color: var(--msg-bg-color);
}
.msg__status {
  position: absolute;
  right: 0;
  bottom: -25px;
  font-size: 12px;
  color: var(--text-system-color);
  white-space: nowrap;
}

.msg__file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 230px;
  height: 62px;
  font-size: 14px;
}
.msg__file-size {
  color: var(--text-system-color);
  margin-top: 5px;
  font-size: 13px;
}
.msg__file-icon {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 40px;
  height: 40px;
  border-radius: 4px;
}
.msg__file-icon img {
  max-width: 100%;
  max-height: 100%;
}
.msg__file-content {
  max-width: 70%;
}
.msg__file-name {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.msg__file-progress {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.msg__file-progress-circle {
  display: block;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background-color: rgba(0,0,0,.6);
  /*background-image: conic-gradient(#fff 36deg, transparent 36deg 360deg);*/
}
</style>
