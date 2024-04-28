const{ Post,validateCreatePost,validateUpdatePost }= require("../models/Post")
const {Comment}=require("../models/Comment")
const path = require("path")
const fs = require("fs")
const asynchandler = require("express-async-handler")
const {cloudinaryUploadImage, cloudinaryRemoveImage}=require("../utils/cloudinary")



/**---------------------------------------------------------------
 * @desc create new poste
 * @route /api/posts/
 * @methode post 
 * @access private (only logged user)
 -----------------------------------------------------------------*/

 module.exports.createPostCtrl=asynchandler(async(req,res)=>{
    //1. validation for image 
    if (!req.file){
       return res.status(400).json({message:"no image provided"})
    }
    //2. validation data
    const {err}= validateCreatePost(req.body)
    if (err){
        return res.status(400).json({message:err.details[0].message})
    }
    //3. upload image
    const imagePath = await path.join(__dirname , `../images/${req.file.filename}`)
    console.log("image path",imagePath)
    const result = await cloudinaryUploadImage(imagePath)
    console.log("result",result)



   
    //4. create new post and save it to db 
    // lorsque on fait la creation avec create mongoose faire save automatiquement et lorsque on utilise new il faut utiliser .save
    const post = await Post.create({
        title:req.body.title ,
        description : req.body.description ,
        category : req.body.category,
        user:req.user.id,
        image : {
            url : result.secure_url,
            publicid : result.public_id
        }
    })
    console.log("image test",post.image)
    //5. send response to the client 
    res.status(201).json({message:"post create succeffuly", data:post})
    //6. remove the image for the server 
    fs.unlinkSync(imagePath)


 })

 /**---------------------------------------------------------------
 * @desc get all posts
 * @route /api/post
 * @methode get 
 * @access public
 -----------------------------------------------------------------*/
