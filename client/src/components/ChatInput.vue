<script setup>
import Tool from './InputTool.vue'
import { ref } from 'vue'
import { sendMessage } from '../store'

const content = ref('')
function send () {
  if (content.value) {
    sendMessage(content.value)
    content.value = ''
  }
}
</script>

<template>
  <div class="chat-input">
    <Tool />
    <textarea
      v-model="content"
      @keyup.enter.prevent="send"
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
</style>
