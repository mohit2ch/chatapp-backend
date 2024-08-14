import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export default async function protect(req, res, next){
    let token;
    // console.log(req.headers.authorization);
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try{
            
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch(error){
            res.status(401).json({error: "Not authorized, token failed"});
        }
    } else {

    }
}