export const MESSAGE_TYPE = {
  SYSTEM: 'system',
  ROOMS: 'rooms',
  SELF: 'self',
  MSG: 'message',
  RECEIPT: 'receipt',
  PROGRESS: 'progress',
  PING: 'ping',
  PONG: 'pong',
  DISCONNECT: 'disconnect'
}

export const MESSAGE_STATUS = {
  SENDING: 'SENDING',
  SENT: 'SENT',
  // DELIVERED: 'DELIVERED',
  // READ: 'READ',
  ERROR: 'ERROR',
  ERROR_NO_USER: 'ERROR_NO_USER'
}

export const MESSAGE = {
  TEXT: 'text',
  FILE: 'file',
  FILE_CHUNK: 'file-chunk'
}

export const DEFAULT_MESSAGE = {
  id: 0,
  data: null,
  sender: null,
  type: MESSAGE.TEXT,
  status: MESSAGE_STATUS.SENDING,
  progress: 0,
  time: undefined
  // 时间由服务器端计算添加
}
