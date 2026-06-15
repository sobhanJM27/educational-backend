const { EventModl } = require("../../../model/event.model");
const Controller = require("../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const createError = require("http-errors");
const { SliderModel } = require("../../../model/slider.model");


class SliderController extends Controller{
    async addSlider(req, res, next){
        try {
            let {images} = req.body;
            //const originimage = images.map(e => e.slice(33, e.length))
            const slider = await SliderModel.create({images})
            return res.status(HttpStatus.CREATED).json({
                statusCode: HttpStatus.CREATED,
                message: "ثبت شد"
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteSlider(req, res, next){
        try {
            const {id} = req.params;
            const result = await SliderModel.deleteOne({_id: id})
            if(!result) throw createError.InternalServerError("حذف  موفقیت امیز نبود")
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: " با موفقیت حذف شد"
        })
        } catch (error) {
            next(error)
        }
    }
    async getAll(req, res, next){
        const reslut = await SliderModel.find({})
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            reslut
        })
    }
}


module.exports = {
    SliderController : new SliderController(),
}










