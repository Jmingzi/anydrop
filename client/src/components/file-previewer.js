import { reactive, toRefs } from 'vue'

const state = reactive({
  show: false,
  blob: null,
  type: '',
  content: ''
})

export function setState (blob, type, name) {
  state.show = true
  state.blob = blob
  state.type = type
  state.name = name

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
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  })
}

export function downloadPreview () {
  if (state.blob) {
    downloadBlob(state.blob, state.name)
  } else {
    console.log('文件接收中，请稍后')
  }
}

export function useFilePreviewer () {
  return {
    ...toRefs(state)
  }
}
