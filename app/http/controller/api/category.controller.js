const createError = require("http-errors");
const Controller = require("../controller");
const { StatusCodes:HttpStatus} = require("http-status-codes");
const { CategoryModel } = require("../../../model/categories.model");

class ApiControllerCategory extends Controller {

    // async addCategory(req, res, next){
    //     try {
            
    //     } catch (error) {
    //         next(error)
    //     }
    // }
    async getAllCategory(req, res, next){
        try {
            const categories = await CategoryModel.find({})
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                categories
            })
        } catch (error) {
            next(error)
        }
    }
    // async getCategoryByTitle(req, res, next){
    //     try {
    //         const {id, title} = req.body;
    //         const category = await CategoryModel.findOne({_id: id })
    //         return res.status(HttpStatus.OK).json({
    //             statusCode: HttpStatus.OK,
    //             category
    //         })
    //     } catch (error) {
    //         next(error)
    //     }
    // }
}

module.exports = {
    ApiControllerCategory: new ApiControllerCategory()
}