import {
  initStore,
  setSelf,
  setChatList,
  getRooms,
  addToMsgList,
  setMsgReceipt,
  setFileChunk,
  setFileReceiptProgress,
  noticeSelfDisconnect
} from '../store'
import { MESSAGE_TYPE, MESSAGE } from '../../../server/constant'

const formatTime = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].join('/') + ' ' + [hour, minute, second].join(':')
}

export class Server {
  socket = null
  reconnectTimer = null

  constructor() {
    this.connect()
    window.addEventListener('beforeunload', () => this.disconnect())
    window.addEventListener('pagehide', () => this.disconnect())
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
    this.socket.onclose = e => this.onDisconnect(e)
    this.socket.onerror = e => console.error(e)
  }

  isConnected () {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }

  isConnecting () {
    return this.socket && this.socket.readyState === WebSocket.CONNECTING
  }

  send (message) {
    if (!this.isConnected()) {
      console.warn('WS: server not connected, message dropped', message.type)
      return
    }
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
          console.log(message)
          if (message.timeout) {
            noticeSelfDisconnect(message)
          }
          getRooms()
          break
        case MESSAGE_TYPE.MSG:
          if (message.data.type === MESSAGE.FILE_CHUNK) {
            console.log('???????????? chunk???????????????')
            this.send({ type: MESSAGE_TYPE.PONG })
            setFileChunk(message.data)
          } else {
            addToMsgList(message.data)
          }
          // message.data.type === MESSAGE.FILE_CHUNK
          //   ? setFileChunk(message.data)
          //   // ? new Promise((resolve) => { resolve() }).then(() => { setFileChunk(message.data) })
          //   : addToMsgList(message.data)
          break
        case MESSAGE_TYPE.RECEIPT:
          setMsgReceipt(message.data)
          break
        case MESSAGE_TYPE.PROGRESS:
          setFileReceiptProgress(message.data)
          break
        case MESSAGE_TYPE.PING:
          console.log(`?????? ${formatTime()}`)
          this.send({ type: MESSAGE_TYPE.PONG })
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

  onDisconnect () {
    console.log('WS: server closed, Retry in 3 seconds...')
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectTimer = setTimeout(() => this.connect(), 3000)
  }

  onVisibilityChange () {
    if (document.hidden) {
      this.disconnect()
    } else {
      this.connect()
    }
  }
}
