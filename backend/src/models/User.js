import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   name:{
    type:String,
    required:[true,"Please add a name"],
   },
    email:{
        type:String,
        required:[true,"Please add an email"],
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,"Please add a password"],
    },
    dailyStudyHOurs:{
        type:Number,
        default:4,
    }

},{timestamps:true});

export default mongoose.model("User",userSchema);