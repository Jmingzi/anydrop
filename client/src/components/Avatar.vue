<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'normal'
  },
  id: {
    type: String,
    default: 'a'
  },
  name: {
    type: String,
    default: ''
  }
})

const colors = [
  '#008B8B',
  '#FF6347',
  '#EE82EE',
  '#87CEFA',
  'cadetblue',
  '#FFC0CB'
]
const words = ['虎', '年', '大', '吉', '生', '威']
const index = props.id[props.id.length - 1].codePointAt() % 10 % 5
</script>

<template>
  <div class="avatar" :class="[props.size]" :style="{ backgroundColor: colors[index] }">
    {{ words[index] }}
  </div>
</template>

<style>
.avatar {
  background-color: cadetblue;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  flex-shrink: 0;
}
.avatar.normal {
  width: 32px;
  height: 32px;
}
.avatar.medium {
  width: 36px;
  height: 36px;
}
</style>
