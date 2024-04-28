const nodemailler = require("nodemailer")
module.exports= async (userEmail,subject,htmlTemplate)=>{
    try{
        const transporter = nodemailler.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL_APP_ADRESS , //sender
                pass:process.env.APP_EMAIL_PASWORD
            }
        })
        const mailOption = {
            from :process.env.EMAIL_APP_ADRESS , //sender
            to : userEmail,
            subject:subject ,
            html : htmlTemplate
        }
        const info = await transporter.sendMail(mailOption)
        console.log("email sent:",info.response)
      
    }
    catch(err){
        console.log(err)
        throw new Error ("Internal Server Error (nodemailer")
        
    }
}