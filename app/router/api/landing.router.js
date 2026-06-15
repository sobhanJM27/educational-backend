const { LandingController } = require("../../http/controller/api/landing.controller");

const router = require("express").Router();

router.get("/getLanding", LandingController.getAllLandingSections);

module.exports = {
  ApiLandingRouter: router,
};
