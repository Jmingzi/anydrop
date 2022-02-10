import uaParser from 'ua-parser-js'
import { parseCookie } from './utils.js'

export class User {
  id = ''
  name = ''
  ip = ''
  socket = null
  timerId = null
  lastBeat = null
  constructor (socket, request) {
    this.socket = socket
    this.setIp(request)
    this.parseUa(request)
    if (request.uid) {
      this.id = request.uid
    } else {
      const cookie = parseCookie(request.headers.cookie)
      this.id = cookie.uid
    }
  }

  setIp (request) {
    this.ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress
    if (this.ip === '::1' || this.ip === '::ffff:127.0.0.1') {
      this.ip = '127.0.0.1'
    }
  }

  parseUa (request) {
    const ua = uaParser(request.headers['user-agent'])
    let deviceName = ''
    if (ua.os && ua.os.name) {
      deviceName = ua.os.name.replace('Mac OS', 'Mac') + ' ' + ua.os.version.split('.').slice(0, 2).join('.') + ' '
    }
    if (ua.device.model) {
      deviceName += ua.device.model ?? ''
    } else {
      deviceName += ua.browser.name ?? ''
    }
    if (!deviceName) {
      deviceName = 'Unknown Device'
    }
    this.name = deviceName
  }

  getInfo () {
    return {
      id: this.id,
      name: this.name,
      ip: this.ip
    }
  }
}
