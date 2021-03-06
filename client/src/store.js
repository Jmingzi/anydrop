import { ref } from 'vue'
import { MESSAGE, MESSAGE_TYPE, MESSAGE_STATUS, DEFAULT_MESSAGE } from '../../server/constant'
import { FileChunk } from './lib/FileChunk'
import { FileDigester } from './lib/FileDigester'
import { useAudio } from './components/audio-notice'

export const chatList = ref([])
export const msgList = ref([])
export const self = ref({})

let server = null
const digesterMap = {}
const { playAudio } = useAudio('receive')

export function initStore (serverConnection) {
  server = serverConnection
  // 获取自己
  send(MESSAGE_TYPE.SELF)
  getRooms()
}

function getMessageData (data) {
  const time = Date.now()
  const id = `${self.value.id}_${time}`
  const message = {
    ...DEFAULT_MESSAGE,
    sender: self.value,
    id,
    data,
    time
  }
  if (data instanceof File) {
    message.type = MESSAGE.FILE
    message.data = {
      name: data.name,
      size: data.size,
      type: data.type
    }
  }
  return message
}

export function sendMessage (data) {
  const message = getMessageData(data)
  addToMsgList(message, false)
  send(MESSAGE_TYPE.MSG, message)
  if (chatList.value.length === 1) {
    setMsgReceipt({ id: message.id, status: MESSAGE_STATUS.ERROR_NO_USER })
  }
  return message
}

function send (type, data) {
  server.send({ type, data })
}

export function getRooms () {
  // 获取用户列表
  send(MESSAGE_TYPE.ROOMS)
}

function isChatListExist (id) {
  return chatList.value.some(item => item.id === id)
}

function updateMsgById (id, data) {
  const index = msgList.value.findIndex(item => item.id === id)
  if (index !== -1) {
    msgList.value[index] = {
      ...msgList.value[index],
      ...data
    }
  }
}

// 接收消息方都需要回执收到的消息
// 消息发送方不需要
export function addToMsgList (data, receipt = true) {
  msgList.value.push(data)
  // 消息收到回执
  if (receipt) {
    send(MESSAGE_TYPE.RECEIPT, {
      id: data.id,
      originSender: data.sender,
      status: MESSAGE_STATUS.SENT
    })
    if (data.type === MESSAGE.FILE || data.type === MESSAGE.TEXT) {
      playAudio()
    }
  }
  // 文件回执处理
  if (data.type === MESSAGE.FILE) {
    const digester = new FileDigester(data.data, blob => {
      console.log('文件接收完成', data)
      updateMsgById(data.id, { blob })
      // todo delete digesterMap[data.id]
    })
    digesterMap[data.id] = digester
  }
}

export function setMsgReceipt (data) {
  updateMsgById(data.id, { status: data.status })
}

export function setFileReceiptProgress (data) {
  updateMsgById(data.originMsgId, { progress: data.progress })
}

export function setSelf (data) {
  self.value = data
  if (!isChatListExist(data.id)) {
    chatList.value.unshift(data)
  }
}

export function setChatList (data) {
  // console.log(`设置聊天人数 ${data.length}`)
  chatList.value = data
  if (self.value) {
    setSelf(self.value)
  }
}

export function noticeSelfDisconnect (message) {
  if (message.sender?.id === self.value?.id) {
    confirm('你已经下线，是否重新登录？')
    server.onDisconnect()
  }
}

export function sendFile (file) {
  const { id: originMsgId, sender: originSender } = sendMessage(file)
  // chunk 分片发送
  const fileChunk = new FileChunk(file, chunk => {
    setTimeout(() => {
      console.log('发送文件分片', chunk.byteLength)
      send(MESSAGE_TYPE.MSG, {
        // 将 ArrayBuffer 转换为 数组
        ...getMessageData(new Uint8Array(chunk).toString()),
        type: MESSAGE.FILE_CHUNK,
        progress: chunk.byteLength / file.size,
        originMsgId,
        originSender
      })
      if (fileChunk.isFileEnd()) {
        console.log('文件发送完成')
        const data = {
          status: MESSAGE_STATUS.SENT,
          blob: new Blob([file.slice()], { type: file.type })
        }
        if (chatList.value.length === 1) {
          // 只有自己
          data.status = MESSAGE_STATUS.ERROR_NO_USER
          data.progress = 1
        }
        updateMsgById(originMsgId, data)
      }
    })
  })
}

export function setFileChunk ({ originMsgId, originSender, data }) {
  const digester = digesterMap[originMsgId]
  digester.unchunk(data)
  console.log(`接收到文件分片 ${digester.progress}`)
  // 更新文件进度
  updateMsgById(originMsgId, {
    progress: digester.progress
  })
  // 通知原发送人进度
  send(MESSAGE_TYPE.PROGRESS, {
    originSender,
    originMsgId: originMsgId,
    progress: digester.progress
  })
}

export function useStore () {
  return {
    self,
    chatList,
    msgList
  }
}
