import { WebSocketServer, WebSocket } from 'ws'
import { User } from './User.js'
import { v4 as uuidv4 } from 'uuid'
import { MESSAGE_TYPE } from './constant.js'
import { parseCookie } from './utils.js'

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
  // 房间以 ip 为 key
  // 相同 ip 可以有多个设备同时在线
  // { ip: { id: user } }
  rooms = {}
  wss = null
  timeoutIds = []

  constructor (params) {
    this.wss = new WebSocketServer(params)
    this.wss.on('connection', (socket, request) => {
      const user = new User(socket, request)
      this.onConnection(user)
    })
    // 初始化 uid 到 cookie
    this.wss.on('headers', (headers, response) => {
      const cookie = parseCookie(response.headers.cookie)
      if (cookie.uid) {
        return
      }
      response.uid = uuidv4()
      // Secure 需要 wss:// 支持
      // headers.push('Set-Cookie: uid=' + response.uid + '; SameSite=Strict; Secure')
      headers.push('Set-Cookie: uid=' + response.uid + '; SameSite=Strict;')
    })
  }

  onConnection (user) {
    // console.log('connection', user.getInfo())
    this.joinRoom(user)
    // 用户监听消息
    user.socket.on('message', (message) => {
      this.onMessage(user, message)
    })
    this.keepAlive(user)
    console.log(`有新用户加入：${user.id.split('-').pop()}，当前在线人数：${this.getRooms({}).length}`)
  }

  keepAlive (user) {
    // console.log(`timeoutIds: ${this.timeoutIds.join(',')}`)
    this.cancelKeepAlive(user)
    const timeout = 10000
    if (!user.lastBeat) {
      user.lastBeat = Date.now()
    }
    if (Date.now() - user.lastBeat > timeout * 2) {
      this.leaveRoom(user)
      console.log(`---- 用户 ${user.id.split('-').pop()} 心跳超时，断开连接，当前在线人数：${this.getRooms({}).length} ----`)
      console.log(`剩余 timeoutIds: ${this.timeoutIds.length} 个`)
    } else {
      this.send(user, { type: MESSAGE_TYPE.PING })
      user.timerId = setTimeout(() => {
        this.keepAlive(user)
      }, timeout)
      this.timeoutIds.push(user.timerId)
      console.log(`用户 ${user.id.split('-').pop()} 心跳间隔：${(Date.now() - user.lastBeat) / 1000}s，当前在线人数：${this.getRooms({}).length}`)
    }
  }

  cancelKeepAlive (user) {
    if (user && user.timerId) {
      clearTimeout(user.timerId)
      this.timeoutIds.splice(this.timeoutIds.indexOf(user.timerId), 1)
      user.timerId = null
    }
  }

  joinRoom (user) {
    if (!this.rooms[user.ip]) {
      this.rooms[user.ip] = {}
    }
    this.rooms[user.ip][user.id] = user
    // 通知其它人
    this.broadcast(user, {
      type: MESSAGE_TYPE.SYSTEM,
      data: `${user.name} 加入了房间`
    })
  }

  onMessage (sender, message) {
    try {
      let needBroadcast = false
      message = JSON.parse(message)
      switch (message.type) {
        case MESSAGE_TYPE.DISCONNECT:
          this.leaveRoom(sender)
          break
        case MESSAGE_TYPE.PONG:
          console.log(`收到客户端心跳 ${sender.id.split('-').pop()}`, formatTime())
          sender.lastBeat = Date.now()
          break
        case MESSAGE_TYPE.ROOMS:
          this.send(sender, {
            type: MESSAGE_TYPE.ROOMS,
            data: this.getRooms(sender)
          })
          break
        case MESSAGE_TYPE.SELF:
          this.send(sender, {
            type: MESSAGE_TYPE.SELF,
            data: sender.getInfo()
          })
          break
        case MESSAGE_TYPE.MSG:
          if (message.data.type === 'file-chunk') {
            // todo 客户端 for 循环心跳阻塞处理
            // console.log('客户端 for 循环心跳阻塞处理')
            sender.lastBeat = Date.now()
          }
          needBroadcast = true
          break
        case MESSAGE_TYPE.RECEIPT:
        case MESSAGE_TYPE.PROGRESS:
          message.data.time = Date.now()
          this.send(this.findUserById(message.data.originSender.id), message)
          break
      }
      // 将消息广播给其他人
      if (needBroadcast) {
        this.broadcast(sender, message)
      }
    } catch (e) {
      console.error()
    }
  }

  broadcast (from, message) {
    if (message.data && message.data.id) {
      message.data = {
        ...message.data,
        sender: from.getInfo(),
        time: Date.now()
      }
    }
    for (const sameIpUser of Object.values(this.rooms)) {
      for (const user of Object.values(sameIpUser)) {
        if (user.id === from.id) {
          continue
        }
        if (user.socket.readyState === WebSocket.OPEN) {
          user.socket.send(JSON.stringify(message))
        }
      }
    }
  }

  send (user, message) {
    user.socket.send(JSON.stringify(message))
  }

  leaveRoom (user) {
    if (!this.rooms[user.ip] || !this.rooms[user.ip][user.id]) {
      return
    }
    // 通知其他人
    this.broadcast(user, {
      type: MESSAGE_TYPE.SYSTEM,
      data: `${user.name} 离开了房间`
    })
    delete this.rooms[user.ip][user.id]
    user.socket.terminate()
    // 删除这个 ip
    if (!Object.keys(this.rooms[user.ip]).length) {
      delete this.rooms[user.ip]
    }
  }

  getRooms (from) {
    const result = []
    for (const sameIpUser of Object.values(this.rooms)) {
      for (const user of Object.values(sameIpUser)) {
        if (user.id === from.id) {
          continue
        }
        result.push(user.getInfo())
      }
    }
    return result
  }

  findUserById (id) {
    for (const sameIpUser of Object.values(this.rooms)) {
      for (const user of Object.values(sameIpUser)) {
        if (user.id === id) {
          return user
        }
      }
    }
    return null
  }
}
