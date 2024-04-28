const router = require("express").Router();
const authControllers= require("../controllers/authControllers")
router.post("/register",authControllers.registerUserController)
router.post("/login",authControllers.loginUserController)
router.get("/:userId/verify/:token",authControllers.verifyUserAccountCtrl)






module.exports=router