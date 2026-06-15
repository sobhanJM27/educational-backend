const { SliderController } = require("../../http/controller/admin/slider.controller");



const router = require("express").Router();
router.post("/add", SliderController.addSlider)
router.delete("/delete/:id", SliderController.deleteSlider)
router.get("/list", SliderController.getAll)



module.exports = {
    AdminSliderRouter: router
}