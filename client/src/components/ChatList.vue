<script setup>
import Avatar from './Avatar.vue'
import { useStore } from '../store'
import { inject } from 'vue'

const { chatList, self } = useStore()
const mobile = inject('mobile', false)
</script>

<template>
  <div v-if="!mobile" class="chat-list">
    <div class="chat-list__top">
      <div class="chat-list__search">
        <span>搜索</span>
      </div>
    </div>

    <div
      v-for="chat in chatList"
      :key="chat.id"
      class="chat-list__item"
      :class="{
        active: chat.id === self.id
      }"
    >
      <Avatar :id="chat.id" :name="chat.name" size="medium" />
      <div class="chat-list__item-content">
        <p class="chat-list__item-name">
          {{ chat.id === self.id ? `我(${chat.name})` : chat.name }}
        </p>
        <p class="chat-list__item-id">ID: {{ chat.id.split('-').slice(3).join('-') }}</p>
      </div>
    </div>
  </div>
</template>

<style>
.chat-list {
  width: 260px;
  height: 100%;
  background-color: var(--chat-list-bg-color);
}
.chat-list__item {
  display: flex;
  align-items: center;
  height: 68px;
  padding: 0 15px;
  font-size: 14px;
  color: var(--text-color);
}
.chat-list__item.active {
  background-color: #303030;
}
.chat-list__item-content {
  margin-left: 10px;
}
.chat-list__item-id {
  color: var(--text-system-color);
  white-space: nowrap;
}
.chat-list__top {
  display: flex;
  align-items: center;
  height: var(--header-height);
  border-bottom: 1px solid var(--border-color);
}
.chat-list__search {
  background-color: #202020;
  height: 25px;
  margin: 0 15px;
  padding: 0 10px;
  flex-grow: 1;
  border-radius: 3px;
}
.chat-list__search span {
  color: #646464;
  font-size: 12px;
}
</style>
