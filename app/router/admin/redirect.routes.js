const router=require("express").Router();

const { RedirectController } = require("../../http/controller/admin/redirect.controller");

router.post("/add",RedirectController.addRedirect);

router.get("/list",RedirectController.list);

router.delete("/remove/:id",RedirectController.remove);

module.exports={
 AdminRedirectRouter:router
}