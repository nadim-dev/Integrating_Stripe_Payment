import { Schema,model } from "mongoose";


const sessionSchema=new Schema({
    sessionId:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    userMobile:{
         type: String,
        required: true
    },
    paymentStatus:{
        type:String,
        enum: ["unpaid", "paid", "expired"],
        default:"unpaid",
    },
    courseId:{
        type:Schema.Types.ObjectId,
        ref:"courses",
        required: true
    },
    expiresAt:{
       type:Date,
       default:() => Date.now() + 24 * 60 * 60 * 1000,
    },
    client_secret:{
        type:String,
    }
});

export const session=model("session",sessionSchema);