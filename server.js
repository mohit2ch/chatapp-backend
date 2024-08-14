import express, { json } from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import userRouter from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRoute from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import path from 'path';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());


app.use( '/api/users', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/messages', messageRoute);

//

const __dirname = path.resolve();
if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "/frontend/build")));
    app.get('*', function(req, res){
        res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
    })
}

//

app.get('/', function(req, res){
    res.send("Hello World!");
})

const server = app.listen(PORT, function(){
    console.log(`Server started at PORT ${PORT}`);
})

const io = new Server(server, {
    cors: {
        origin: `http://localhost:3000`
    }
});
// console.log(io);
io.on('connection', function(socket){
    console.log("User is connected");
    socket.on('setup', function(userData){
        socket.join(userData.id);
        console.log(userData.id)
        socket.emit("connected");
    });
    socket.on('join room', function(room){
        socket.join(room);
        console.log(room);
    });
    socket.on("send message", function(newMessage){
        // console.log(newMessage);
        let chat = newMessage.chat;
        
        if(!chat.users) return console.log("No users found in this chat");

        chat.users.forEach(function(user, index){
            if(user._id === newMessage.sender) return;
            socket.in(user._id).emit("message received", newMessage);
        })
    })
});