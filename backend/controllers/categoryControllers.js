const {Category,validateCreateCategory}= require("../models/Category")
const asynchandller = require("express-async-handler")

/**---------------------------------------------------------------
 * @desc create new category
 * @route /api/cathegories/
 * @methode post 
 * @access private (only admin)
 -----------------------------------------------------------------*/

 module.exports.CreateCategoryCtrl= asynchandller(async(req,res)=>{
  
    const {error}=validateCreateCategory(req.body)
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    const category = await Category.create({
        title:req.body.title,
        user:req.user.id
    })
   
    res.status(201).json({message:"category has been created successfully",data:category})

 })


 /**---------------------------------------------------------------
 * @desc get all categories
 * @route /api/categories/
 * @methode get
 * @access public 
 -----------------------------------------------------------------*/

 module.exports.getAllCategoryCtrl= asynchandller(async(req,res)=>{
    
    const categories = await Category.find()
    res.status(200).json({message:"all categories",data:categories})

 })

  /**---------------------------------------------------------------
 * @desc delete category
 * @route /api/categories/:id
 * @methode delete
 * @access private (only admin) 
 -----------------------------------------------------------------*/

 module.exports.deleteCategoryCtrl= asynchandller(async(req,res)=>{
    console.log("category id",req.params.id)
    const category = await Category.findById(req.params.id)
    console.log("category",category)
    if (!category){
        return res.status(404).json({message:"category not found"})
    }
    console.log("category avant deleted",req.params.id)
   const categoryDeleted = await Category.findOneAndDelete({_id:req.params.id})
   console.log("category deleted",categoryDeleted._id)
    res.status(200).json({message:"category has been deleted successfully",data:categoryDeleted})
    
 })
