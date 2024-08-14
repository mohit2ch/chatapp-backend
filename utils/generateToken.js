import jwt from 'jsonwebtoken';

export default function generateToken({id}){
    const token =  jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
    return token;
}