<script setup>
import { sendFile } from '../store'

const tools = [
  {
    icon: '<svg t="1644226434229" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2341" width="64" height="64"><path d="M912 208H427.872l-50.368-94.176A63.936 63.936 0 0 0 321.056 80H112c-35.296 0-64 28.704-64 64v736c0 35.296 28.704 64 64 64h800c35.296 0 64-28.704 64-64v-608c0-35.296-28.704-64-64-64z m-800-64h209.056l68.448 128H912v97.984c-0.416 0-0.8-0.128-1.216-0.128H113.248c-0.416 0-0.8 0.128-1.248 0.128V144z m0 736v-96l1.248-350.144 798.752 1.216V784h0.064v96H112z" p-id="2342" fill="#E7E7E7"></path></svg>',
    action: () => {
      // 动态创建 input 选择文件
      const input = document.createElement('input')
      input.type = 'file'
      input.style.display = 'none'
      document.body.appendChild(input)
      input.click()
      input.onchange = e => {
        sendFile(e.target.files.item(0))
        // const r = new FileReader()
        // r.readAsDataURL(e.target.files.item(0))
        // r.onload = () => {
        //   const img = document.createElement('img')
        //   img.src = r.result
        //   document.body.appendChild(img)
        // }
      }
      setTimeout(() => {
        document.body.removeChild(input)
      }, 0)
    }
  }
]
</script>

<template>
  <div class="input-tool">
    <div
      v-for="(tool, index) in tools"
      :key="index"
      v-html="tool.icon"
      @click="tool.action()"
    />
  </div>
</template>

<style>
.input-tool {
  display: flex;
  width: 100%;
  height: 50px;
  align-items: center;
  /*border-bottom: 1px solid var(--border-color);*/
  padding: 0 15px;
}
.input-tool .icon {
  width: 20px;
}
</style>
