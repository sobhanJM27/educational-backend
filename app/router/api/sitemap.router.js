const router = require("express").Router();
const { SitemapController } = require("../../http/controller/api/sitemap.controller");

router.get("/", SitemapController.generate);

module.exports = {
  SitemapRouter: router,
};
