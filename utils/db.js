import mongoose from "mongoose";

export default function connectDB(){
    try{
        mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to mongodb");
    }
    catch(error){
        console.error(error);
    }
    
}