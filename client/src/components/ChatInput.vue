<script setup>
import Tool from './InputTool.vue'
import { inject, ref } from 'vue'
import { sendMessage } from '../store'
import { useAudio } from './audio-notice'

const mobile = inject('mobile', false)
const { playAudio } = useAudio('send')
const content = ref('')
const textarea = ref(null)
function send () {
  if (content.value) {
    sendMessage(content.value)
    content.value = ''
    if (mobile) {
      textarea.value.blur()
    }
    playAudio()
  }
}
</script>

<template>
  <div class="chat-input">
    <Tool />
    <textarea
      v-model="content"
      :ref="v => textarea = v"
      @keyup.enter.prevent="send"
      placeholder="按回车、换行发送消息..."
    />
  </div>
</template>

<style>
.chat-input {
  width: 100%;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}
.chat-input textarea {
  flex-grow: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 0 15px 15px 15px;
  font-size: 14px;
  background-color: inherit;
  color: var(--text-color);
}
.chat-input textarea::placeholder {
  color: var(--text-system-color);
}
</style>
