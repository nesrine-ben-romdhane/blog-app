const asynchandller = require("express-async-handler")
const {Comment,validateCreateComment,validateUpdateComment}=require("../models/Comment")
const {User}=require("../models/User")



/**---------------------------------------------------------------
 * @desc create new comment
 * @route /api/comments/
 * @methode post 
 * @access private (only logged user)
 -----------------------------------------------------------------*/

 module.exports.CreateCommentCtrl= asynchandller(async(req,res)=>{
    const {error}=validateCreateComment(req.body)
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    const profil = await User.findById(req.user.id)
    const comment = await Comment.create ({
        postId : req.body.postId ,
        user:req.user.id ,
        text:req.body.text ,
        username:profil.username
    })
    res.status(201).json({message:"comment created",data:comment})

 })


 /**---------------------------------------------------------------
 * @desc get all comments
 * @route /api/comments/
 * @methode get
 * @access private (only admin)
 -----------------------------------------------------------------*/

 module.exports.getAllCommentsCtrl = asynchandller(async(req,res)=>{
    const comments = await Comment.find().populate("user")
    res.status(200).json({message:"all comments",data:comments})
 })

  /**---------------------------------------------------------------
 * @desc delete comment
 * @route /api/comments/:id
 * @methode delete
 * @access private (only admin or owner of the comment)
 -----------------------------------------------------------------*/

 module.exports.deleteCommentCtrl = asynchandller(async(req,res)=>{

    const comment = await Comment.findById(req.params.id)
    if ( !comment){
        return res.status(404).json({message:"comment not found"})
    }
    if (req.user.id === comment.user.toString()|| req.isAdmin){
        const deleteComment = await Comment.findByIdAndDelete(req.params.id)
        res.status(200).json({message:"deleted comment ", data:deleteComment })
    }else{
        res.status(403).json({message:"not allowed , only user himself or admin !"})
    }
 })



   /**---------------------------------------------------------------
 * @desc update comment
 * @route /api/comments/:id
 * @methode put
 * @access private (only owner of the comment)
 -----------------------------------------------------------------*/

 module.exports.updateCommentCtrl = asynchandller(async(req,res)=>{
    console.log("req.body",req.body ,req.params)

    const {err} = validateUpdateComment(req.body)
    if (err){
        return res.status(400).json({message:err.details[0].message})
    }

    const comment = await Comment.findById(req.params.id)
    if ( !comment){
        return res.status(404).json({message:"comment not found"})
    }
    if (req.user.id === comment.user.toString()){
        const updateComment = await Comment.findByIdAndUpdate(req.params.id,{$set:{
            text:req.body.text
        }},{new:true})
        res.status(200).json({message:" comment updated ", data:updateComment })
    }else{
        res.status(403).json({message:"not allowed , only user himself !"})
    }
 })


