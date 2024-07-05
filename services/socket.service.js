import { Server } from 'socket.io';

var io = null;
var mentorId = null;

export function setupSocketAPI(http) {
    io = new Server(http, { cors: { origin: '*' } });

    io.on('connection', socket => {
        console.log(`New connected socket [id: ${socket.id}]`);

        socket.on('disconnect', () => {
            console.log(`Socket disconnected [id: ${socket.id}]`);
            if (socket.id === mentorId) {
                mentorId = null;
                // Notify all students to return to the lobby
                io.to('codeblock').emit('mentor-left');
            }
        });

        socket.on('join-codeblock', () => {
            if (!mentorId) {
                mentorId = socket.id;
                socket.emit('role-assigned', 'mentor');
                console.log(`Mentor assigned [id: ${socket.id}]`);
            } else {
                socket.emit('role-assigned', 'student');
                socket.join('codeblock');
                console.log(`Student joined [id: ${socket.id}]`);
                // Broadcast the number of students
                broadcastStudentCount();
            }
        });

        socket.on('leave-codeblock', () => {
            socket.leave('codeblock');
            if (socket.id === mentorId) {
                mentorId = null;
                io.to('codeblock').emit('mentor-left');
            } else {
                broadcastStudentCount();
            }
            console.log(`Socket left codeblock [id: ${socket.id}]`);
        });

        socket.on('code-changed', code => {
            if (socket.id !== mentorId) {
                io.to('codeblock').emit('code-update', code);
                checkSolution(code);
            }
        });
    });
}

function broadcastStudentCount() {
    const room = io.sockets.adapter.rooms.get('codeblock');
    const studentCount = room ? room.size : 0;
    io.to('codeblock').emit('student-count', studentCount);
}

function checkSolution(code) {
    const solution = ''; // TODO: Replace with actual solution
    if (code === solution) {
        io.to('codeblock').emit('show-smiley');
    }
}

export const socketService = {
    setupSocketAPI,
};
