const Controller = require("../controller");
const { SitemapModel } = require("../../../model/sitemap.model");

class SitemapController extends Controller {
  async generate(req, res, next) {
    try {
      const urls = await SitemapModel.find({});

      let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      urls.forEach((item) => {
        xml += `
      <url>
        <loc>${item.url}</loc>
        <changefreq>${item.changefreq}</changefreq>
        <priority>${item.priority}</priority>
        <lastmod>${item.updatedAt?.toISOString() || new Date().toISOString()}</lastmod>
      </url>
      `;
      });

      xml += `</urlset>`;

      res.header("Content-Type", "application/xml");
      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  SitemapController: new SitemapController(),
};
