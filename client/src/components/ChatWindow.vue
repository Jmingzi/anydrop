<script setup>
import Tab from './Tab.vue'
import ChatList from './ChatList.vue'
import Chat from './Chat.vue'
</script>

<template>
  <div class="chat-window">
    <Tab />
    <ChatList />
    <Chat />
  </div>
</template>

<style>
.chat-window {
  display: flex;
  width: 927px;
  height: 694px;
  position: absolute;
  top: 50%;
  left: 50%;
  overflow: auto;
  transform: translate(-50%, -50%);
  border: 1px #eee solid;
  border-radius: 10px;
}
</style>
