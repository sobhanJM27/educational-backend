const Controller = require("../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const createError = require("http-errors");
const { CouresModel } = require("../../../model/course.model");
const { CommentContoller } = require("../api/comment.controller");
const { related, copyObject } = require("../../../module/function");

class ApiCourseController extends Controller {
  async getAllCourse(req, res, next) {
    try {
      const { search } = req?.query || "";
      let courses;
      if (search) {
        courses = await CouresModel.find({
          $text: {
            $search: new RegExp(search, "ig")
          }
        })
      } else {
        courses = await CouresModel.find({}).sort({ score: 1 });
      }
      for (var i = 0; i < courses.length; i++) {
        console.log(courses[i].title)
        console.log(courses[i].score)
      }
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        courses
      })
    } catch (error) {
      next(error)
    }
  }
  async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      const findcourse = await CouresModel.findOne({ _id: id }).populate({ path: "comments.user", select: "first_name last_name" })
      if (!findcourse) throw createError.NotFound("دوره ای یافت نشد")
      let course = copyObject(findcourse)
      const relateds = await related(CouresModel, course._id);
      course["relateds"] = relateds
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        course
      })
    } catch (error) {
      next(error)
    }
  }
  async addComment(req, res, next) {
    await CommentContoller.addComment(req, res, next, CouresModel)
  }
 
  async getCourseFanbayan(req, res, next) {
    try {
      const result = await CouresModel.find({ categoryCourse: "آموزش تخصصی فن بیان برای تمام سنین" }).sort({ score: 1 });
      // console.log(result)
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        result
      })
    } catch (error) {
      next(error)
    }
  }
  async getCoursePersonalDevelopment(req, res, next) {
    try {
      const result = await CouresModel.find({ categoryCourse: "آموزش مهارت های رشد و توسعه ی فردی" }).sort({ score: 1 });
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        result
      })
    } catch (error) {
      next(error)
    }
  }
  async getCourseSpecialPackagest(req, res, next) {
    try {
      const result = await CouresModel.find({ categoryCourse: "بسته های ویژه" }).sort({ score: 1 });
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        result
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = {
  ApiCourseController: new ApiCourseController()
}
