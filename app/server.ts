import app from './app'
import socketIo from 'socket.io'
import jwt, { Secret } from 'jsonwebtoken'

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`App is Running in localhost:${port}`)
})

/* Socket IO Set Up */
export const io = socketIo(server, { origins: 'https://brawlr.netlify.com:*' })
// export const io = socketIo(server, { origins: ['https://brawlr.netlify.com:*', 'localhost:8080'] })

io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        try {
            const token = socket.handshake.query.token
            jwt.verify(token, process.env.JWT_SECRET as Secret)

            next()
        } catch (error) {
            return next(new Error('Authentication failed.'));
        }
    } else {
        next(new Error('Authentication failed.'));
    }
}).on('connection', (socket) => {
    console.log(`User Connected - ${socket.id}`)

    socket.on('new_message', (data) => {
        io.sockets.emit(`${data.conversationId}_new_message`, { data })
    })
})