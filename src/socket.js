import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*', // Allow all origins for now, restrict in production
            methods: ['GET', 'POST']
        }
    });
    console.log('Socket.io initialized');

    io.on('connection', (socket) => {
        // console.log('Client connected:', socket.id);

        socket.on('joinRoom', (userId) => {
            if (userId) {
                socket.join(userId);
                // console.log(`Socket ${socket.id} joined room ${userId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
