const Controller = require('../controller');
const { SitemapModel } = require('../../../model/sitemap.model');
const createError = require('http-errors');
const { StatusCodes } = require('http-status-codes');

class SitemapController extends Controller {
  async addUrl(req, res, next) {
    try {
      const { url, priority, changefreq } = req.body;

      const sitemap = await SitemapModel.create({
        url,
        priority,
        changefreq,
      });

      return res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: 'لینک اضافه شد',
        sitemap,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeUrl(req, res, next) {
    try {
      const { id } = req.params;

      const result = await SitemapModel.deleteOne({ _id: id });

      if (result.deletedCount === 0)
        throw createError.NotFound('لینک پیدا نشد');

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'لینک حذف شد',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const urls = await SitemapModel.find({});

      return res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        urls,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  SitemapController: new SitemapController(),
};
