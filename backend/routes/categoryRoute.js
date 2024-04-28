const router = require("express").Router()
const categoryControllers = require("../controllers/categoryControllers")
const verify_id = require("../middleware/verify_id")
const { verifyTokenandAdmin } = require("../middleware/verify_token")



router.route("/")
   .post(verifyTokenandAdmin,categoryControllers.CreateCategoryCtrl)
   .get(categoryControllers.getAllCategoryCtrl)
router.route("/:id")
    .delete(verify_id,verifyTokenandAdmin,categoryControllers.deleteCategoryCtrl)





module.exports=router