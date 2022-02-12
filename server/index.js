import { Server as WebSocketServer } from './Server.js'
// import { createServer } from 'http'

const { wss } = new WebSocketServer({ port: 8000 })
// const { wss } = new WebSocketServer({ noServer: true })
// const server = createServer()
//
// server.on('upgrade', (request, socket, head) => {
//   console.log('Parsing session from request...')
//   wss.handleUpgrade(request, socket, head, (ws) => {
//     wss.emit('connection', ws, request)
//   })
// })
//
// server.listen(8000)
