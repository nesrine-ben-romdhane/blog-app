const mongoose = require("mongoose")
const joi = require ("joi")
const jwt = require("jsonwebtoken")
const joinPasswordComplaxity = require("joi-password-complexity")
const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required : true ,
        trim : true ,
        minLength:2 ,
        maxLength :100
    },
    email:{
        type:String,
        required : true ,
        trim : true ,
        minLength:10 ,
        maxLength :100,
        unique : true
    },
    password:{
        type:String,
        required : true ,
        trim : true ,
        minLength:8 ,
    },
    profilPhoto:{
        type:Object,
        default:{
            url:"https://cdn.pixabay.com/photo/2017/02/25/22/04/user-icon-2098873_1280.png",
            publicid:null
        }
    },
    bio : {
        type:String
    },
    isAdmin :{
        type:Boolean,
        default:false
    },
    isAccountVerified:{
        type:Boolean,
        default:false
    }
    },{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

// Populate posts that belongs to this user when he/she het his/her profile

UserSchema.virtual("Posts",{
    ref:"Post",
    foreignField:"user",
    localField:"_id"
})

// generate web token 
UserSchema.methods.generateAthToken= function(){
    return jwt.sign({id:this._id , isAdmin:this.isAdmin},process.env.JWT_SECRET_KEY)
}





const User = mongoose.model("User",UserSchema)



// validate register User
function validateRegisterUser(obj){
    const schema = joi.object({
        username: joi.string().trim().min(2).max(100).required(),
        email: joi.string().trim().min(5).max(100).required().email(),
        password: joinPasswordComplaxity().required(),
    })
    return schema.validate(obj)
}

// validate login User
function validateLoginUser(obj){
    const schema = joi.object({
        email: joi.string().trim().min(5).max(100).required().email(),
        password: joi.string().trim().min(8).required(),
    })
    return schema.validate(obj)
}
function validateUpdateUser(obj){
    const schema = joi.object({
        username: joi.string().trim().min(2).max(100),
        password: joinPasswordComplaxity(),
        bio : joi.string()
    })
    return schema.validate(obj)
}

// validate email
function validateEmail(obj){
    const schema = joi.object({
        email: joi.string().trim().min(5).max(100).required().email(),
        
    })
    return schema.validate(obj)
}

// validate new password
function validateNewPassword(obj){
    const schema = joi.object({

        password: joinPasswordComplaxity().required(),
    })
    return schema.validate(obj)
}




module.exports= {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser ,
    validateEmail,
    validateNewPassword

}