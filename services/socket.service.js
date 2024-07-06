import { Server } from 'socket.io'
import { logger } from './logger.service.js'

var gIo = null
var mentors = {}

export function setupSocketAPI(http) {
    gIo = new Server(http, { cors: { origin: '*' } })

    gIo.on('connection', socket => {
        logger.info(`New connected socket [id: ${socket.id}]`)

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
            for (const codeblockId in mentors) {
                if (mentors[codeblockId] === socket.id) {
                    delete mentors[codeblockId]
                    broadcast({
                        type: 'mentor-left',
                        data: { message: 'Mentor has left the code block' },
                        room: codeblockId
                    })
                    gIo.to(codeblockId).emit('redirect-to-lobby')
                }
            }
        })

        socket.on('join-codeblock', codeblockId => {
            socket.join(codeblockId)
            if (!mentors[codeblockId]) {
                mentors[codeblockId] = socket.id
                socket.emit('set-role', 'mentor')
                logger.info(`Mentor joined codeblock [id: ${codeblockId}] [socket: ${socket.id}]`)
            } else {
                socket.emit('set-role', 'student')
                logger.info(`Student joined codeblock [id: ${codeblockId}] [socket: ${socket.id}]`)
            }
            updateStudentCount(codeblockId)
        })

        socket.on('leave-codeblock', codeblockId => {
            socket.leave(codeblockId)
            if (mentors[codeblockId] === socket.id) {
                delete mentors[codeblockId]
                broadcast({
                    type: 'mentor-left',
                    data: { message: 'Mentor has left the code block' },
                    room: codeblockId
                })
                gIo.to(codeblockId).emit('redirect-to-lobby')
            }
            updateStudentCount(codeblockId)
        })

        socket.on('code-change', ({ codeblockId, code }) => {
            socket.to(codeblockId).emit('code-update', code)
        })

        // socket.on('set-user-socket', userId => {
        //     logger.info(`SOCKET Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
        //     socket.userId = userId
        // })

        // socket.on('unset-user-socket', () => {
        //     logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
        //     delete socket.userId
        // })
    })
}

function updateStudentCount(codeblockId) {
    const studentCount = gIo.sockets.rooms.get(codeblockId)?.size - 1 || 0;
    gIo.to(codeblockId).emit('update-students-count', studentCount);
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label.toString()).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    userId = userId.toString()
    const socket = await _getUserSocket(userId)

    if (socket) {
        logger.info(`Emitting event: ${type} to user: ${userId} socket [id: ${socket.id}]`)
        socket.emit(type, data)
    } else {
        logger.info(`No active socket for user: ${userId}`)
    }
}

async function broadcast({ type, data, room = null, userId }) {
    logger.info(`Broadcasting event: ${type}`)

    userId = userId.toString()
    const excludedSocket = await _getUserSocket(userId)

    if (room && excludedSocket) {
        logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        logger.info(`Broadcast to all excluding user: ${userId}`)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        logger.info(`Emit to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        logger.info(`Emit to all`)
        gIo.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket
}

async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets()
    return sockets
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}

function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

export const socketService = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // emit to everyone / everyone in a specific room (label)
    emitTo,
    // emit to a specific user (if currently active in system)
    emitToUser,
    // Send to all sockets BUT not the current socket - if found
    // (otherwise broadcast to a room / to all)
    broadcast,
}
