const router = require('express').Router();
const {
  CourseController,
} = require('../../http/controller/admin/course.controller');
const { upload } = require('../../module/fileupload');

router.post('/add', CourseController.addCoure);
router.patch('/edit/:id', CourseController.editCourse);
router.put('/categoryCourse', CourseController.categoryCourse);
router.delete('/remove/:id', CourseController.removeCourse);
router.put('/sortByNumber', CourseController.sortBlog);
// router.get("/getCoursePersonalDevelopment",CourseController.getCoursePersonalDevelopment)
// router.get("/getCourseFanbayan",CourseController.getCourseFanbayan)

module.exports = {
  AdminCourseRouter: router,
};
