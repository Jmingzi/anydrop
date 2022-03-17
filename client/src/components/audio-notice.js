import AudioNotice from './AudioNotice.vue'
import { ref, h } from 'vue'
const sendRef = ref(null)
const receiveRef = ref(null)

export function useAudio(type) {
  return {
    playAudio: () => {
      const handle = type === 'send' ? sendRef.value : receiveRef.value
      handle.play().catch(err => {
        console.log(err.message)
      })
    },
    AudioNotice: {
      render() {
        return h(AudioNotice, {
          setRef: (val, type) => {
            if (type === 'sendRef') {
              sendRef.value = val
            } else {
              receiveRef.value = val
            }
          }
        })
      }
    }
  }
}
