<script setup>
import { inject } from 'vue'

const mobile = inject('mobile', false)
</script>

<template>
  <div v-if="!mobile" class="tab"></div>
</template>

<style>
.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 100%;
  background-color: var(--tab-bg-color);
}
</style>
