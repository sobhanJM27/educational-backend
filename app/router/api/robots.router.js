const router = require("express").Router();

router.get("/", (req, res) => {
  const baseUrl = "https://saberzarei.com";

  const robots = `
User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/sitemap.xml
`.trim();

  res.type("text/plain");
  res.send(robots);
});

module.exports = {
  RobotsRouter: router,
};
