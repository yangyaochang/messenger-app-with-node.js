const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const records = require('./records')
const port = process.env.PORT || 3000

let onlineCount = 0

// Serve CSS as static
app.use(express.static(__dirname + '/views/'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

// 當發生連線 (connection) 事件
io.on('connection', socket => {
    onlineCount++
    io.emit('online', onlineCount)
    socket.emit("maxRecord", records.getMax())  // 新增記錄最大值，用來讓前端網頁知道要放多少筆
    socket.emit("chatRecord", records.get())    // 新增發送紀錄

    // 接收來自前端的 greet 事件
    // 然後回送 greet 事件，並附帶內容
    socket.on('greet', () => {
        socket.emit('greet', onlineCount)
    })

    socket.on('send', msg => {
        // 如果 msg 內容鍵值小於 2 等於是訊息傳送不完全
        // 因此我們直接 return ，終止函式執行。
        if (Object.keys(msg).length < 2) return;
        records.push(msg)
    })

    // 當發生離線 (disconnect) 事件
    socket.on('disconnect', () => {
        onlineCount = (onlineCount < 0) ? 0 : onlineCount - 1
        io.emit('online', onlineCount)
    })
})

// 新增 Records 的事件監聽器
records.on("new_message", (msg) => {
    // 廣播訊息到聊天室
    io.emit("msg", msg)
});

server.listen(3000, () => {
    console.log(`Server started. http://locolhost:${port}`)
})