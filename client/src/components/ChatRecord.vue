<script setup>
import Msg from './Msg.vue'
import { useStore } from '../store'
import { ref, watch } from 'vue'

const boxRef = ref(null)
const containerRef = ref(null)
const { chatList, self, msgList } = useStore()

watch(() => msgList.value.length, () => {
  setTimeout(() => {
    boxRef.value.scrollTop = containerRef.value.getBoundingClientRect().height
  })
})
</script>

<template>
  <div class="chat-record" ref="boxRef">
    <div class="chat-record__container" ref="containerRef">
      <div class="chat-record__title">
        <span class="chat-record__title-text">AnyDrop ({{ chatList.length }})</span>
      </div>

      <Msg
        v-for="(msg, index) in msgList"
        :key="index"
        :msg="msg"
        :self="msg.sender.id === self.id"
      />
    </div>
  </div>
</template>

<style>
.chat-record {
  width: 100%;
  height: 535px;
  border-bottom: 1px solid var(--border-color);
  overflow: auto;
  padding-bottom: 100px;
}
.chat-record__title {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 0 20px;
  background-color: var(--chat-bg-color);
  z-index: 2;
}
.chat-record__title-text {
  font-size: 18px;
}
</style>