module.exports.getAllPostsCtrl = asynchandler(async(req,res)=>{
    const Post_per_page = 3 
   const {pageNumber , category}=req.query ;
  
   let posts 
   if (pageNumber){
    posts = await Post.find()
    .skip((pageNumber-1)*Post_per_page)
    .limit(Post_per_page)
    .sort({createdAt:-1})
    .populate("user",["-password"])
   
   }else if (category){
    posts = await Post.find({category})
    .sort({createdAt:-1})
    .populate("user",["-password"])
   }else{
    posts= await Post.find()
    .sort({createdAt:-1})
    .populate("user",["-password"])
    // sort pour trier les nouvelle poste puis les ancian : 1 indique à Mongoose de trier les résultats par ordre croissant du champ et -1 avec prdre decoissant 
   }
   res.status(200).json({message:"all posts is find",data:posts})

})
 /**---------------------------------------------------------------
 * @desc get single post
 * @route /api/post/:id
 * @methode get 
 * @access public
 -----------------------------------------------------------------*/
 module.exports.getsinglePostCtrl = asynchandler(async(req,res)=>{
 const post = await Post.findById(req.params.id)
 .populate("user",["-password"])
 .populate("comments")
 if(!post){
    return res.status(404).json({message:"post not found"})
 }
   res.status(200).json({message:"the single post is",data:post})

})



 /**---------------------------------------------------------------
 * @desc get posts count
 * @route /api/post/count
 * @methode get 
 * @access public
 -----------------------------------------------------------------*/
 module.exports.getPostscountCtrl = asynchandler(async(req,res)=>{
    const count = await Post.countDocuments()
    console.log("count",count)
    res.status(200).json({ message:"post count ",data:count})
   
   })



   /**---------------------------------------------------------------
 * @desc delete post
 * @route /api/post/:id
 * @methode delete
 * @access private (only admin or owner of the post)
 -----------------------------------------------------------------*/
 module.exports.deletePostCtrl = asynchandler(async(req,res)=>{
    const post = await Post.findById(req.params.id)
    if(!post){
       return res.status(404).json({message:"post not found"})
    }
    if (req.user.isAdmin || req.user._id == post.user.toString()){
        await Post.findByIdAndDelete(req.params.id)
        await cloudinaryRemoveImage(post.image.publicid)
        await Comment.deleteMany({postId:post._id})
        res.status(200).json({message:"post has bin deleted successfully",postId:post._id})
    }else {
        res.status(403).json({message:"access denied , forbiden"})
    }

   
   })

   /**---------------------------------------------------------------
 * @desc update Post
 * @route /api/post/:id
 * @methode PUT 
 * @access private (onlyowner of the post)
 -----------------------------------------------------------------*/
 module.exports.updatePostCtrl = asynchandler(async(req,res)=>{
   const {err} = validateUpdatePost(req.body)
   if (err){
      return res.status(400).json({message:err.details[0].message})
   }

   const post = await Post.findById(req.params.id)
   if (! post){
      return res.status(404).json({message:"post not found"})
   }
   if (req.user.id !== post.user.toString()){
      res.status(403).json({message:"access denied , you are not allowed"})
   }

   const newpost = await Post.findByIdAndUpdate(req.params.id,{$set:{
      title:req.body.title,
      description : req.body.description,
      category:req.body.category
   }
   // new : true pour retourner un noveau object
},{new:true}).populate("user","-password").populate("comments")

res.status(200).json({message:"post updated successfuly",data:newpost})


 })



   /**---------------------------------------------------------------
 * @desc update Post Image
 * @route /api/post/upload/:id
 * @methode PUT 
 * @access private (onlyowner of the post)
 -----------------------------------------------------------------*/
 module.exports.updatePostImageCtrl = asynchandler(async(req,res)=>{
   const {err} = validateUpdatePost(req.file)
   if (err){
      return res.status(400).json({message:err.details[0].message})
   }

   const post = await Post.findById(req.params.id)
   if (! post){
      return res.status(404).json({message:"post not found"})
   }
   if (req.user.id !== post.user.toString()){
      res.status(403).json({message:"access denied , you are not allowed"})
   }
   await cloudinaryRemoveImage(post.image.publicid)

   const imagePath = await path.join(__dirname,`../images/${req.file.filename}`)
   const result= await cloudinaryUploadImage(imagePath)
   console.log("imagePath",imagePath)
   const newpostImage = await Post.findByIdAndUpdate(req.params.id,{$set :{
      image:{
         url:result.secure_url ,
         publicid:result.public_id
      }
    
   }},{new:true})



res.status(200).json({message:"post image updatetd succesfully",data:newpostImage})
   fs.unlinkSync(imagePath)

 })



   /**---------------------------------------------------------------
 * @desc toggle like
 * @route /api/post/like/:id
 * @methode PUT 
 * @access private (onlyowner of the post)
 -----------------------------------------------------------------*/
 module.exports.toggleLikesCtrl= asynchandler(async(req,res)=>{
   
   const LoggedInUser = req.user.id 
  const {id : PoistId} = req.params
   let post = await Post.findById(PoistId)
   if (!post){
      return res.status(404).json({message:"post not found"})
   }
   console.log("post.likes",post.likes)
   const PostAlraddyLike =  (post.likes).find((userid)=>
   
      userid.toString() === LoggedInUser
     
   )
   console.log("PostAlraddyLike",PostAlraddyLike)
   if(PostAlraddyLike){
      console.log("post is liked")
      // pull elever l id de user 
      post = await Post.findByIdAndUpdate(PoistId,{$pull:{
         likes:LoggedInUser
      }},{new:true})
   }else {
      console.log("post not liked")
      // push pour ajouter l id de user
      post = await Post.findByIdAndUpdate (PoistId,{$push:{
         likes:LoggedInUser
      }},{new:true})
   }

   return res.status(200).json({message:"likes",data :post,PostAlraddyLike})

 })