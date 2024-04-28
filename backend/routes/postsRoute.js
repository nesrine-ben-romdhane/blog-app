const postController= require("../controllers/postController")
const photoUpload = require("../middleware/photoUpload")
const verify_id = require("../middleware/verify_id")
const { verify_token } = require("../middleware/verify_token")

const route = require("express").Router()
route.post("/",verify_token,photoUpload.single("image"),postController.createPostCtrl)
route.get("/",postController.getAllPostsCtrl)
route.get("/count",postController.getPostscountCtrl)

route.get("/:id",verify_id,postController.getsinglePostCtrl)
route.delete("/:id",verify_id,verify_token,postController.deletePostCtrl)
route.put("/:id",verify_id,verify_token,postController.updatePostCtrl)
route.put("/update_image/:id",verify_id,verify_token,photoUpload.single("image"),postController.updatePostImageCtrl)
route.put("/toggle_like/:id",verify_id,verify_token,postController.toggleLikesCtrl)




module.exports=route