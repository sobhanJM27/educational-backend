const { ApiBlogController } = require("../../http/controller/api/blog.controller");

const router = require("express").Router();
router.get("/list", ApiBlogController.getAllBlog)
router.get("/getBlog/:id", ApiBlogController.getOneBlog)
router.get("/getOtherArticles",ApiBlogController.getOtherArticles)
router.get("/getEducationalArticles",ApiBlogController.getEducationalArticles)
module.exports = {
    ApiBlogRouter: router
}