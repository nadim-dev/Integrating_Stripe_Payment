import mongoose, { Schema,model } from "mongoose";


const coursesSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    image:{
        type:String
    }

})

const courses=model("courses",coursesSchema);

export default courses;