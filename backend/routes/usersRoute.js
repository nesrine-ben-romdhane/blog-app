const router = require("express").Router();
const UserController = require("../controllers/UserController");
const { verifyTokenandAdmin,verifyTokenandOnlyUser, verify_token,verifyTokenAndAuthorizition } = require("../middleware/verify_token");
const validateUserId = require("../middleware/verify_id");
const photoUpload = require("../middleware/photoUpload");



router.get("/profile",verifyTokenandAdmin , UserController.getAllUserCtrl)
router.get("/profile/:id", validateUserId,UserController.getUserCtrl)
router.put("/profile/:id", validateUserId,verifyTokenandOnlyUser,UserController.updateUserProfile)
router.delete("/profile/:id", validateUserId,verifyTokenAndAuthorizition,UserController.deleteUserProfileCtrl)

router.get("/count",verifyTokenandAdmin , UserController.getUserscountCtrl)
router.post("/profile/profil-photo-upload",photoUpload.single("image"),verify_token,UserController.profilePhotoUploadCtrl)


module.exports=router