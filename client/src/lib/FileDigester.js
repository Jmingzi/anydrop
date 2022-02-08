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
    for (let i = 0; i < chunk.length; i++) {
      this.bufferViews.setUint8(this.offset + i, Number(chunk[i]))
    }
    this.offset += chunk.length
    this.progress = this.bufferViews.byteLength / this.size
    if (this.bufferViews.byteLength >= this.size) {
      const blob = new Blob([this.bufferViews], { type: this.type })
      this.callback(blob)
    }
  }
}
