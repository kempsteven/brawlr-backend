import app from './app'
import socketIo from 'socket.io'

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`App is Running in localhost:${port}`)
})

/* Socket IO Set Up */
export const io = socketIo(server)

io.on('connection', (socket) => {
    console.log(`User Connected - ${socket.id}`)

    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', { data })
    })
})