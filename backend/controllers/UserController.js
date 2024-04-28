const asynchandler = require("express-async-handler")
const { User, validateUpdateUser } = require("../models/User")
const {Comment}=require("../models/Comment")
const {Post}=require("../models/Post")
const bcrypt = require("bcryptjs")
const path = require ("path")
const fs = require("fs")
const { cloudinaryUploadImage,cloudinaryRemoveImage, cloudinaryRemoveMultipleImage}=require("../utils/cloudinary")
/**
 * @desc get all users 
 * @route /api/users/profile
 * @methode get 
 * @access private (only admin)
 */

module.exports.getAllUserCtrl = asynchandler(async (req,res)=>{

    const users = await User.find({},{password:false}).populate("Posts")
     res.status(200).json({message:"all users",data:users})
})

/**---------------------------------------------------------------
 * @desc get user profile 
 * @route /api/users/profile/:id
 * @methode get 
 * @access public
 -----------------------------------------------------------------*/

module.exports.getUserCtrl = asynchandler(async (req,res)=>{

    const user = await User.findById(req.params.id).select("-password").populate("Posts")
    if(!user){
        return res.status(404).json({message:"user not found"})
    }
     res.status(200).json({message:"user",data:user})
})

/**--------------------------------------------------------------
 * @desc update user profile 
 * @route /api/users/profile/:id
 * @methode put 
 * @access privat (only user himself)
 -----------------------------------------------------------------*/

module.exports.updateUserProfile = asynchandler(async (req,res)=>{
const{error}=validateUpdateUser(req.body)
if (error){
    return res.status(400).json({message:error.details[0].message})
}
if(req.body.password){
    const salt = await bcrypt.genSalt(10)
    req.body.password= bcrypt.hash(req.body.password,salt)
}
const updateUser = await User.findByIdAndUpdate(req.params.id,{$set:{
    username:req.body.username,
    password:req.body.password,
    bio:req.body.bio
}},{new:true}).select("-password")
.populate("posts")
res.status(200).json({message:"update succesflly" , data:updateUser})
 
})



/**---------------------------------------------------------------
 * @desc get users count 
 * @route /api/users/count
 * @methode get 
 * @access private (only admin)
 -----------------------------------------------------------------*/

 module.exports.getUserscountCtrl = asynchandler(async (req,res)=>{
    const count = await User.countDocuments() ;
    // countDocuments(): to count the number of documents

    res.status(200).json({message:"users count",data:count})
})

/**---------------------------------------------------------------
 * @desc Profil photo Upload
 * @route /api/users/profil/profil-photo-upload
 * @methode post
 * @access private (only logged user)
 -----------------------------------------------------------------*/

 module.exports.profilePhotoUploadCtrl = asynchandler(async (req,res)=>{
    console.log ("image",req.file)
    // 1. validation
    if(! req.file){
       return res.status(400).json( {message:'no file provided'})
    }
    // 2.get the path to the image 
    const imagePath = await path.join(__dirname , `../images/${req.file.filename}`) 
  
    // 3.upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath)
    console.log("result",result)

    // 4. get the user from db 
    const user = await User.findById(req.user.id)
    console.log("user",user)
    // 5. delete the old profile photo if exist
    if (user.profilPhoto.publicid !== null){
        await cloudinaryRemoveImage(user.profilPhoto.public_id)
    }
    // 6. change the field in dhe db 
    user.profilPhoto={
        url : result.secure_url,
        public_id:result.public_id
        
    }
    await user.save()
    // 7. send response to client 
    res.status(200).json({message:"your Profile photo uploaded successfully",
    profilPhoto:{url: result.secure_url, public_id:result.public_id}})
    // 8. remove image from the server
    fs.unlinkSync(imagePath)
 })

 /**---------------------------------------------------------------
 * @desc delete user profile(account)
 * @route /api/users/profile/:id
 * @methode delete
 * @access private (only admin or user himself)
 -----------------------------------------------------------------*/

 module.exports.deleteUserProfileCtrl= asynchandler(async (req,res)=>{
  
    // 1. get the user from db 
    const user = await User.findById(req.params.id)
        if (!user){
            return res.status(404).json({message:'user not foudt'})
        }
   
    // 2. get all posts from user
    const posts = await Post.find({user:user._id})
    // 3. get the public ids from the posts
    // ? lorsque ne pas null ou undifinded
    const publicIds = await posts?.map((post)=>{
       post.image.publicid
    })
   
    // 4. delete all posts image from cloudinary that belong to this user
    if(publicIds?.length > 0 ){
       await cloudinaryRemoveMultipleImage(publicIds)
    }
   
    // 5. delete the profile picture from cloudinary
    if(user.profilPhoto.publicid != null){
         await cloudinaryRemoveImage(user.profilPhoto.publicid)
    }
   
    // 6. delete user posts and comments 
    await Post.deleteMany({user:user._id})
    await Comment.deleteMany({user:user._id})
    // 7. delete the user him self 
    await User.findByIdAndDelete(req.params.id)
    console.log("delete post comment ")
    

    // 8. send a response to the client 
    res.status(200).json({message:"your profile has ben deleted"})


 })