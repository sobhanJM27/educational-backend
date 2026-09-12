const { AdminCategoryRouter } = require('./category.router');
const { AdminChapterRouter } = require('./chapter.router');
const { AdminCourseRouter } = require('./course.router');
const { AdminEpisodeRouter } = require('./episode.router');
const { AdminBookmarkRouter } = require('./bookmark.router');
const { AdminFaqRouter } = require('./faq.router');
const { AdminBookRouter } = require('./book.router');
const { AdminBlogRouter } = require('./blog.router');
const { AdminImageRouter } = require('./image.router');
const { checkRole } = require('../../module/function');
const { verifyJWT } = require('../../http/middleware/JWT');
const { AdminViewRouter } = require('./view.router');
const { AdminCodeRouter } = require('./discountCode.router');
const { AdminEventRouter } = require('./event.router');
const { AdminSliderRouter } = require('./slider.router');
const { AdminLandingRouter } = require('./landing.router');
const { AdminSitemapRouter } = require('./sitemap.router');
const { AdminRedirectRouter } = require('./redirect.routes');

const router = require('express').Router();
router.use('/image', verifyJWT, checkRole('ADMIN'), AdminImageRouter);
router.use('/book', verifyJWT, checkRole('ADMIN'), AdminBookRouter);
router.use('/blog', verifyJWT, checkRole('ADMIN'), AdminBlogRouter);
router.use('/courses', verifyJWT, checkRole('ADMIN'), AdminCourseRouter);
router.use('/category', verifyJWT, checkRole('ADMIN'), AdminCategoryRouter);
router.use('/chapter', verifyJWT, checkRole('ADMIN'), AdminChapterRouter);
router.use('/episode', verifyJWT, checkRole('ADMIN'), AdminEpisodeRouter);
router.use('/bookmark', verifyJWT, checkRole('ADMIN'), AdminBookmarkRouter);
router.use('/faq', verifyJWT, checkRole('ADMIN'), AdminFaqRouter);
router.use('/view', AdminViewRouter);
router.use('/code', AdminCodeRouter);
router.use('/event', AdminEventRouter);
router.use('/slider', AdminSliderRouter);
router.use('/landing', verifyJWT, checkRole('ADMIN'), AdminLandingRouter);
router.use('/sitemap', AdminSitemapRouter);
router.use("/redirect", AdminRedirectRouter);

module.exports = {
  AdminRoute: router,
};
