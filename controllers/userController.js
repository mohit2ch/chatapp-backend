import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const loginUser = async function(req, res){
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user || !(await user.matchPassword(password))){
            return res.status(400).json({error:'Invalid email or password'});
        }
        const token = generateToken({id: user._id});
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            pic: user.pic,
            token
        }
        );
    } catch(error){
        res.status(500).json({error});
    }
}

const registerUser = async function(req, res){
    try{
        const {username, email, password, gender} = req.body;
        
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({error: 'email already exists'});
        }
        const user = await User.create({
            username,
            email,
            password,
            pic: `https://avatar.iran.liara.run/public/${gender}?username=${username}`
        });
        const token = generateToken({id: user._id});
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            pic: user.pic,
            token
        });
    } catch(error){
        res.status(500).json(error);
    }
}

const allUsers = async function(req, res){
    try{
        const keyword = req.query.search? {
            $or: [
                {name: {$regex: req.query.search, $options: "i"}},
                {email: {$regex: req.query.search, $options: "i"}},
            ]
        }: {};

        const users = await User.find(keyword).find({_id: {$ne: req.user._id}});
        console.log(req.user);
        res.send(users);
    } catch(error){
        res.status(500).json(error);
    }
}


export {
    registerUser,
    loginUser,
    allUsers,
}