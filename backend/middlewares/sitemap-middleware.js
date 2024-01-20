const fs = require('fs');
const path = require('path');
const PostModel = require('../models/Post');

const domain = "sercan.io";

async function getAllPostSlugs() {
  try {
    const posts = await PostModel.find({ isVisible: true });
    return posts.map(post => ({ slug: post.slug, date: post.date }));
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    throw error;
  }
}

async function generateSitemapXML(req, res, next) {
  try {
    const now = new Date().toISOString();
    const publicPath = path.join(__dirname, '../public');
    const sitemapPath = path.join(publicPath, 'sitemap.xml');
    const slugs = await getAllPostSlugs();
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
          <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
              <loc>https://${domain}/</loc>
              <lastmod>${now}</lastmod>
              <priority>1</priority>
            </url>
            <url>
              <loc>https://${domain}/me</loc>
              <lastmod>${now}</lastmod>
              <priority>0.8</priority>
            </url>
            ${slugs.map(slug => `
              <url>
                <loc>https://${domain}/post/${slug.slug}</loc>
                <lastmod>${new Date(slug.date).toISOString()}</lastmod>
                <priority>0.8</priority>
              </url>
            `).join('')}
          </urlset>`;

    fs.writeFileSync(sitemapPath, sitemapContent, { encoding: 'utf8', flag: 'w' });

    // Continue to the next middleware
    next();
  } catch (error) {
    console.error('Error generating or updating sitemap:', error);
    next(error);
  }
}

// Export the middleware function
module.exports = generateSitemapXML;
