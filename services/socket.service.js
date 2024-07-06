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
            let role = 'Student'
            if (!mentors[codeblockId]) {
                mentors[codeblockId] = socket.id
                role = 'Mentor'
                logger.info(`Mentor joined codeblock [id: ${codeblockId}] [socket: ${socket.id}]`)
            } else {
                logger.info(`Student joined codeblock [id: ${codeblockId}] [socket: ${socket.id}]`)
            }
            socket.emit('set-role', role)
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

        socket.on('get-students-count', codeblockId => {
            const studentCount = gIo.sockets.adapter.rooms.get(codeblockId)?.size - 1 || 0;
            broadcast({
                type: 'students-count',
                data: studentCount,
                room: codeblockId
            })
        })
    })
}

function updateStudentCount(codeblockId) {
    const studentCount = gIo.sockets.adapter.rooms.get(codeblockId)?.size - 1 || 0;
    gIo.to(codeblockId).emit('students-count', studentCount);
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label.toString()).emit(type, data)
    else gIo.emit(type, data)
}

async function broadcast({ type, data, room = null }) {
    logger.info(`Broadcasting event: ${type}`)

    if (room) {
        logger.info(`Emit to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        logger.info(`Emit to all`)
        gIo.emit(type, data)
    }
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
    // Send to all sockets (otherwise broadcast to a room / to all)
    broadcast,
}
