const { StatusCodes: HttpStatus } = require("http-status-codes");
const { LandingModel } = require("../../../model/landing.model");

class LandingController {
  async getAllLandingSections(req, res, next) {
    try {
      const sections = await LandingModel.find({})
        
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: sections,
      });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = {
  LandingController: new LandingController(),
};
