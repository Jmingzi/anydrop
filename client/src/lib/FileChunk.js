export class FileChunk {
  file = null
  chunkSize = 64000 // 64kb
  offset = 0
  reader = null
  onChunk = null

  constructor (file, onChunk) {
    this.onChunk = onChunk
    this.file = file
    this.offset = 0
    this.reader = new FileReader()
    this.reader.onload = (e) => {
      this.onChunkRead(e.target.result)
    }
    this.readNextChunk()
  }

  onChunkRead (chunk) {
    this.offset += chunk.byteLength
    this.onChunk(chunk)
    if (!this.isFileEnd()) {
      this.readNextChunk()
    }
  }

  readNextChunk () {
    const chunk = this.file.slice(this.offset, this.offset + this.chunkSize)
    this.reader.readAsArrayBuffer(chunk)
  }

  isFileEnd () {
    return this.offset >= this.file.size
  }
}
