require('dotenv').config();

const mongoose = require('mongoose');

const Users = require('./UserModel');

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });
        return console.log('mongodb successfully connected');
      } catch (err) {
        console.log(`Error connecting to database: ${err}`);
        return process.exit(1);
      }
};
mongoose.connection.on('disconnected', connectMongo);
connectMongo();

const io = require('socket.io')();
// const redisAdapter = require('socket.io-redis')({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });
// io.adapter(redisAdapter);

io.on('connection', (socket) => {
    socket.on('update_user', async (user_id, latitude, longitude, speed, course) => {
        let user = Users.find({ user_id }).exec();

        if (user == null) {
            user = await Users.create({
                user_id,
                latitude,
                longitude,
                speed,
                course
            });
            io.to(user_id).emit('user_updated', user.user_id, user.latitude, user.longitude, user.speed, user.course);
        } else {
            user.user_id = user_id;
            if (user.latitude != latitude || user.longitude != longitude || user.speed != speed || user.course != course) {
                await user.save();
                io.to(user_id).emit('user_updated', user.user_id, user.latitude, user.longitude, user.speed, user.course);
            }
        }
    });

    socket.on('start_tracking', (user_id) => {
        socket.join(user_id);
    });

    socket.on('stop_tracking', (user_id) => {
        socket.leave(user_id);
    });
});

io.listen(3000);

