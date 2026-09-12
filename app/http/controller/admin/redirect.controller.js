const Controller = require("../controller");
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { RedirectModel } = require("../../../model/redirect.model");

class RedirectController extends Controller {

  async addRedirect(req,res,next){

    try{

      const {
        oldUrl,
        newUrl,
        statusCode
      } = req.body;

      const exists = await RedirectModel.findOne({
        oldUrl
      });

      if(exists)
        throw createError.Conflict("این آدرس قبلا ثبت شده است");

      await RedirectModel.create({
        oldUrl,
        newUrl,
        statusCode
      });

      return res.status(StatusCodes.CREATED).json({
        statusCode:201,
        message:"Redirect ثبت شد"
      });

    }catch(err){
      next(err);
    }

  }

  async list(req,res,next){

    try{

      const redirects = await RedirectModel.find({})
        .sort({_id:-1});

      return res.json({
        redirects
      });

    }catch(err){
      next(err);
    }

  }

  async remove(req,res,next){

    try{

      const {id}=req.params;

      await RedirectModel.deleteOne({
        _id:id
      });

      return res.json({
        message:"حذف شد"
      });

    }catch(err){
      next(err);
    }

  }

}

module.exports={
  RedirectController:new RedirectController()
}