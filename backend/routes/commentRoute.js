const router = require("express").Router()
const commentController = require("../controllers/commentController")
const verify_id = require("../middleware/verify_id")
const { verify_token, verifyTokenandAdmin, verifyTokenAndAuthorizition } = require("../middleware/verify_token")

router.route("/")
                .post(verify_token,commentController.CreateCommentCtrl)
                .get(verifyTokenandAdmin,commentController.getAllCommentsCtrl)
router.route("/:id")
                .delete(verify_id,verify_token,commentController.deleteCommentCtrl)
                .put(verify_id , verify_token,commentController.updateCommentCtrl)



module.exports=router ;