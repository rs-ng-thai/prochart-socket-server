require('dotenv').config();

const io = require('socket.io')();
const redisAdapter = require('socket.io-redis')({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });

io.adapter(redisAdapter);

io.on('connection', (socket) => {
    socket.on('update_user', (data) => {
        socket.data = data;
        io.to('buddies').emit('buddyLists', [data]);
    });

    socket.on('start_tracking', () => {
        socket.join('buddies');
        const list = [];
        const allSockets = io.adapter.sockets();
        for (const buddy of allSockets) {
            list.push(buddy.data);
        }
        socket.emit('buddyLists', list);
    });

    socket.on('stop_tracking', () => {
        socket.leave('buddies');
    });
});

io.listen(3000);

