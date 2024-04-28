const {User,validateEmail,validateNewPassword} = require("../models/User")
const asynchandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")
const verificationToken = require("../models/verififcationToken")

/**
 * @desc send reset password link
 * @route /api/password/reset-password-link
 * @methode post
 * @access public
 */


module.exports.sendResetPasswordLink=asynchandler(async(req,res)=>{
    console.log("send reset password",req.body)
    const {error}=validateEmail(req.body)
    if (error){
        return res.status(400).json({message:error.details[0].message})
    }
    const user = await User.findOne({email:req.body.email})
 
    if (!user){
        return res.status(404).json({message:"user with given email does not exist "})
    }
   let verificationTokenemail= await verificationToken.findById(user._id)
  
   if (!verificationTokenemail){
    verificationTokenemail = new verificationToken({
        userId:user._id ,
        token : crypto.randomBytes(32).toString("hex")
    })
    await verificationTokenemail.save()
   }
   console.log("verificationToken", verificationTokenemail)
   const link = `${process.env.CLIENT_DOMAIN }/reset-password/${user._id}/${verificationTokenemail.token}`
   const httpTemplate = `<a href= ${link}>click here to reset your password<a/>`
   await sendEmail(user.email,"reset password" , httpTemplate)
//    console.log("send email",sendEmail(user.email,"reset password" , httpTemplate))
   res.status(200).json({message:"Password reset link sent to your email , please check your inbox "})




})

/**
 * @desc get reset password link
 * @route /api/password/reset-password/:userId/:token
 * @methode get
 * @access public
 */
module.exports.getResetPasswordLink=asynchandler(async(req,res)=>{
   
    const user = await User.findOne({_id:req.params.userId})
   
    if (!user){
        return res.status(400).json({message:"invalid link"})
    }
    const verificationTokenemail = await verificationToken.findOne({
        userId:user._id ,
        token:req.params.token
    })

    if (!verificationTokenemail){
        return res.status(400).json({message:"invalid link"})
    }
    res.status(200).json({message:"valide url"})
})


/**
 * @desc reset password 
 * @route /api/password/reset-password/:userId/:token
 * @methode post
 * @access public
 */
module.exports.ResetPassword=asynchandler(async(req,res)=>{
    
    const {error}=validateNewPassword(req.body)
    if (error){
        return res.status(400).json({message:error.details[0].message})
    }
    const user = await User.findById(req.params.userId)
    if (!user){
        return res.status(400).json({message:"invalid link "})
    }
   
    const verificationTokenemail = await verificationToken.findOneAndDelete({
        userId:user._id ,
        token : req.params.token
    })
    if (!verificationTokenemail){
        return res.status(400).json({message:"invalid link"})
    }
    if(!user.isAccountVerified){
        user.isAccountVerified = true
    }
    const salt = await bcrypt.genSalt(10)
    const hashPassword= await bcrypt.hash(req.body.password,salt)
    user.password = hashPassword ;
    await user.save()


    res.status(200).json({message:"password reset successfully , please log in"})

   
})
