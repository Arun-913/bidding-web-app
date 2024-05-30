"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const Users_1 = __importDefault(require("./routers/Users"));
const Items_1 = __importDefault(require("./routers/Items"));
const Notifications_1 = __importDefault(require("./routers/Notifications"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
exports.server = http_1.default.createServer(app);
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Routes
app.get('/', (req, res) => {
    return res.json({ msg: 'healthy' });
});
app.use('/users', Users_1.default);
app.use('/items', Items_1.default);
app.use('/notifications', Notifications_1.default);
// Socket.IO configuration
const io = new socket_io_1.Server(exports.server, {
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
