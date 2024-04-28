const {User,validateRegisterUser,validateLoginUser} = require("../models/User")
const asynchandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")
const verificationToken = require("../models/verififcationToken")

/**
 * @desc register user
 * @route /api/auth/register
 * @methode post
 * @access public
 */

module.exports.registerUserController = asynchandler(async(req,res)=>{
    const {error} = validateRegisterUser(req.body)
    if (error){
        return res.status(400).json({message : error.details[0].message })
    }
    let user = await User.findOne({email:req.body.email})
    if (user){
        return res.status(400).json({message:"User already exist"})
    }
    const hashPassword = await bcrypt.hash(req.body.password,10)
    user = await new User({
        username:req.body.username,
        email : req.body.email ,
        password: hashPassword ,
    })

    await user.save()
     // dending email (verefiy account)
        // create a new verification token and save it to Db
        const verificationTokenemail = await new verificationToken ({
            userId :user._id ,
            token :crypto.randomBytes(32).toString("hex")
        })
        await verificationTokenemail.save()
        // making the link 
        const link = `${process.env.CLIENT_DOMAIN }/users/${user._id}/verify/${verificationTokenemail.token}`
       
        // putting the link into an html template
        const httmlTemplate =
        `
        <div>
           <p> click on the link below to verify your email </p>
           <a href=${link}> verify </a>
        </div>
       `
        // sending email to the user
        await sendEmail (user.email , "verify your email",httmlTemplate);



    // response to the client
    res.status(201).json({message:"we sent to you an email , please verify your email address"})

})

/**
 * @desc login user
 * @route /api/auth/login
 * @methode post
 * @access public
 */

module.exports.loginUserController = asynchandler(asynchandler(async(req,res)=>{
    const {error} = validateLoginUser(req.body)
    console.log (req.body)
    if (error){
        return res.status(400).json({message : error.details[0].message })
    }
    const user = await User.findOne({email:req.body.email})
    // console.log("test find user" , user)
    if (!user){
        res.status(400).json({message:"invalide email or password"})
    }
    const isPaswordMatch = await bcrypt.compare(req.body.password,user.password) 
    // console.log("ispassword match",isPaswordMatch)
    if (!isPaswordMatch){
        res.status(400).json({message:"invalide email or password not compare"})
    }
    
    // dending email (verify account)
    if(!user.isAccountVerified){
        let verificationTokenemail = await verificationToken.findOne(
            {
                userId : user._id
            }
        )
        if(!verificationTokenemail){
            verificationTokenemail= new verificationToken({
                userId:user._id ,
                token : crypto.randomBytes(32).toString("hex") 

            })
            await verificationTokenemail.save()
        }
        const link = `${process.env.CLIENT_DOMAIN }/users/${user._id}/verify/${verificationTokenemail.token}`

        const httmlTemplate =
        `
        <div>
           <p> click on the link below to verify your email </p>
           <a href=${link}> verify </a>
        </div>
       `
        await sendEmail (user.email , "verify your email",httmlTemplate);
        return res.status(400).json({message:"we sent to you an email , please verify your email address"})
    }
    const token = user.generateAthToken() ;
    res.status(200).json({message:"login Successfuly",data:{
        _id:user._id ,
        isAdmin:user.isAdmin ,
        profilPhoto:user.profilPhoto,
        token ,
        username:user.username}})

}))
/**
 * @desc verify user Account 
 * @route /api/auth/:userId/verify/:token
 * @methode get
 * @access public
 */
module.exports.verifyUserAccountCtrl = asynchandler( async(req,res)=>{
    const user = await User.findById(req.params.userId)
    if(!user){
        return res.status(400).json({message:"invalid link"})
    }
    const verificationTokenemail = await verificationToken.findOneAndDelete({
        userId:user._id ,
        token:req.params.token})

    if (!verificationTokenemail ){
        return  res.status(400).json({message:"invalid link"})
    }
     user.isAccountVerified = true ;
    await user.save()
    // await verificationToken.remove()

    res.status(200).json({message:"Your account verified"})



})

