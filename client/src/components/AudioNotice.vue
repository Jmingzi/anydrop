<script setup>
import mp3Send from '../assets/mp3/send.mp3'
import mp3Receive from '../assets/mp3/receive.mp3'

defineProps({
  setRef: Function
})
</script>

<template>
  <div v-show="false" class="audio-notice">
    <audio
      controls
      preload
      :ref="v => setRef(v, 'sendRef')"
      :src="mp3Send"
    />
    <audio
      controls
      preload
      :ref="v => setRef(v, 'receiveRef')"
      :src="mp3Receive"
    />
  </div>
</template>

<style>
.audio-notice {
  position: relative;
  z-index: 10;
}
</style>
