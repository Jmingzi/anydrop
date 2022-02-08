import { reactive, toRefs } from 'vue'

const state = reactive({
  show: false,
  blob: null,
  type: '',
  content: ''
})

export function setState (blob, type) {
  state.show = true
  state.blob = blob
  state.type = type

  const reader = new FileReader()
  if (state.type.indexOf('image') > -1) {
    reader.readAsDataURL(state.blob)
  } else if (
    state.type.indexOf('json') > -1 ||
    state.type.indexOf('text') > -1
  ) {
    reader.readAsText(state.blob, 'utf-8')
  } else {
    state.content = 'Unsupported file type'
  }
  reader.onload = () => {
    state.content = reader.result
  }
  console.log('mime type ', state.type)
}

export function closePreview () {
  state.show = false
}

export function downloadBlob (blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export function useFilePreviewer () {
  return {
    ...toRefs(state)
  }
}
