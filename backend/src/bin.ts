import { server } from ".";

const PORT = process.env.PORT || 8000;
const SOCKET_IO_PORT = process.env.SOCKET_IO_PORT ? parseInt(process.env.SOCKET_IO_PORT) : 8001;

server.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
    console.log(`Socket.IO server running at port ${SOCKET_IO_PORT}`);
});