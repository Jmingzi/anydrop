## AnyDrop

仿微信界面的 AirDrop

![](./screenshot.png)

## 特性

- [x] 预览图片、txt、json 文件
- [x] 心跳、超时断连
- [x] bug: 下载会触发预览
- [x] 交互适配移动端
- [x] 服务断开时自动重连
- [x] ws 服务 nginx 代理，解决不同域下 cookie 无法设置
- [x] 房间没人时，消息发送时的提醒
- [ ] 在传送较大文件时，文件接收方的心跳会被阻塞，因为文件 blob chunk 的 for 循环是阻塞性操作，造成这个问题的原因：socket 通信时的格式是 utf8 string，在传输 blob chunk 时经过了序列化处理。 解决办法：
    - 将传输格式改为 binary string
    - 修改心跳超时机制，在传输 blob chunk 时也认为是在心跳

## 参考

- [RobinLinus/snapdrop](https://github.com/RobinLinus/snapdrop)
