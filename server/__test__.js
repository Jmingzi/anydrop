import { WebSocket } from 'ws'

const client = new WebSocket('ws://localhost:8000')

client.on('message', (data) => {
  console.log(111, data.toString())
})

client.on('open', () => {
  client.send(JSON.stringify({
    type: 'test',
    data: 'Hello World'
  }))
})

