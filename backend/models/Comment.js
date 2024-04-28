const mongoose = require("mongoose")
const joi = require("joi")
const CommentSchema = new mongoose.Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId ,
        ref : "Post" ,
        reqired : true  
    },
    user :{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User",
        required : true
    },
    text :{
        type : String ,
        trim : true ,
        required : true 
    },
    username :{
        type : String ,
        require:true,
        trim : true
    }

},
{
    timestamps:true
}
)

const Comment = mongoose.model("Comment",CommentSchema)

function validateCreateComment(obj){
    const schema = joi.object({
        text:joi.string().required().trim(),
        postId:joi.string().required().label("post Id")
    })
   return schema.validate(obj);
}

function validateUpdateComment(obj){
    const schema = joi.object({
        text:joi.string().required().trim(),
    })
    return schema.validate(obj)
}

module.exports={
    Comment ,
    validateCreateComment,
    validateUpdateComment
}