const cloudinary = require("cloudinary")
cloudinary.config ({
    cloud_name: "dg7lsvox7" ,
    api_key:"322591995512185",
    api_secret:"DbFtxka1oe-O5J0nlOI_IDzbrbs"
});


// cloudinary upload image
 const cloudinaryUploadImage = async (fileToUpload)=>{
    
    try{
    //    console.log ("file to apload",fileToUpload)
       const data = await cloudinary.uploader.upload(fileToUpload,{
        resource_type:'auto',
       });
       return data

    }catch(error){
        throw new Error ("internal server error (cloudinary)!")
        console.log(error)
    }
}


// cloudinary Remove image
 const cloudinaryRemoveImage = async (imagePublicId)=>{
    try{
        const result = await cloudinary.uploader.destroy(imagePublicId)
        return result;
    }catch(error){
        throw new Error ("internal server error (cloudinary)!")
        console.log(error)
    }
}
// cloudinary Remove multiple image
const cloudinaryRemoveMultipleImage = async (PublicIds)=>{
    try{
        const result = await cloudinary.v2.api.delete_resources(PublicIds)
        return result;
    }catch(error){
        throw new Error ("internal server error (cloudinary)!")
        console.log(error)
    }
}
module.exports={
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImage
}