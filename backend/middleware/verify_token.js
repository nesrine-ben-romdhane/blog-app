const jwt = require("jsonwebtoken")
function verify_token (req,res,next){
    const authToken = req.headers.authorization || req.headers.Authorization
    if(authToken){
        const token = authToken.split(" ")[1]
        try{
       const decodedpaload = jwt.verify(token,process.env.JWT_SECRET_KEY)
       req.user = decodedpaload
       next()
        }
        catch{
            return res.status(401).json({message:"invalid token ! , access denied"})
        }

    }else{
        return res.status(401).json({message:"no token provided ! , access denied"})
    }

}


// verify token and admin
function verifyTokenandAdmin(req,res,next){
    verify_token (req,res,()=>{
        if (req.user.isAdmin){
            next()
        }else{
            return res.status(403).json({message:"not allowed , only admin !"})
        }
    })
}

// verify token and himSelf
function verifyTokenandOnlyUser(req,res,next){
    verify_token (req,res,()=>{
        if (req.user.id == req.params.id){
            next()
        }else{
            return res.status(403).json({message:"not allowed , only user himself !"})
        }
    })
}
// verify token and authorizition
function verifyTokenAndAuthorizition(req,res,next){
    verify_token (req,res,()=>{
        if (req.user.id == req.params.id || req.user.isAdmin){
            next()
        }else{
            return res.status(403).json({message:"not allowed , only user himself or admin !"})
        }
    })
}
module.exports={
    verify_token,
    verifyTokenandAdmin,
    verifyTokenandOnlyUser,
    verifyTokenAndAuthorizition
}