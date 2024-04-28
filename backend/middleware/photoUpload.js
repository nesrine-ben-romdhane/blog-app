const path = require("path")
const multer = require("multer")

// photo storage

const photoStorage = multer.diskStorage ({
    destination: function (req,file,cb){
        cb(null , path.join(__dirname,"../images"))
    },
    filename : function(req,file,cb){
        if (file){
            cb (null , new Date().toISOString().replace(/:/g, "-")+file.originalname)
        }else{
            cb (null,false)
            // false : n ecrit pas le nom lorsque na pas de fichier
        }
    }
})

// photo upload midelware

const photoUpload = multer({
    storage : photoStorage ,
    fileFilter:function(req,file,cb){
        if (file.mimetype.startsWith("image")){
            // pour specifier le type de image file.mimetype.startsWith("image/png") : accepter seulement les images .png
            cb(null, true)
            // true : for upload fil
        }else {
            cb({message:'unsuported file format'},false)
        }
    },
    limits: {file : 1024 * 1024 } // accepte seulement les image que leur size < = 1 megabite
    
})
module.exports= photoUpload
