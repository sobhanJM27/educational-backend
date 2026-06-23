const router = require('express').Router();
const {
  SitemapController,
} = require('../../http/controller/admin/sitemap.controller');

router.post('/add', SitemapController.addUrl);
router.delete('/remove/:id', SitemapController.removeUrl);
router.get('/list', SitemapController.list);

module.exports = {
  AdminSitemapRouter: router,
};
