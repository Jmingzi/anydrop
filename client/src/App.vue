<script setup>
import ChatWindow from './components/ChatWindow.vue'
import FilePreviewer from './components/FilePreviewer.vue'
</script>

<template>
  <ChatWindow />
  <FilePreviewer />
</template>

<style>
body {
  --text-color: #E7E7E7;
  --text-system-color: #595959;
  --tab-bg-color: #282430;
  --chat-list-bg-color: #191919;
  --chat-bg-color: #111111;
  --border-color: #1D1D1D;
  --msg-bg-color: #2C2C2C;
  --msg-self-bg-color: #59B269;
  --contextmenu-bg-color: #282629;
  --header-height: 60px;
}
</style>
