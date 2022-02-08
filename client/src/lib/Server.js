import {
  initStore,
  setSelf,
  setChatList,
  getRooms,
  addToMsgList,
  setMsgReceipt,
  setFileChunk,
  setFileReceiptProgress
} from '../store'
import { MESSAGE_TYPE, MESSAGE } from '../../../server/constant'

export class Server {
  socket = null

  constructor() {
    this.connect()
    window.addEventListener('beforeunload', () => this.disconnect())
    // document.addEventListener('visibilitychange', () => this.onVisibilityChange())
  }

  connect() {
    if (
      this.isConnected() ||
      this.isConnecting()
    ) {
      return
    }
    this.socket = new WebSocket(import.meta.env.VITE_WS)
    this.socket.onopen = e => {
      console.log('WS: server connected')
      initStore(this)
    }
    this.socket.onmessage = e => this.onMessage(e.data)
    this.socket.onclose = e => this.disconnect(e)
    this.socket.onerror = e => console.error(e)
  }

  isConnected () {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }

  isConnecting () {
    return this.socket && this.socket.readyState === WebSocket.CONNECTING
  }

  send (message) {
    if (!this.isConnected()) return
    this.socket.send(JSON.stringify(message))
  }

  onMessage (message) {
    try {
      message = JSON.parse(message)
      switch (message.type) {
        case MESSAGE_TYPE.ROOMS:
          setChatList(message.data)
          break
        case MESSAGE_TYPE.SELF:
          setSelf(message.data)
          break
        case MESSAGE_TYPE.SYSTEM:
          getRooms()
          break
        case MESSAGE_TYPE.MSG:
          message.data.type === MESSAGE.FILE_CHUNK
            ? setFileChunk(message.data)
            : addToMsgList(message.data)
          break
        case MESSAGE_TYPE.RECEIPT:
          setMsgReceipt(message.data)
          break
        case MESSAGE_TYPE.PROGRESS:
          setFileReceiptProgress(message.data)
          break
        default:
          console.warn('unknown message type:', message.type)
      }
    } catch (e) {
      console.error(e)
    }
  }

  disconnect () {
    if (this.socket) {
      this.send({ type: 'disconnect' })
      this.socket.onclose = null
      this.socket.close()
      console.log('WS: server disconnected')
    } else {
      console.log('this.socket is null')
    }
  }

  onVisibilityChange () {
    if (document.hidden) {
      this.disconnect()
    } else {
      this.connect()
    }
  }
}
