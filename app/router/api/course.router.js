const {
  ApiCourseController,
} = require('../../http/controller/api/course.controller');
const router = require('express').Router();

router.get('/list', ApiCourseController.getAllCourse);
router.get('/getCourse/:id', ApiCourseController.getCourseById);
router.get(
  '/getCoursePersonalDevelopment',
  ApiCourseController.getCoursePersonalDevelopment,
);
router.get('/getCourseFanbayan', ApiCourseController.getCourseFanbayan);
router.get('/getCourseSpecial', ApiCourseController.getCourseSpecialPackagest);

module.exports = {
  ApiCourseRouter: router,
};
