const createError = require('http-errors');
const { StatusCodes: HttpStatus } = require('http-status-codes');
const { LandingModel } = require('../../../model/landing.model');

class LandingController {
  async createLandingSection(req, res, next) {
    try {
      const {
        title,
        subtitle,
        section1Title,
        section1Text1,
        section1Text2,
        section1Text3,
        formTitle,
        formTitle2,
        packTitle,
        packText1,
        packText2,
        courseTitle,
        courseText1,
        courseText2,
        courseText3,
        courseId,
        coursePrice,
        coursePriceWithDiscount,
        faqs,
        videos,
        showTopForm,
        showBottomForm,
        showTelegramButton,
        showWatsupButton,
      } = req.body;

      const newSection = await LandingModel.create({
        title,
        subtitle,
        section1Title,
        section1Text1,
        section1Text2,
        section1Text3,
        formTitle,
        formTitle2,
        packTitle,
        packText1,
        packText2,
        courseTitle,
        courseText1,
        courseText2,
        courseText3,
        courseId,
        coursePrice,
        coursePriceWithDiscount,
        faqs,
        videos,
        showTopForm,
        showBottomForm,
        showTelegramButton,
        showWatsupButton,
      });

      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'لندینگ جدید با موفقیت ایجاد شد',
        data: newSection,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLandingSection(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const section = await LandingModel.findById(id);
      if (!section) throw createError.NotFound('لندینگ مورد نظر یافت نشد');

      await LandingModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true },
      );

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'لندینگ با موفقیت ویرایش شد',
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLandingSection(req, res, next) {
    try {
      const { id } = req.params;
      const section = await LandingModel.findById(id);
      if (!section) throw createError.NotFound('لندینگ یافت نشد');

      await LandingModel.deleteOne({ _id: id });
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'لندینگ با موفقیت حذف شد',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  LandingController: new LandingController(),
};
