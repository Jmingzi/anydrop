export class FileDigester {
  constructor (meta, callback) {
    this.bufferViews = new DataView(new ArrayBuffer(meta.size))
    this.size = meta.size
    this.type = meta.type
    this.progress = 0
    this.offset = 0
    this.callback = callback
  }

  unchunk (chunkString) {
    const chunk = chunkString.split(',')
    // todo for 循环会阻塞主线程，导致心跳超时
    // 解决办法有 2 个：
    // 1. 将 socket 内容传输改为 buffer 而不是 string
    // 2. 超时判断的地方处理
    for (let i = 0; i < chunk.length; i++) {
      this.bufferViews.setUint8(this.offset + i, Number(chunk[i]))
    }
    this.offset += chunk.length
    this.progress = this.offset / this.size
    if (this.offset >= this.size) {
      const blob = new Blob([this.bufferViews], { type: this.type })
      this.callback(blob)
    }
  }
}
