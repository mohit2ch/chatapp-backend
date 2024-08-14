import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

const sendMessage = async function(req, res){
    try{
        const {chatId} = req.params;
        const {content} = req.body;
        const sender = req.user._id;

        if(!content){
            return res.status(400).json({error: "Message content cannot be empty"});
        }

        let message = await Message.create({
            sender,
            content,
            chat: chatId
        });
        // console.log(message);
        message = await message.populate("sender", "username pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message
        });

        res.status(200).json(message);

    } catch(error){
        res.status(500).json({error});
    }
}

const fetchMessages = async function(req, res){
    try{
        const {chatId} = req.params;
        let messages = await Message.find({chat: chatId}).populate("sender","username pic");
        res.status(200).json(messages);

    } catch(error){
        res.status(500).json(error);
    }
}  

export {
    sendMessage,
    fetchMessages
}