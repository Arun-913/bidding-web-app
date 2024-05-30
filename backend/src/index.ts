import 'dotenv/config';
import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import userRouter from './routers/Users';
import itemRouter from './routers/Items';
import notificationRouter from './routers/Notifications';
import { Server } from 'socket.io';


const app = express();
export const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    return res.json({ msg: 'healthy' });
});

app.use('/users', userRouter);
app.use('/items', itemRouter);
app.use('/notifications', notificationRouter);

// Socket.IO configuration
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('send-message', (data) => {
        console.log(data);
        socket.emit(`receive-message`, data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


