const { RedirectModel } = require("../../model/redirect.model");

async function RedirectMiddleware(req,res,next){
    try{
        const redirect = await RedirectModel.findOne({
            oldUrl:req.path,
            active:true
        });

        if(redirect){
            return res.redirect(
                redirect.statusCode,
                redirect.newUrl
            );
        }

        next();
    }
    catch(err){
        next(err);
    }
}

module.exports={
    RedirectMiddleware
}