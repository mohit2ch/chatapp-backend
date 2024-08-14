import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

const accessChat = async function(req ,res){
    try{
        const {userId} = req.body;
        if(userId === undefined){
            return res.status(400).json({error: 'recipient userid required'});
        }
        let isChat = await Chat.find({
            $and: [
                {users: {$elemMatch: { $eq: req.user._id }}},
                {users: {$elemMatch: { $eq: userId }}},
                {users: {$size: 2}}
            ]
        }).populate("users", "-password")
        .populate("latestMessage");

        

        if(isChat.length>0){
            isChat = await User.populate(isChat, {
                path: 'latestMessage.sender',
                select: 'name pic email',
            });

            return res.status(200).json({chat: isChat[0]});
        }
        const newChat = await Chat.create({
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        });
        const chat = await Chat.findOne({_id: newChat._id}).populate("users", "-password");
        res.status(200).json({chat});
    } catch(error){
        res.status(500).json({error});
    }
}

const fetchChats = async function(req, res) {
    try{
        
        const chats = await Chat.find({
            users: { $eq: req.user._id }
        }).populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage");
        res.status(200).json(chats);

    } catch(error) {
        res.status(500).json({error});
    }
}

const createGroupChat = async function(req, res) {
    try{
        const {users, name} = req.body;
        if(!users || !name){
            return res.status(400).json({error: 'recipient userids and group name required'});
        }
        
        const newChat = await Chat.create({
            chatName: name,
            isGroupChat: true,
            users: [...users, req.user._id],
            groupAdmin: req.user._id,
        });
        const chat = await Chat.findOne({_id: newChat._id}).populate("users", "-password")
        .populate("groupAdmin", "-password");
        res.status(200).json(chat);
    } catch(error){
        res.status(500).json({error});
    }
}

const renameGroup = async function(req, res) {
    try{
        const {chatId, chatName} = req.body;
        if(!chatId || !chatName){
            return res.status(400).json({error: 'Chat Id and new Chat Name required'});
        }
        const updatedGroupChat = await Chat.findByIdAndUpdate(chatId, 
            {chatName},
            {new: true}
        ).populate("users", "-password")
        .populate("groupAdmin", "-password");
        if(!updatedGroupChat) return res.status(404).json({error: 'Group Chat not found'});
        res.status(200).json(updatedGroupChat);
    } catch(error){
        res.status(500).json({error});
    }
}

const removeFromGroup = async function(req, res) {
    try{
        const {chatId, userId} = req.body;
        if(!chatId || !userId){
            return res.status(400).json({error: 'Chat Id and User Id required'});
        }
        const updatedGroupChat = await Chat.findByIdAndUpdate(chatId,
            {
                $pull: {users: {$in: [userId]}}
            },
            { new: true }
        ).populate("users", "-password")
        .populate("groupAdmin", "-password");

        if(!updatedGroupChat) return res.status(404).json({error: 'Group Chat not found'});
        res.status(200).json(updatedGroupChat);
    } catch(error){
        res.status(500).json({error});
    }
}

const addToGroup = async function(req, res) {
    try{
        const {chatId, newUsers} = req.body;
        if(!chatId || !newUsers){
            return res.status(400).json({error: 'Chat Id and new User Ids required'});
        }
        const updatedGroupChat = await Chat.findByIdAndUpdate(chatId,
            {
                $push: {users: {$each: newUsers}}
            },
            {new: true}
        ).populate("users", "-password")
        .populate("groupAdmin", "-password");
        if(!updatedGroupChat) return res.status(404).json({error: 'Group Chat not found'});
        res.status(200).json(updatedGroupChat);
    } catch(error){
        res.status(500).json({error});
    }
}

export {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup
};