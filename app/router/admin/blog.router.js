const {
  BlogController,
} = require('../../http/controller/admin/blog.controller');
const { upload } = require('../../module/fileupload');
const router = require('express').Router();

router.post('/add', BlogController.addBLog);
router.delete('/remove/:blogID', BlogController.removeBlog);
router.put(
  '/edit/:blogID',
  upload.array('images', 10),
  BlogController.editBlog,
);
router.put('/sortByNumber', BlogController.sortBlog);
router.put('/categoryBlog', BlogController.categoryBlog);
router.patch('/robots', BlogController.updateBlogRobots);

module.exports = {
  AdminBlogRouter: router,
};
