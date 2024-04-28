const { getResetPasswordLink, ResetPassword, sendResetPasswordLink } = require("../controllers/passwordCotrollers")

const router = require("express").Router()
router.post("/reset-password-link",sendResetPasswordLink)
router.route("/reset-password/:userId/:token")
    .get(getResetPasswordLink)
    .post(ResetPassword)
module.exports=router