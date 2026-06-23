const {
  LandingController,
} = require('../../http/controller/admin/landing.controller');

const router = require('express').Router();

router.post('/add', LandingController.createLandingSection);
router.patch('/edit/:id', LandingController.updateLandingSection);
router.delete('/remove/:id', LandingController.deleteLandingSection);

module.exports = {
  AdminLandingRouter: router,
};
