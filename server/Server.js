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
    this.cancelKeepAlive(user)
    const timeout = 30000
    if (!user.lastBeat) {
      user.lastBeat = Date.now()
    }
    if (Date.now() - user.lastBeat > timeout * 2) {
      this.leaveRoom(user)
      console.log(`---- 用户 ${user.id.split('-').pop()} 超时断开，当前在线人数：${this.getRooms({}).length} lastBeat ${(Date.now() - user.lastBeat) / 1000}s ----`)
    } else {
      this.send(user, { type: MESSAGE_TYPE.PING })
      if (!user.timerId) {
        user.timerId = []
      }
      user.timerId.push(setTimeout(() => {
        this.keepAlive(user)
      }, timeout))
    }
  }

  cancelKeepAlive (user) {
    if (user && user.timerId) {
      if (user.timerId.length > 1) {
        console.log(`用户 ${user.id.split('-').pop()} 心跳 timer 异常，取消`)
      }
      user.timerId.forEach((timerId, i) => {
        clearTimeout(timerId)
        user.timerId.splice(i, 1)
      })
      // user.timerId = null
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
          console.log(`${sender.id.split('-').pop()} 收到客户端心跳`, formatTime())
          if (this.findUserById(sender.id)) {
            sender.lastBeat = Date.now()
          } else {
            console.log('用户已离开，不响应客户端心跳')
            this.cancelKeepAlive(sender)
          }
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
          // if (message.data.type === 'file-chunk') {
          //   // todo 客户端 for 循环心跳阻塞处理
          //   // console.log('客户端 for 循环心跳阻塞处理')
          //   sender.lastBeat = Date.now()
          // }
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
      console.error(e)
    }
  }

  broadcast (from, message) {
    const others = !message.timeout
    if (message.data && message.data.id) {
      message.data = {
        ...message.data,
        sender: from.getInfo(),
        time: Date.now()
      }
    }
    for (const sameIpUser of Object.values(this.rooms)) {
      for (const user of Object.values(sameIpUser)) {
        if (others && user.id === from.id) {
          continue
        }
        if (user.socket.readyState === WebSocket.OPEN) {
          user.socket.send(JSON.stringify(message))
        }
      }
    }
  }

  send (user, message) {
    if (user) {
      user.socket.send(JSON.stringify(message))
    }
  }

  leaveRoom (user) {
    if (!this.rooms[user.ip] || !this.rooms[user.ip][user.id]) {
      return
    }
    // 通知其他人
    this.broadcast(user, {
      type: MESSAGE_TYPE.SYSTEM,
      data: `${user.name} 离开了房间`,
      timeout: true
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
