<script setup>
import Record from './ChatRecord.vue'
import Input from './ChatInput.vue'
</script>

<template>
  <div class="chat">
    <Record />
    <Input />
  </div>
</template>

<style>
.chat {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  background-color: var(--chat-bg-color);
}
</style>
